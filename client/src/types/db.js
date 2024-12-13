import { z } from 'zod';

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

// Validation helper functions
export const validateCustomer = (data) => customerSchema.parse(data);
export const validateOpportunity = (data) => opportunitySchema.parse(data);
export const validateProduct = (data) => productSchema.parse(data);
export const validateActivity = (data) => activitySchema.parse(data);

// Date validation helper
export const validateDate = (date) => {
  if (!date) return null;
  const parsed = z.union([z.string(), z.date()]).safeParse(date);
  return parsed.success ? new Date(parsed.data) : null;
};