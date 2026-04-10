export interface Product {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  price: string;
  stock: number;
  min_stock: number;
  active: boolean;
}

export interface ProductCreate {
  name: string;
  price: number;
  brand?: string;
  category?: string;
  stock?: number;
  min_stock?: number;
  active?: boolean;
}

export type ProductUpdate = Partial<ProductCreate>;
