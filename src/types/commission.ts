export type CommissionSourceType = "service" | "product";

export type CommissionPeriod = "weekly" | "monthly";

export interface Commission {
  id: number;
  stylist_id: number;
  source_type: CommissionSourceType;
  source_id: number;
  percentage: string;
  amount: string;
  created_at: string;
}

export interface CommissionSummary {
  stylist_id: number;
  total_service_commissions: string;
  total_product_commissions: string;
  total: string;
}

export interface CommissionFilters {
  source_type?: CommissionSourceType;
  period?: CommissionPeriod;
  date_from?: string;
  date_to?: string;
}
