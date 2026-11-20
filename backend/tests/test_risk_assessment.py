
from app.ml.risk_assessment import assess_customer_risk


def test_insufficient_data():

    features = {
        "total_transactions": 4,
        "payment_count": 1,
        "repayment_ratio": 0.40,
        "outstanding_balance": 1200.0
    }

    result = assess_customer_risk(features)

    assert result["risk_level"] == "insufficient_data"
    assert result["risk_score"] is None


def test_high_risk_customer():

    features = {
        "total_transactions": 5,
        "payment_count": 2,
        "repayment_ratio": 0.36,
        "outstanding_balance": 1400.0
    }

    result = assess_customer_risk(features)

    assert result["risk_level"] == "high"
    assert result["risk_score"] is None


def test_low_risk_customer():

    features = {
        "total_transactions": 10,
        "payment_count": 5,
        "repayment_ratio": 0.90,
        "outstanding_balance": 100.0
    }

    result = assess_customer_risk(features)

    assert result["risk_level"] == "low"
    assert result["risk_score"] is None
