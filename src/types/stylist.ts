import type { Role } from "./auth";

export interface StylistUser {
  id: number;
  full_name: string;
  email: string;
  role: Role;
}

export interface Stylist {
  id: number;
  specialty: string | null;
  active: boolean;
  user: StylistUser;
}

export interface StylistCreate {
  user_id: number;
  specialty?: string;
  active?: boolean;
}

export type StylistUpdate = Partial<StylistCreate>;
