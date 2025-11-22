export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  tenant_id: number;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string | null;
  currency: string;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  category_id: number | null;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  vat_rate: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  tax_number: string | null;
  registration_number: string | null;
  bank_account: string | null;
  bank_name: string | null;
  payment_terms: string | null;
  min_order_amount: number | null;
  delivery_days: number | null;
  notes: string | null;
  is_active: boolean;
  products_count?: number;
  last_delivery?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Sale {
  id: number;
  sale_number: string;
  subtotal: number;
  discount_amount: number;
  vat_amount: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
}
