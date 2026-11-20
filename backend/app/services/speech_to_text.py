
from groq import AsyncGroq

from app.core.config import settings


client = AsyncGroq(
    api_key=settings.GROQ_API_KEY
)


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str
) -> str:

    if not audio_bytes:
        raise ValueError("Audio file cannot be empty.")

    transcription = await client.audio.transcriptions.create(
        file=(filename, audio_bytes),
        model=settings.GROQ_STT_MODEL,
        response_format="json"
    )

    transcribed_text = transcription.text.strip()

    if not transcribed_text:
        raise ValueError("Could not recognize speech.")

    return transcribed_text
