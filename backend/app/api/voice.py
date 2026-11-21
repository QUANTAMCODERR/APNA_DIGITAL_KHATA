
import logging

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    status,
    Depends
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.speech_to_text import transcribe_audio
from app.services.voice_extraction import extract_transaction_details
from app.services.customer_matching import match_customer

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.transaction import TransactionSource
from app.schemas.transaction import VoiceTransactionCreate, TransactionResponse
from app.schemas.voice import VoiceTransactionConfirm
from app.services.transaction import create_transaction

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/voice",
    tags=["Voice Transactions"]
)


ALLOWED_CONTENT_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
    "audio/x-wav",
    "audio/mp3"
}

MAX_AUDIO_SIZE = 25 * 1024 * 1024


def get_audio_filename(audio: UploadFile) -> str:
    extension_map = {
        "audio/webm": "webm",
        "audio/wav": "wav",
        "audio/x-wav": "wav",
        "audio/mpeg": "mp3",
        "audio/mp3": "mp3",
        "audio/mp4": "mp4",
        "audio/ogg": "ogg"
    }

    extension = extension_map.get(audio.content_type)

    if not extension:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported audio format."
        )

    return f"recording.{extension}"


async def validate_audio(audio: UploadFile) -> bytes:

    if audio.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported audio format."
        )

    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Audio file is empty."
        )

    if len(audio_bytes) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Audio file exceeds the 25 MB limit."
        )

    return audio_bytes


@router.post("/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    audio_bytes = await validate_audio(audio)
    filename = get_audio_filename(audio)

    try:
        text = await transcribe_audio(
            audio_bytes=audio_bytes,
            filename=filename
        )

        return {
            "status": "success",
            "transcribed_text": text,
            "language": "auto-detected"
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except Exception:
        logger.exception("Voice transcription failed")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Speech transcription service is temporarily unavailable."
        )



@router.post("/prepare-transaction")
async def prepare_voice_transaction(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    audio_bytes = await validate_audio(audio)
    filename = get_audio_filename(audio)

    try:
        # Step 1: Audio to text
        transcribed_text = await transcribe_audio(
            audio_bytes=audio_bytes,
            filename=filename
        )

        # Step 2: Extract transaction details
        extracted_data = await extract_transaction_details(
            transcribed_text=transcribed_text
        )

        extracted_transaction = extracted_data.model_dump(mode="json")

        # Step 3: Identify missing information
        missing_fields = []

        if not extracted_data.customer_name:
            missing_fields.append("customer_name")

        if extracted_data.amount is None:
            missing_fields.append("amount")

        if not extracted_data.transaction_type:
            missing_fields.append("transaction_type")

        # Step 4: Incomplete extraction needs user review
        if missing_fields:
            return {
                "status": "needs_review",
                "transcribed_text": transcribed_text,
                "extracted_transaction": extracted_transaction,
                "customer_match": None,
                "missing_fields": missing_fields,
                "requires_confirmation": False
            }

        # Step 5: Match customer in authenticated user's shop
        customer_match = await match_customer(
            customer_name=extracted_data.customer_name,
            current_user=current_user,
            db=db
        )

        # Step 6: Require review if customer is not uniquely matched
        if customer_match.status != "matched":
            return {
                "status": "needs_review",
                "transcribed_text": transcribed_text,
                "extracted_transaction": extracted_transaction,
                "customer_match": customer_match.model_dump(mode="json"),
                "missing_fields": [],
                "requires_confirmation": False
            }

        # Step 7: Return transaction preview
        return {
            "status": "preview_ready",
            "transcribed_text": transcribed_text,
            "extracted_transaction": extracted_transaction,
            "customer_match": customer_match.model_dump(mode="json"),
            "missing_fields": [],
            "requires_confirmation": True
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(error)
        )

    except Exception:
        logger.exception("Prepare voice transaction failed")

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Voice transaction processing is temporarily unavailable."
        )



@router.post(
    "/confirm-transaction",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED
)
async def confirm_voice_transaction(
    payload: VoiceTransactionConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Convert confirmed user input into existing transaction schema
        transaction_data = VoiceTransactionCreate(
            **payload.model_dump()
        )

        # Save transaction using existing business logic
        transaction = await create_transaction(
            transaction_data=transaction_data,
            current_user=current_user,
            db=db,
            source=TransactionSource.VOICE,
            idempotency_key=payload.confirmation_id
        )

        return transaction

    except ValueError as error:
        error_message = str(error)

        if "Customer not found" in error_message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_message
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    except Exception:
        logger.exception("Voice transaction confirmation failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save voice transaction."
        )
