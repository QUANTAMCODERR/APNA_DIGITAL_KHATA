
import json

from groq import AsyncGroq
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.voice import VoiceTransactionExtraction


client = AsyncGroq(
    api_key=settings.GROQ_API_KEY
)



SYSTEM_PROMPT = """
You are an intelligent AI transaction extraction assistant
for a multilingual digital business ledger.

You receive spoken transaction text transcribed by a speech
recognition system.

You must understand:
- Hindi (Devanagari)
- Marathi (Devanagari)
- English
- Hinglish
- Mixed Hindi-English and Marathi-English sentences

Your task is to extract transaction information and return
ONLY valid JSON.

Required JSON structure:

{
    "customer_name": "string or null",
    "transaction_type": "credit or payment or null",
    "amount": 0,
    "description": "string or null",
    "due_date": "ISO 8601 datetime or null"
}

IMPORTANT CUSTOMER NAME RULES:

1. Extract the actual customer name from the sentence.

2. Always return customer_name in English Latin script,
   even when the input name is written in Hindi or Marathi
   Devanagari script.

3. Transliterate names phonetically.
   Do not translate names based on their meaning.

4. Preserve the closest recognizable pronunciation
   of the original name.

5. Do not invent, shorten, or replace customer names.

6. If the name is unclear, return null.

Examples:

Input: कृष्णा बरांडे से सौ रुपये मिले
Customer name: Krishna Barande

Input: राहुल को पांच सौ रुपये उधार दिए
Customer name: Rahul

Input: अमोल पाटील ला दोनशे रुपये दिले
Customer name: Amol Patil

Input: Give 500 rupees credit to Krishna Burande
Customer name: Krishna Burande

TRANSACTION RULES:

1. Money given to a customer as udhar, उधार,
   or उधारी means credit.

2. Money received from a customer, returned by a customer,
   or described as payment received means payment.

3. Extract the exact numeric amount.

4. Understand Hindi and Marathi number words.
   Examples:
   - सौ = 100
   - पांच सौ = 500
   - पाचशे = 500
   - दो सौ = 200
   - हजार = 1000

5. Never guess a missing or unclear amount.

DESCRIPTION RULES:

1. Preserve the original meaning.
2. Return a short description in the original language
   or script where practical.
3. Do not add information that was not spoken.

DUE DATE RULES:

1. Extract a due date only when explicitly mentioned.
2. Return an ISO 8601 datetime when the date is clear.
3. Otherwise return null.
4. Never invent a due date.

GENERAL RULES:

1. Never invent customer names or amounts.
2. If customer name, amount, or transaction type
   cannot be identified, return null for that field.
3. Do not create or save transactions.
4. Your job is only information extraction.
5. Return ONLY valid JSON without Markdown or explanations.
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
