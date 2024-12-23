import { pgTable, text, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const maintenanceRecords = pgTable("maintenance_records", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  machineId: text("machine_id").notNull(),
  serialNumber: text("serial_number").notNull(),
  machineType: text("machine_type").notNull(),
  maintenanceType: text("maintenance_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  technicianNotes: text("technician_notes").default(""),
  partsUsed: jsonb("parts_used").$type<Array<{ name: string; quantity: number }>>().default([]),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  website: text("website"),
  notes: text("notes"),
  machineTypes: jsonb("machine_types").$type<Array<{ type: string; quantity: number }>>().default([]),
  state: text("state").array(),
  serviceTerritory: text("service_territory"),
  serviceHours: text("service_hours"),
  contractTerms: text("contract_terms"),
  maintenanceHistory: text("maintenance_history"),
  loyaltyPoints: integer("loyalty_points").default(0),
  loyaltyTier: text("loyalty_tier").default("standard"),
  lastPointsEarned: timestamp("last_points_earned"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  points: integer("points").notNull(),
  type: text("type").notNull(), // 'earned' or 'redeemed'
  source: text("source").notNull(), // e.g., 'purchase', 'maintenance', 'referral'
  description: text("description").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  specs: text("specs").notNull(),
  price: decimal("price").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  stage: text("stage").notNull().default("prospecting"),
  status: text("status").notNull().default("open"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  probability: integer("probability").default(0),
  expectedCloseDate: timestamp("expected_close_date"),
  lostReason: text("lost_reason"),
  notes: text("notes"),
  assignedTo: text("assigned_to"),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUp: timestamp("next_follow_up"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  outcome: text("outcome"),
  nextSteps: text("next_steps"),
  contactMethod: text("contact_method").notNull(),
  contactedBy: text("contacted_by").notNull(),
  followUpDate: timestamp("follow_up_date"),
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

export const insertMaintenanceSchema = createInsertSchema(maintenanceRecords);
export const selectMaintenanceSchema = createSelectSchema(maintenanceRecords);
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Maintenance = z.infer<typeof selectMaintenanceSchema>;

export const insertLoyaltyRewardSchema = createInsertSchema(loyaltyRewards);
export const selectLoyaltyRewardSchema = createSelectSchema(loyaltyRewards);
export type InsertLoyaltyReward = z.infer<typeof insertLoyaltyRewardSchema>;
export type LoyaltyReward = z.infer<typeof selectLoyaltyRewardSchema>;