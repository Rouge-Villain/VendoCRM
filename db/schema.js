import { pgTable, text, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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
  businessLocations: text("business_locations"),
  serviceTerritory: text("service_territory"),
  serviceHours: text("service_hours"),
  contractTerms: text("contract_terms"),
  maintenanceHistory: text("maintenance_history"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  sku: text("sku").notNull(),
  inStock: integer("in_stock").default(0),
  reorderPoint: integer("reorder_point").default(10),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: integer("id").primaryKey().notNull(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  stage: text("stage").notNull(),
  status: text("status").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  closeDate: timestamp("close_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: integer("id").primaryKey().notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  customerId: integer("customer_id").notNull(),
  opportunityId: integer("opportunity_id"),
  dueDate: timestamp("due_date"),
  completed: text("completed").default("false"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: integer("id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchase_orders = pgTable("purchase_orders", {
  id: integer("id").primaryKey().notNull(),
  supplierId: integer("supplier_id").notNull(),
  status: text("status").notNull(),
  orderDate: timestamp("order_date").notNull(),
  deliveryDate: timestamp("delivery_date"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().notNull(),
  customerId: integer("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().notNull(),
  invoiceId: integer("invoice_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stock_movements = pgTable("stock_movements", {
  id: integer("id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
