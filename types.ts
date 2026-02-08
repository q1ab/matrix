export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  birth_date?: string; // YYYY-MM-DD
  locale: string;
  can_use_daily_card: boolean;
}

export interface Product {
  code: string;
  title: string;
  description: string;
  price_stars: number;
  is_subscription: boolean;
  subscription_period_days: number | null;
  tag?: string;
}

export interface Entitlement {
  product_code: string;
  quantity: number;
  is_subscription: boolean;
  expires_at: string | null;
}

export interface EntitlementsResponse {
  items: Entitlement[];
}

export interface TarotResponse {
  cards: string[];
  result_text: string;
}

export interface NatalBlock {
  title: string;
  content: string;
  is_locked: boolean;
}

export interface MatrixResponse {
  day: number;
  month: number;
  year: number;
  center: number;
  bottom: number;
  advice: string;
  blocks?: NatalBlock[];
}

export interface NatalResponse {
  sun_sign: string;
  moon_sign: string;
  asc_sign: string | null;
  daily_key: string;
  blocks: NatalBlock[];
  locked: boolean;
  unlock_product_code: string;
}

export interface ApiError {
  detail: string;
}

export interface InvoiceResponse {
  invoice_link: string;
}