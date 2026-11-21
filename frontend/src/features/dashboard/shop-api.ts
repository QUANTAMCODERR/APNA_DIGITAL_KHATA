
import { apiRequest } from "@/lib/api";

import type {
  ShopCreate,
  ShopResponse,
} from "./shop-types";

export async function createShop(
  data: ShopCreate,
  token: string
): Promise<ShopResponse> {
  return apiRequest<ShopResponse>("/shops/", {
    method: "POST",
    body: data,
    token,
  });
}

export async function getMyShop(
  token: string
): Promise<ShopResponse> {
  return apiRequest<ShopResponse>("/shops/me", {
    method: "GET",
    token,
  });
}

export async function updateMyShop(
  data: Partial<ShopCreate>,
  token: string
): Promise<ShopResponse> {
  return apiRequest<ShopResponse>("/shops/me", {
    method: "PATCH",
    body: data,
    token,
  });
}
