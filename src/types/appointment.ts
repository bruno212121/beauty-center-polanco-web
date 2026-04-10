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
}

export interface AppointmentService {
  id: number;
  name: string;
  duration_minutes: number;
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
  notes?: string;
}
