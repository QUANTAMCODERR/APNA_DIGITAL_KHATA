
"use client";

import { useEffect, useRef, useState } from "react";

interface VoiceRecorderProps {
  onAudioReady: (audio: Blob) => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export default function VoiceRecorder({
  onAudioReady,
  disabled = false,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    try {
      setError("");
      chunksRef.current = [];

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone recording is not supported in this browser."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      const supportedTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];

      const mimeType = supportedTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioBlob.size > 0) {
          onAudioReady(audioBlob);
        } else {
          setError("No audio was recorded. Please try again.");
        }

        stream.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
      };

      recorder.onerror = () => {
        setError("Recording failed. Please try again.");

        stream.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      setIsRecording(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to access your microphone."
      );
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">
        Voice Transaction
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Speak naturally to record a customer transaction.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || isProcessing}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700"
          >
            Stop Recording
          </button>
        )}

        {isRecording && (
          <span className="flex items-center gap-2 text-sm font-medium text-red-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" />
            Listening...
          </span>
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>

          <div>
            <p className="font-semibold text-blue-800">
              Processing your voice...
            </p>

            <p className="mt-1 text-sm text-blue-600">
              Converting speech to text and identifying transaction details.
              Please wait.
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
