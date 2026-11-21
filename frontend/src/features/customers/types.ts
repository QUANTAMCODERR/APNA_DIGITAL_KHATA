
export interface CustomerCreate {
  full_name: string;
  mobile_number: string | null;
  address: string | null;
  notes: string | null;
}

export interface CustomerUpdate {
  full_name?: string | null;
  mobile_number?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface CustomerResponse {
  id: string;
  shop_id: string;
  full_name: string;
  mobile_number: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export type CustomerListResponse = CustomerResponse[];
