import { z } from "zod";

// Define base schemas
export const customerSchema = z.object({
  id: z.number(),
  company: z.string(),
  contact: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  serviceTerritory: z.string(),
  machineTypes: z.array(z.object({
    type: z.string(),
    quantity: z.number().optional()
  })),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

export const opportunitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  productId: z.number(),
  value: z.number(),
  stage: z.string(),
  status: z.string(),
  probability: z.number().optional(),
  expectedCloseDate: z.date().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  specs: z.string(),
  category: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

export const activitySchema = z.object({
  id: z.number(),
  type: z.string(),
  description: z.string(),
  customerId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

// Re-export all types from schema
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
  Inventory,
  InsertInventory,
  Supplier,
  InsertSupplier,
  PurchaseOrder,
  InsertPurchaseOrder,
  Invoice,
  InsertInvoice,
  Payment,
  InsertPayment,
};

// Define types from schemas
export type Customer = z.infer<typeof customerSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Product = z.infer<typeof productSchema>;
export type Activity = z.infer<typeof activitySchema>;

// Utility types
export interface MachineType {
  type: string;
  quantity: number;
}

export interface Part {
  name: string;
  quantity: number;
  cost?: number;
}

// Analytics types
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

// Validation helper functions
export const validateCustomer = (data: unknown): Customer => customerSchema.parse(data);
export const validateOpportunity = (data: unknown): Opportunity => opportunitySchema.parse(data);
export const validateProduct = (data: unknown): Product => productSchema.parse(data);
export const validateActivity = (data: unknown): Activity => activitySchema.parse(data);

// Define Part interface for maintenance records
export interface Part {
  name: string;
  quantity: number;
  cost?: number;
}

// Extended maintenance type with parts
export type MaintenanceWithParts = Omit<Maintenance, 'partsUsed'> & {
  partsUsed: Part[];
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

// Machine type interface
export interface MachineType {
  type: string;
  quantity: number;
}

// Analytics-specific types
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

// Form validation types
export type ValidatedCustomer = z.infer<typeof customerSchema>;
export type ValidatedOpportunity = z.infer<typeof opportunitySchema>;
export type ValidatedActivity = z.infer<typeof activitySchema>;
export type ValidatedMaintenance = z.infer<typeof maintenanceSchema>;
export type ValidatedProduct = z.infer<typeof productSchema>;

// Form validation functions
export const validateCustomer = (data: unknown): ValidatedCustomer => customerSchema.parse(data);
export const validateOpportunity = (data: unknown): ValidatedOpportunity => opportunitySchema.parse(data);
export const validateActivity = (data: unknown): ValidatedActivity => activitySchema.parse(data);
export const validateMaintenance = (data: unknown): ValidatedMaintenance => maintenanceSchema.parse(data);
export const validateProduct = (data: unknown): ValidatedProduct => productSchema.parse(data);
