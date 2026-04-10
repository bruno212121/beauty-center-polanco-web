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

import type { AppointmentStatus, AppointmentStylist, AppointmentService } from "./appointment";
import type { Sale } from "./sale";

export interface HistoryAppointment {
  id: number;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  service: AppointmentService;
  stylist: AppointmentStylist | null;
}

export interface ClientHistory extends Client {
  appointments: HistoryAppointment[];
  product_sales: Sale[];
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
