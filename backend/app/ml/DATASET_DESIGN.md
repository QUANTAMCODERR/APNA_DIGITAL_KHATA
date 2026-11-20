
# Customer Credit Risk - ML Dataset Design

## 1. Objective

Predict customer repayment behaviour using
historical credit and payment information.

## 2. Input Features

| Feature | Description |
|---|---|
| total_transactions | Total transactions |
| credit_count | Number of credit transactions |
| payment_count | Number of payments |
| total_credit_amount | Total credit amount |
| total_payment_amount | Total payment amount |
| outstanding_balance | Remaining balance |
| repayment_ratio | Payment / Credit |
| average_credit_amount | Average credit amount |
| days_since_last_payment | Days since last payment |

## 3. Target Label

Column: repayment_outcome

- 0 = Repaid within agreed due date
- 1 = Repayment overdue beyond the defined grace period

## 4. Data Requirements

- Actual historical customer records.
- Credit due dates.
- Repayment completion information.
- Defined repayment observation period.
- Sufficient labelled examples for both classes.

## 5. Planned ML Algorithm

- Logistic Regression
- Decision Tree Classifier

## 6. Model Evaluation

- Train/Test Split
- Precision
- Recall
- F1 Score
- Confusion Matrix

## 7. Important Rules

- Never generate fake customer labels.
- Never train on future information.
- Do not predict when historical data is insufficient.
- Keep risk explanations understandable.
- Treat predictions as decision-support information.
