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
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

export const opportunitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  productId: z.number(),
  value: z.number(),
  stage: z.string(),
  status: z.string(),
  probability: z.number().optional(),
  expectedCloseDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  specs: z.string(),
  category: z.string(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

export const activitySchema = z.object({
  id: z.number(),
  type: z.string(),
  description: z.string(),
  customerId: z.number(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

// Export types
export type Customer = z.infer<typeof customerSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
export type Product = z.infer<typeof productSchema>;
export type Activity = z.infer<typeof activitySchema>;

// Export base type interfaces
export interface InsertCustomer extends Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {}
export interface InsertProduct extends Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {}
export interface InsertOpportunity extends Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'> {}
export interface InsertActivity extends Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> {}

// Validation helper functions
export const validateCustomer = (data: unknown): Customer => customerSchema.parse(data);
export const validateOpportunity = (data: unknown): Opportunity => opportunitySchema.parse(data);
export const validateProduct = (data: unknown): Product => productSchema.parse(data);
export const validateActivity = (data: unknown): Activity => activitySchema.parse(data);
