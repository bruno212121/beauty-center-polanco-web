export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface AppointmentClient {
  id: number;
  full_name: string;
}

export interface AppointmentStylist {
  id: number;
  specialty: string | null;
  /** Si el API lo envía plano */
  full_name?: string;
  user?: { full_name: string };
}

export interface AppointmentService {
  id: number;
  name: string;
  category: string;
  duration_minutes: number;
  price: string;
  description: string | null;
  active: boolean;
}

export interface Appointment {
  id: number;
  client_id: number;
  stylist_id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  /** Precio de la cita al momento de crear (si el backend lo envía) */
  total_amount?: string;
  client: AppointmentClient;
  stylist: AppointmentStylist;
  service: AppointmentService;
}

export interface AppointmentCreate {
  client_id: number;
  service_id: number;
  start_time: string;
  stylist_id?: number;
  notes?: string;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  notes?: string | null;
  start_time?: string;
}
