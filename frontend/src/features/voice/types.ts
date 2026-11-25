
import type { TransactionType, TransactionResponse } from "@/features/transactions/types";

export interface VoiceTranscriptionResponse {
  status: "success";
  transcribed_text: string;
  language: string;
}

export interface ExtractedVoiceTransaction {
  customer_name: string | null;
  transaction_type: TransactionType | null;
  amount: number | string | null;
  description: string | null;
  due_date: string | null;
}

export interface MatchedCustomer {
  id: string;
  full_name: string;
  mobile_number: string | null;
}

export interface CustomerMatch {
  status: "matched" | "multiple_matches" | "not_found";
  customers: MatchedCustomer[];
}

interface PrepareVoiceTransactionBase {
  transcribed_text: string;
  extracted_transaction: ExtractedVoiceTransaction;
  customer_match: CustomerMatch | null;
  missing_fields: string[];
}

export interface VoiceTransactionPreview
  extends PrepareVoiceTransactionBase {
  status: "preview_ready";
  requires_confirmation: true;
}

export interface VoiceTransactionNeedsReview
  extends PrepareVoiceTransactionBase {
  status: "needs_review";
  requires_confirmation: false;
}

export type PrepareVoiceTransactionResponse =
  | VoiceTransactionPreview
  | VoiceTransactionNeedsReview;

export interface VoiceTransactionConfirm {
  confirmation_id: string;
  customer_id: string;
  transaction_type: TransactionType;
  amount: number | string;
  description: string | null;
  due_date: string | null;
}

export interface TextTransactionRequest {
  message: string;
}

export type VoiceTransactionConfirmationResponse = TransactionResponse;
