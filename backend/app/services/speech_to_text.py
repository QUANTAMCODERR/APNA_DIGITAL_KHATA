
from groq import AsyncGroq

from app.core.config import settings


client = AsyncGroq(
    api_key=settings.GROQ_API_KEY
)


BASE_TRANSCRIPTION_PROMPT = """
Indian shopkeeper transaction recording.
Languages: Hindi, Marathi, English, Hinglish.
Common words: udhar, jama, bhugtan, diye, liye,
credit, payment, baki, rupaye.
Transcribe exact speech. Do not translate.
Preserve names and amounts. Do not invent words.
"""


def build_transcription_prompt(
    customer_names: list[str] | None = None,
) -> str:
    """Build a Whisper prompt with known customer names."""

    prompt = BASE_TRANSCRIPTION_PROMPT.strip()

    if customer_names:
        unique_names = list(
            dict.fromkeys(
                name.strip()
                for name in customer_names
                if name and name.strip()
            )
        )

        if unique_names:
            names_context = (
                "\nKnown customer names. Preserve these spellings "
                "when they are spoken:\n"
                + ", ".join(unique_names[:30])
            )

            prompt += names_context

    # Groq Whisper prompt limit: 896 characters.
    return prompt[:896]


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str,
    customer_names: list[str] | None = None,
) -> str:

    if not audio_bytes:
        raise ValueError("Audio file cannot be empty.")

    transcription = await client.audio.transcriptions.create(
        file=(filename, audio_bytes),
        model=settings.GROQ_STT_MODEL,
        prompt=build_transcription_prompt(customer_names),
        response_format="json",
    )

    transcribed_text = transcription.text.strip()

    if not transcribed_text:
        raise ValueError("Could not recognize speech.")

    return transcribed_text
