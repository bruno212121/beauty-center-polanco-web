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

export type ServiceUpdate = Partial<ServiceCreate>;
