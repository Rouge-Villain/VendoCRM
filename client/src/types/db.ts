import { z } from "zod";
import type {
  Customer as DbCustomer,
  Opportunity as DbOpportunity,
  Activity as DbActivity,
  Maintenance as DbMaintenance,
  Product as DbProduct,
} from "@db/schema";

// Client-side schema definitions with proper date handling
export const dateSchema = z.union([z.string(), z.date()]).transform(val => 
  typeof val === 'string' ? new Date(val) : val
);

export const opportunitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  productId: z.number(),
  value: z.union([z.number(), z.string()]).transform(val => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  stage: z.string(),
  status: z.string(),
  probability: z.number().nullable(),
  expectedCloseDate: dateSchema.nullable(),
  notes: z.string().nullable(),
  lostReason: z.string().nullable(),
  assignedTo: z.string().nullable(),
  lastContactDate: dateSchema.nullable(),
  nextFollowUp: dateSchema.nullable(),
  createdAt: dateSchema.nullable(),
  updatedAt: dateSchema.nullable()
});

export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  company: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  website: z.string().nullable(),
  notes: z.string().nullable(),
  machineTypes: z.array(
    z.union([
      z.string(),
      z.object({
        type: z.string(),
        quantity: z.number().optional()
      })
    ])
  ),
  state: z.string().nullable(),
  city: z.string().nullable(),
  business_locations: z.string().nullable(),
  serviceTerritory: z.string().nullable(),
  serviceHours: z.string().nullable(),
  contractTerms: z.string().nullable(),
  maintenanceHistory: z.string().nullable(),
  createdAt: dateSchema.nullable(),
  updatedAt: dateSchema.nullable()
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  specs: z.string(),
  price: z.number(),
  imageUrl: z.string().nullable(),
  createdAt: dateSchema.nullable()
});

export const activitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  type: z.string(),
  description: z.string(),
  outcome: z.string().nullable(),
  nextSteps: z.string().nullable(),
  contactMethod: z.string(),
  contactedBy: z.string(),
  followUpDate: dateSchema.nullable(),
  createdAt: dateSchema.nullable()
});

export const maintenanceSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  machineId: z.string(),
  serialNumber: z.string(),
  machineType: z.string(),
  maintenanceType: z.string(),
  description: z.string(),
  status: z.string(),
  technicianNotes: z.string().nullable(),
  partsUsed: z.array(z.object({
    name: z.string(),
    quantity: z.number()
  })).nullable(),
  cost: z.number(),
  scheduledDate: dateSchema,
  completedDate: dateSchema.nullable(),
  nextMaintenanceDate: dateSchema.nullable(),
  createdAt: dateSchema.nullable(),
  updatedAt: dateSchema.nullable()
});

// Re-export database types
export type { DbCustomer as Customer };
export type { DbOpportunity as Opportunity };
export type { DbActivity as Activity };
export type { DbMaintenance as Maintenance };
export type { DbProduct as Product };

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

// Export date validation helper
export const validateDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null;
  const parsed = dateSchema.safeParse(date);
  return parsed.success ? parsed.data : null;
};
