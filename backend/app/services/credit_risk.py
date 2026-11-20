
from uuid import UUID

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.shop import Shop
from app.models.transaction import Transaction
from app.models.user import User
from app.ml.features import extract_customer_features
from decimal import Decimal

from app.ml.risk_assessment import assess_customer_risk
from app.schemas.credit_risk import (
    CreditRiskResponse,
    CreditRiskLevel
)


async def get_customer_ml_features(
    customer_id: UUID,
    current_user: User,
    db: AsyncSession
) -> dict:

    # Verify customer belongs to logged-in user's shop
    result = await db.execute(
        select(Customer.id)
        .join(Shop, Customer.shop_id == Shop.id)
        .where(
            Customer.id == customer_id,
            Shop.owner_id == current_user.id
        )
    )

    customer = result.scalar_one_or_none()

    if customer is None:
        raise ValueError("Customer not found in your shop")

    # Fetch customer's complete transaction history
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.customer_id == customer_id
        )
        .order_by(
            desc(Transaction.transaction_date)
        )
    )

    transactions = result.scalars().all()

    # Extract ML features
    features = extract_customer_features(transactions)

    return features




async def analyze_customer_credit_risk(
    customer_id: UUID,
    current_user: User,
    db: AsyncSession
) -> CreditRiskResponse:

    # Extract features from actual transaction history
    features = await get_customer_ml_features(
        customer_id=customer_id,
        current_user=current_user,
        db=db
    )

    # Perform explainable risk assessment
    assessment = assess_customer_risk(features)

    # Prepare structured response
    return CreditRiskResponse(
        customer_id=customer_id,
        risk_level=CreditRiskLevel(
            assessment["risk_level"]
        ),
        risk_score=assessment["risk_score"],
        total_transactions=features["total_transactions"],
        total_credit_amount=Decimal(
            str(features["total_credit_amount"])
        ),
        total_payment_amount=Decimal(
            str(features["total_payment_amount"])
        ),
        outstanding_balance=Decimal(
            str(features["outstanding_balance"])
        ),
        explanation=assessment["explanation"],
        recommendation=assessment["recommendation"]
    )
