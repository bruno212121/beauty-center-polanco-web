export interface SaleProduct {
  id: number;
  name: string;
  brand: string | null;
}

export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  product: SaleProduct;
}

export interface Sale {
  id: number;
  client_id: number;
  stylist_id: number | null;
  total_amount: string;
  created_at: string;
  items: SaleItem[];
}

export interface SaleItemCreate {
  product_id: number;
  quantity: number;
}

export interface SaleCreate {
  client_id: number;
  stylist_id?: number;
  items: SaleItemCreate[];
}
