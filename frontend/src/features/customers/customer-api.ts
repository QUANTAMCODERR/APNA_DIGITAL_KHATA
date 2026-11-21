
import { apiRequest } from "@/lib/api";

import type {
  CustomerCreate,
  CustomerUpdate,
  CustomerResponse,
  CustomerListResponse,
} from "./types";

// Create a new customer
export async function createCustomer(
  data: CustomerCreate,
  token: string
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>("/customers/", {
    method: "POST",
    body: data,
    token,
  });
}

// Get all customers with pagination
export async function getCustomers(
  token: string,
  skip: number = 0,
  limit: number = 20
): Promise<CustomerListResponse> {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  return apiRequest<CustomerListResponse>(
    `/customers/?${params.toString()}`,
    {
      method: "GET",
      token,
    }
  );
}

// Get customer details by ID
export async function getCustomerById(
  customerId: string,
  token: string
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>(
    `/customers/${customerId}`,
    {
      method: "GET",
      token,
    }
  );
}

// Update customer details
export async function updateCustomer(
  customerId: string,
  data: CustomerUpdate,
  token: string
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>(
    `/customers/${customerId}`,
    {
      method: "PATCH",
      body: data,
      token,
    }
  );
}

// Delete customer
export async function deleteCustomer(
  customerId: string,
  token: string
): Promise<void> {
  return apiRequest<void>(
    `/customers/${customerId}`,
    {
      method: "DELETE",
      token,
    }
  );
}
