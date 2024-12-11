import { z } from "zod";

// Database schema types using Zod for runtime validation
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

// Export types
export type Customer = z.infer<typeof customerSchema>;
export type Product = z.infer<typeof productSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;

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
  date: z.union([z.date(), z.string()]),
  type: z.string(),
  parts: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    cost: z.number()
  })),
  createdAt: z.union([z.date(), z.string()]),
  updatedAt: z.union([z.date(), z.string()]).optional()
});

export type Maintenance = z.infer<typeof maintenanceSchema>;
