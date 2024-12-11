import { z } from "zod";
import type {
  Customer as DbCustomer,
  Opportunity as DbOpportunity,
  Activity as DbActivity,
  Maintenance as DbMaintenance,
  Product as DbProduct,
} from "../../../db/schema";

// Re-export the types from the database schema
export type {
  Customer,
  Opportunity,
  Activity,
  Maintenance,
  Product,
} from "../../../db/schema";

// Additional client-side types and schemas
export const opportunitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  productId: z.number(),
  value: z.union([z.number(), z.string()]),  // Support both number and string formats
  stage: z.string(),
  status: z.string(),
  probability: z.number().optional(),
  expectedCloseDate: z.union([z.date(), z.string()]).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).optional()
});

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  company: z.string(),
  contact: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  state: z.string().optional(),
  notes: z.string().optional(),
  website: z.string().optional(),
  maintenanceHistory: z.string().optional(),
  serviceTerritory: z.string(),
  machineTypes: z.array(z.object({
    type: z.string(),
    quantity: z.number().optional()
  })),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).optional()
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  specs: z.string(),
  category: z.string(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).optional()
});

export const activitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  type: z.string(),
  description: z.string(),
  outcome: z.string().optional(),
  nextSteps: z.string().optional(),
  contactMethod: z.string(),
  contactedBy: z.string(),
  followUpDate: z.union([z.date(), z.string()]).optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).optional()
});

export const maintenanceSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  machineId: z.number(),
  serialNumber: z.string(),
  machineType: z.string(),
  maintenanceType: z.string(),
  description: z.string(),
  status: z.string(),
  technicianNotes: z.string().optional(),
  partsUsed: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    cost: z.number()
  })).optional(),
  cost: z.number().optional(),
  scheduledDate: z.union([z.date(), z.string()]).optional(),
  completedDate: z.union([z.date(), z.string()]).optional(),
  nextMaintenanceDate: z.union([z.date(), z.string()]).optional(),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).optional()
});

// Export types
export type Customer = z.infer<typeof customerSchema>;
export type Product = z.infer<typeof productSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Maintenance = z.infer<typeof maintenanceSchema>;

// Export insert types (for form submissions)
export type InsertCustomer = z.input<typeof customerSchema>;
export type InsertOpportunity = z.input<typeof opportunitySchema>;
export type InsertActivity = z.input<typeof activitySchema>;
export type InsertMaintenance = z.input<typeof maintenanceSchema>;

// Re-export schema functions for validation
export const validateCustomer = (data: unknown): Customer => customerSchema.parse(data);
export const validateOpportunity = (data: unknown): Opportunity => opportunitySchema.parse(data);
export const validateActivity = (data: unknown): Activity => activitySchema.parse(data);
export const validateMaintenance = (data: unknown): Maintenance => maintenanceSchema.parse(data);

// Export analytics-specific types
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
