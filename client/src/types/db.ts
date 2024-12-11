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

// Export schema-derived types
export type Customer = z.infer<typeof customerSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Product = z.infer<typeof productSchema>;
export type Activity = z.infer<typeof activitySchema>;

// Export base type interfaces
export interface InsertCustomer extends Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {}
export interface InsertProduct extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}
export interface InsertOpportunity extends Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> {}
export interface InsertActivity extends Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> {}

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
