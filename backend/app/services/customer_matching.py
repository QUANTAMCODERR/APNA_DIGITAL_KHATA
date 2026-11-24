
from difflib import SequenceMatcher
import re

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.shop import Shop
from app.models.user import User

from app.schemas.voice import (
    CustomerMatchResponse,
    MatchedCustomerResponse,
)


def normalize_name(name: str) -> str:
    """Normalize names for case-insensitive matching."""
    name = name.casefold().strip()
    name = re.sub(r"[^\w\s]", " ", name)
    return " ".join(name.split())


def match_name_tokens(
    input_tokens: list[str],
    stored_tokens: list[str],
) -> float | None:
    """
    Match input tokens against different stored-name tokens.

    Supports:
    - Exact token matching
    - First-name matching
    - Partial surname matching
    - Initial matching
    - Conservative fuzzy matching
    """

    if not input_tokens or len(input_tokens) > len(stored_tokens):
        return None

    used_tokens: set[int] = set()
    scores: list[float] = []

    for input_token in input_tokens:
        best_score = 0.0
        best_index = None

        for index, stored_token in enumerate(stored_tokens):
            if index in used_tokens:
                continue

            score = 0.0

            # Exact token match
            if input_token == stored_token:
                score = 1.0

            # Initial matching: Krishna B -> Krishna Burande
            elif (
                len(input_token) == 1
                and stored_token.startswith(input_token)
            ):
                score = 0.90

            # Partial prefix matching
            elif (
                len(input_token) >= 3
                and stored_token.startswith(input_token)
            ):
                score = 0.95

            # Conservative spelling similarity
            elif len(input_token) >= 4:
                similarity = SequenceMatcher(
                    None,
                    input_token,
                    stored_token,
                ).ratio()

                if similarity >= 0.85:
                    score = similarity

            if score > best_score:
                best_score = score
                best_index = index

        if best_index is None:
            return None

        used_tokens.add(best_index)
        scores.append(best_score)

    return sum(scores) / len(scores)


async def match_customer(
    customer_name: str,
    current_user: User,
    db: AsyncSession,
) -> CustomerMatchResponse:

    if not customer_name or not customer_name.strip():
        return CustomerMatchResponse(
            status="not_found",
            customers=[],
        )

    # Get the shop belonging to the authenticated user.
    result = await db.execute(
        select(Shop).where(Shop.owner_id == current_user.id)
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Shop not found.")

    # Never search customers outside the current shop.
    result = await db.execute(
        select(Customer).where(Customer.shop_id == shop.id)
    )

    all_customers = result.scalars().all()

    input_name = normalize_name(customer_name)
    input_tokens = input_name.split()

    if not input_tokens:
        return CustomerMatchResponse(
            status="not_found",
            customers=[],
        )

    # Priority 1: Exact full-name match.
    exact_matches = [
        customer
        for customer in all_customers
        if normalize_name(customer.full_name) == input_name
    ]

    if exact_matches:
        return CustomerMatchResponse(
            status=(
                "matched"
                if len(exact_matches) == 1
                else "multiple_matches"
            ),
            customers=[
                MatchedCustomerResponse.model_validate(customer)
                for customer in exact_matches
            ],
        )

    # Priority 2: Token-based matching.
    scored_customers = []

    for customer in all_customers:
        stored_name = normalize_name(customer.full_name)
        stored_tokens = stored_name.split()

        score = match_name_tokens(
            input_tokens,
            stored_tokens,
        )

        if score is not None:
            scored_customers.append((score, customer))

    if not scored_customers:
        return CustomerMatchResponse(
            status="not_found",
            customers=[],
        )

    # Highest similarity first.
    scored_customers.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    # Keep candidates with meaningful matching scores.
    best_score = scored_customers[0][0]

    relevant_candidates = [
        customer
        for score, customer in scored_customers
        if score >= 0.85 and best_score - score <= 0.15
    ]

    # Never guess between multiple customers.
    if len(relevant_candidates) > 1:
        return CustomerMatchResponse(
            status="multiple_matches",
            customers=[
                MatchedCustomerResponse.model_validate(customer)
                for customer in relevant_candidates[:10]
            ],
        )

    # One candidate remains.
    return CustomerMatchResponse(
        status="matched",
        customers=[
            MatchedCustomerResponse.model_validate(
                relevant_candidates[0]
            )
        ],
    )
