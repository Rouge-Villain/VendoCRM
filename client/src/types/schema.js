import { z } from "zod";

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

export const activitySchema = z.object({
  id: z.number(),
  customerId: z.number(),
  type: z.string(),
  description: z.string(),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

export const maintenanceSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  machineId: z.number(),
  date: z.date(),
  type: z.string(),
  description: z.string(),
  status: z.string(),
  parts: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    cost: z.number()
  })),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});