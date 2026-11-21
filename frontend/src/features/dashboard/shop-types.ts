
export type BusinessCategory =
  | "kirana_store"
  | "fruit_vegetable_shop"
  | "bakery"
  | "dairy_shop"
  | "stationery_shop"
  | "hardware_shop"
  | "clothing_store"
  | "medical_store"
  | "other_business";

export interface ShopCreate {
  shop_name: string;
  business_category: BusinessCategory;
  preferred_language: string;
  address: string | null;
}

export interface ShopResponse {
  id: string;
  owner_id: string;
  shop_name: string;
  business_category: BusinessCategory;
  preferred_language: string;
  address: string | null;
  created_at: string;
}
