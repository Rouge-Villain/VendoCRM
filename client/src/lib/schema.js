import { z } from 'zod';

// Customer schema
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
  })).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

// Product schema
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

// Opportunity schema
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

// Activity schema
export const activitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  type: z.string(),
  description: z.string(),
  date: z.string().or(z.date()),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

// Maintenance schema
export const maintenanceSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  machineId: z.number(),
  date: z.string().or(z.date()),
  type: z.string(),
  description: z.string(),
  status: z.string(),
  parts: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    cost: z.number()
  })).optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional()
});

export const insertActivitySchema = activitySchema.omit({ id: true, createdAt: true, updatedAt: true });
