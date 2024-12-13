import { pgTable, text, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Table Definitions
export const maintenanceRecords = pgTable("maintenance_records", {
  id: integer("id").primaryKey().notNull(),
  customerId: integer("customer_id").notNull(),
  machineId: text("machine_id").notNull(),
  serialNumber: text("serial_number").notNull(),
  machineType: text("machine_type").notNull(),
  maintenanceType: text("maintenance_type").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  technicianNotes: text("technician_notes").default(""),
  partsUsed: jsonb("parts_used").default([]),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull().default("0"),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).default("0"),
  partsCost: decimal("parts_cost", { precision: 10, scale: 2 }).default("0"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  website: text("website"),
  notes: text("notes"),
  machineTypes: jsonb("machine_types").default([]),
  state: text("state"),
  city: text("city"),
  business_locations: text("business_locations"),
  serviceTerritory: text("service_territory"),
  serviceHours: text("service_hours"),
  contractTerms: text("contract_terms"),
  maintenanceHistory: text("maintenance_history"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ... (remaining table definitions remain the same, just removing TypeScript types)

// Schema Definitions
export const insertCustomerSchema = createInsertSchema(customers);
export const selectCustomerSchema = createSelectSchema(customers);
export const customerSchema = selectCustomerSchema;

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const productSchema = selectProductSchema;

export const insertOpportunitySchema = createInsertSchema(opportunities);
export const selectOpportunitySchema = createSelectSchema(opportunities);
export const opportunitySchema = selectOpportunitySchema;

export const insertActivitySchema = createInsertSchema(activities);
export const selectActivitySchema = createSelectSchema(activities);
export const activitySchema = selectActivitySchema;

export const insertMaintenanceSchema = createInsertSchema(maintenanceRecords);
export const selectMaintenanceSchema = createSelectSchema(maintenanceRecords);
export const maintenanceSchema = selectMaintenanceSchema;

export const insertInventorySchema = createInsertSchema(inventory);
export const selectInventorySchema = createSelectSchema(inventory);
export const inventorySchema = selectInventorySchema;

export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);
export const supplierSchema = selectSupplierSchema;

export const insertPurchaseOrderSchema = createInsertSchema(purchase_orders);
export const selectPurchaseOrderSchema = createSelectSchema(purchase_orders);
export const purchaseOrderSchema = selectPurchaseOrderSchema;

export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);
export const invoiceSchema = selectInvoiceSchema;

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const paymentSchema = selectPaymentSchema;

// Export schemas directly
export { 
  customers,
  products,
  opportunities,
  activities,
  maintenanceRecords,
  inventory,
  suppliers,
  purchase_orders,
  invoices,
  payments,
  stock_movements
};
