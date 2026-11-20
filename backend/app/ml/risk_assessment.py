
from app.ml.features import validate_customer_data


def assess_customer_risk(features: dict) -> dict:

    # First check whether sufficient data is available
    validation = validate_customer_data(features)

    if not validation["is_sufficient"]:
        return {
            "risk_level": "insufficient_data",
            "risk_score": None,
            "explanation": [
                validation["reason"]
            ],
            "recommendation": (
                "Collect more transaction and repayment history "
                "before assessing credit risk."
            )
        }

    repayment_ratio = features["repayment_ratio"]
    outstanding_balance = features["outstanding_balance"]

    explanation = []

    # Transparent baseline rules
    if repayment_ratio >= 0.80:
        risk_level = "low"
        explanation.append(
            "Repayment ratio is 80% or higher."
        )

    elif repayment_ratio >= 0.50:
        risk_level = "medium"
        explanation.append(
            "Repayment ratio is between 50% and 80%."
        )

    else:
        risk_level = "high"
        explanation.append(
            "Repayment ratio is below 50%."
        )

    if outstanding_balance > 0:
        explanation.append(
            f"Outstanding balance is Rs. {outstanding_balance:.2f}."
        )

    elif outstanding_balance < 0:
        explanation.append(
            "Customer has paid more than the recorded credit amount."
        )

    else:
        explanation.append(
            "Customer has no outstanding balance."
        )

    recommendations = {
        "low": "Customer shows a relatively strong repayment pattern. Review normal credit limits.",
        "medium": "Review repayment history before extending additional credit.",
        "high": "Consider limiting additional credit and reviewing outstanding dues."
    }

    return {
        "risk_level": risk_level,
        "risk_score": None,
        "explanation": explanation,
        "recommendation": recommendations[risk_level]
    }
