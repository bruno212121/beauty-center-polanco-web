export interface Client {
  id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  preferences: string | null;
  allergies: string | null;
  notes: string | null;
  created_at: string;
}

export interface ClientCreate {
  full_name: string;
  phone?: string;
  email?: string;
  preferences?: string;
  allergies?: string;
  notes?: string;
}

export type ClientUpdate = Partial<ClientCreate>;
