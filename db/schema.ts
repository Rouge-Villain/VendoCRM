import { pgTable, text, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  website: text("website"),
  notes: text("notes"),
  machineTypes: text("machine_types").array(),
  businessLocations: text("business_locations"),  // JSON array as text
  serviceTerritory: text("service_territory"),
  serviceHours: text("service_hours"),
  contractTerms: text("contract_terms"),
  maintenanceHistory: text("maintenance_history"), // JSON array as text
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(), // machine, cooler, part, etc.
  description: text("description").notNull(),
  specs: text("specs").notNull(), // JSON string of technical specs
  price: decimal("price").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  status: text("status").notNull(), // prospecting, qualification, proposal, closed
  value: decimal("value").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  type: text("type").notNull(), // call, email, meeting, etc.
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = z.infer<typeof selectCustomerSchema>;

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = z.infer<typeof selectProductSchema>;

export const insertOpportunitySchema = createInsertSchema(opportunities);
export const selectOpportunitySchema = createSelectSchema(opportunities);
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = z.infer<typeof selectOpportunitySchema>;

export const insertActivitySchema = createInsertSchema(activities);
export const selectActivitySchema = createSelectSchema(activities);
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = z.infer<typeof selectActivitySchema>;
