export interface Product {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  price: string;
  stock: number;
  min_stock: number;
  active: boolean;
  /** Calculado en backend (`stock <= min_stock`); si no viene, se puede inferir en cliente */
  low_stock?: boolean;
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

/** Body de `PATCH /products/{id}` — solo se envían campos que cambian */
export interface ProductUpdate {
  name?: string;
  brand?: string | null;
  category?: string | null;
  price?: number;
  stock?: number;
  min_stock?: number;
  active?: boolean;
}
