
from datetime import datetime, timezone
from decimal import Decimal
from types import SimpleNamespace

from app.models.transaction import TransactionType
from app.ml.features import (
    extract_customer_features,
    validate_customer_data
)


def test_customer_feature_extraction():

    now = datetime.now(timezone.utc)

    transactions = [
        SimpleNamespace(
            transaction_type=TransactionType.CREDIT,
            amount=Decimal("1000.00"),
            transaction_date=now
        ),
        SimpleNamespace(
            transaction_type=TransactionType.PAYMENT,
            amount=Decimal("400.00"),
            transaction_date=now
        ),
        SimpleNamespace(
            transaction_type=TransactionType.CREDIT,
            amount=Decimal("500.00"),
            transaction_date=now
        ),
        SimpleNamespace(
            transaction_type=TransactionType.PAYMENT,
            amount=Decimal("400.00"),
            transaction_date=now
        )
    ]

    features = extract_customer_features(transactions)

    assert features["total_transactions"] == 4
    assert features["credit_count"] == 2
    assert features["payment_count"] == 2
    assert features["total_credit_amount"] == 1500.0
    assert features["total_payment_amount"] == 800.0
    assert features["outstanding_balance"] == 700.0
    assert round(features["repayment_ratio"], 2) == 0.53


def test_empty_transaction_history():

    features = extract_customer_features([])

    assert features["total_transactions"] == 0
    assert features["outstanding_balance"] == 0.0
    assert features["repayment_ratio"] == 0.0
    assert features["days_since_last_payment"] is None


def test_customer_data_validation():

    features = {
        "total_transactions": 5,
        "payment_count": 2
    }

    result = validate_customer_data(features)

    assert result["is_sufficient"] is True
