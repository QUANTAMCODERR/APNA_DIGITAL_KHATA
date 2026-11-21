
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
    """Normalize names for case-insensitive and punctuation-insensitive matching."""
    name = name.casefold().strip()
    name = re.sub(r"[^\w\s]", " ", name)
    return " ".join(name.split())


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

    result = await db.execute(
        select(Shop).where(Shop.owner_id == current_user.id)
    )
    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Shop not found.")

    result = await db.execute(
        select(Customer).where(Customer.shop_id == shop.id)
    )
    all_customers = result.scalars().all()

    input_name = normalize_name(customer_name)

    # First priority: exact normalized name match.
    exact_matches = [
        customer
        for customer in all_customers
        if normalize_name(customer.full_name) == input_name
    ]

    if len(exact_matches) == 1:
        return CustomerMatchResponse(
            status="matched",
            customers=[
                MatchedCustomerResponse.model_validate(exact_matches[0])
            ],
        )

    if len(exact_matches) > 1:
        return CustomerMatchResponse(
            status="multiple_matches",
            customers=[
                MatchedCustomerResponse.model_validate(customer)
                for customer in exact_matches
            ],
        )

    # Second priority: conservative fuzzy matching.
    scored_customers = []

    for customer in all_customers:
        stored_name = normalize_name(customer.full_name)

        score = SequenceMatcher(
            None,
            input_name,
            stored_name,
        ).ratio()

        if score >= 0.85:
            scored_customers.append((score, customer))

    scored_customers.sort(
        key=lambda item: item[0],
        reverse=True,
    )

    if not scored_customers:
        return CustomerMatchResponse(
            status="not_found",
            customers=[],
        )

    best_score = scored_customers[0][0]

    # If the top candidates are too close, do not guess.
    ambiguous_matches = [
        customer
        for score, customer in scored_customers
        if best_score - score < 0.08
    ]

    if len(ambiguous_matches) > 1:
        return CustomerMatchResponse(
            status="multiple_matches",
            customers=[
                MatchedCustomerResponse.model_validate(customer)
                for customer in ambiguous_matches
            ],
        )

    return CustomerMatchResponse(
        status="matched",
        customers=[
            MatchedCustomerResponse.model_validate(
                scored_customers[0][1]
            )
        ],
    )
