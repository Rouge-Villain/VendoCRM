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
  stage: text("stage").notNull().default("prospecting"), // Current pipeline stage
  status: text("status").notNull().default("open"), // open, won, lost
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
  type: text("type").notNull(), // call, email, meeting, etc.
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

// ERP System Tables
export const inventory = pgTable("inventory", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  locationCode: text("location_code").notNull(),
  minimumStock: integer("minimum_stock").default(0),
  maximumStock: integer("maximum_stock"),
  reorderPoint: integer("reorder_point").default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  lastRestockDate: timestamp("last_restock_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  taxId: text("tax_id"),
  paymentTerms: text("payment_terms"),
  rating: integer("rating"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchase_orders = pgTable("purchase_orders", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  supplierId: integer("supplier_id").notNull(),
  orderDate: timestamp("order_date").notNull(),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  status: text("status").notNull().default("draft"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchase_order_items = pgTable("purchase_order_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  purchaseOrderId: integer("purchase_order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  status: text("status").default("pending"),
});

export const invoices = pgTable("invoices", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  opportunityId: integer("opportunity_id"),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("draft"),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoice_items = pgTable("invoice_items", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const payments = pgTable("payments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  invoiceId: integer("invoice_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  status: text("status").default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stock_movements = pgTable("stock_movements", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").notNull(),
  type: text("type").notNull(), // in, out, transfer
  quantity: integer("quantity").notNull(),
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  reference: text("reference"), // PO number, invoice number, etc.
  referenceId: integer("reference_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").notNull(),
});

// Zod Schemas for ERP tables
export const insertInventorySchema = createInsertSchema(inventory);
export const selectInventorySchema = createSelectSchema(inventory);
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = z.infer<typeof selectInventorySchema>;

export const insertSupplierSchema = createInsertSchema(suppliers);
export const selectSupplierSchema = createSelectSchema(suppliers);
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = z.infer<typeof selectSupplierSchema>;

export const insertPurchaseOrderSchema = createInsertSchema(purchase_orders);
export const selectPurchaseOrderSchema = createSelectSchema(purchase_orders);
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = z.infer<typeof selectPurchaseOrderSchema>;

export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = z.infer<typeof selectInvoiceSchema>;

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = z.infer<typeof selectPaymentSchema>;

export const insertStockMovementSchema = createInsertSchema(stock_movements);
export const selectStockMovementSchema = createSelectSchema(stock_movements);
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type StockMovement = z.infer<typeof selectStockMovementSchema>;