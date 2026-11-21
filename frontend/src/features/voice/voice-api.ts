
import { apiRequest } from "@/lib/api";

import type {
  VoiceTranscriptionResponse,
  PrepareVoiceTransactionResponse,
  VoiceTransactionConfirm,
  VoiceTransactionConfirmationResponse,
} from "./types";

function createAudioFile(audio: Blob): File {
  // Remove codec parameters, e.g. ";codecs=opus".
  const contentType = audio.type.split(";")[0].trim().toLowerCase();

  const extensionMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "mp4",
    "audio/ogg": "ogg",
  };

  const extension = extensionMap[contentType];

  if (!extension) {
    throw new Error(`Unsupported recording format: ${audio.type || "unknown"}`);
  }

  return new File([audio], `recording.${extension}`, {
    type: contentType,
  });
}

export async function transcribeVoice(audio: Blob, token: string) {
  const formData = new FormData();
  formData.append("audio", createAudioFile(audio));

  return apiRequest<VoiceTranscriptionResponse>(
    "/voice/transcribe",
    {
      method: "POST",
      body: formData,
      token,
    }
  );
}

export async function prepareVoiceTransaction(audio: Blob, token: string) {
  const formData = new FormData();
  formData.append("audio", createAudioFile(audio));

  return apiRequest<PrepareVoiceTransactionResponse>(
    "/voice/prepare-transaction",
    {
      method: "POST",
      body: formData,
      token,
    }
  );
}

export async function confirmVoiceTransaction(
  data: VoiceTransactionConfirm,
  token: string
) {
  return apiRequest<VoiceTransactionConfirmationResponse>(
    "/voice/confirm-transaction",
    {
      method: "POST",
      body: data,
      token,
    }
  );
}
