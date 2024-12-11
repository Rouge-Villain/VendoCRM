import { z } from "zod";
import {
  type Customer,
  type InsertCustomer,
  type Product,
  type InsertProduct,
  type Opportunity,
  type InsertOpportunity,
  type Activity,
  type InsertActivity,
  type Maintenance,
  type InsertMaintenance,
  customerSchema,
  opportunitySchema,
  productSchema,
  activitySchema,
  maintenanceSchema,
} from "@db/schema";

// Re-export types from schema
export type {
  Customer,
  InsertCustomer,
  Product,
  InsertProduct,
  Opportunity,
  InsertOpportunity,
  Activity,
  InsertActivity,
  Maintenance,
  InsertMaintenance,
};

// Export schemas
export {
  customerSchema,
  opportunitySchema,
  productSchema,
  activitySchema,
  maintenanceSchema,
};

// Client-side date handling helper
export const dateSchema = z.union([z.string(), z.date()]).transform(val => 
  typeof val === 'string' ? new Date(val) : val
);

// Date validation helper
export const validateDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null;
  const parsed = dateSchema.safeParse(date);
  return parsed.success ? parsed.data : null;
};

// Export validated types for forms
export type ValidatedCustomer = z.infer<typeof customerSchema>;
export type ValidatedOpportunity = z.infer<typeof opportunitySchema>;
export type ValidatedActivity = z.infer<typeof activitySchema>;
export type ValidatedMaintenance = z.infer<typeof maintenanceSchema>;
export type ValidatedProduct = z.infer<typeof productSchema>;

// Export validation functions
export const validateCustomer = (data: unknown): ValidatedCustomer => customerSchema.parse(data);
export const validateOpportunity = (data: unknown): ValidatedOpportunity => opportunitySchema.parse(data);
export const validateActivity = (data: unknown): ValidatedActivity => activitySchema.parse(data);
export const validateMaintenance = (data: unknown): ValidatedMaintenance => maintenanceSchema.parse(data);
export const validateProduct = (data: unknown): ValidatedProduct => productSchema.parse(data);

// Analytics-specific types
export interface MachineType {
  type: string;
  quantity?: number;
}

export interface AnalyticsData {
  period?: string;
  newCustomers?: number;
  totalMachines?: number;
  revenue?: number;
  machineType?: string;
  count?: number;
  totalRevenue?: number;
  customersUsing?: number;
  territory?: string;
  customerCount?: number;
  machineCount?: number;
}
