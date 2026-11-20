
import json

from groq import AsyncGroq
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.voice import VoiceTransactionExtraction


client = AsyncGroq(
    api_key=settings.GROQ_API_KEY
)


SYSTEM_PROMPT = """
You are an AI assistant for a digital business ledger.

Your task is to extract transaction information from
Hindi, Marathi, English, and Hinglish text.

Return ONLY valid JSON with these fields:

{
    "customer_name": "string",
    "transaction_type": "credit or payment",
    "amount": 0,
    "description": "string or null",
    "due_date": "ISO 8601 datetime or null"
}

Rules:

1. If money is given to a customer as udhar,
   classify it as credit.

2. If a customer returns or pays money,
   classify it as payment.

3. Extract the customer's actual name.
   Do not invent customer names.

4. Extract the exact transaction amount.
   Never guess a missing amount.

5. If the amount or customer name is missing or unclear,
   return an empty JSON object: {}.

6. Do not invent a due date.
   Return null if no due date is mentioned.

7. Preserve the original meaning of the description.

8. Never create or save transactions.
   Your job is only information extraction.
"""


async def extract_transaction_details(
    transcribed_text: str
) -> VoiceTransactionExtraction:

    if not transcribed_text.strip():
        raise ValueError("Transcribed text cannot be empty.")

    response = await client.chat.completions.create(
        model=settings.GROQ_CHAT_MODEL,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": transcribed_text
            }
        ],
        temperature=0,
        response_format={
            "type": "json_object"
        }
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("AI returned an empty response.")

    try:
        extracted_data = json.loads(content)

        return VoiceTransactionExtraction.model_validate(
            extracted_data
        )

    except (json.JSONDecodeError, ValidationError) as error:
        raise ValueError(
            "AI could not extract valid transaction details."
        ) from error
