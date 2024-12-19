export interface AnalyticsData {
  period?: string;
  value: number;
  label: string;
}

export interface CustomerAnalyticsData {
  customerId: number;
  name: string;
  totalSpent: number;
  totalOrders: number;
  lastPurchase: string;
  machineCount: number;
}

export interface SalesAnalyticsData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface WinLossData {
  period: string;
  won: number;
  lost: number;
  ratio: number;
}

export interface AdvancedAnalyticsData {
  revenue: AnalyticsData[];
  customers: AnalyticsData[];
  machines: AnalyticsData[];
  serviceRequests: AnalyticsData[];
}
