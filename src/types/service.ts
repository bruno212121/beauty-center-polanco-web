export interface Service {
  id: number;
  name: string;
  category: string;
  duration_minutes: number;
  price: string;
  description: string | null;
  active: boolean;
}

export interface ServiceCreate {
  name: string;
  category: string;
  duration_minutes: number;
  price: number;
  description?: string;
  active?: boolean;
}

/** Body de `PATCH /services/{id}` — solo se envían campos que cambian */
export interface ServiceUpdate {
  name?: string;
  category?: string | null;
  duration_minutes?: number;
  price?: number;
  description?: string | null;
  active?: boolean;
}
