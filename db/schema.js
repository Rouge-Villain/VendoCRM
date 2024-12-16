import { pgTable, text, integer, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Table Definitions
/**
 * @typedef {object} MaintenanceRecord
 * @property {number} id
 * @property {number} customerId
 * @property {string} machineId
 * @property {string} serialNumber
 * @property {string} machineType
 * @property {string} maintenanceType
 * @property {string} description
 * @property {string} status
 * @property {string} technicianNotes
 * @property {Array<object>} partsUsed
 * @property {number} cost
 * @property {number} laborCost
 * @property {number} partsCost
 * @property {Date} scheduledDate
 * @property {Date} completedDate
 * @property {Date} nextMaintenanceDate
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} Customer
 * @property {number} id
 * @property {string} name
 * @property {string} company
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} website
 * @property {string} notes
 * @property {Array<object>} machineTypes
 * @property {string} state
 * @property {string} city
 * @property {string} businessLocations
 * @property {string} serviceTerritory
 * @property {string} serviceHours
 * @property {string} contractTerms
 * @property {string} maintenanceHistory
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} category
 * @property {string} sku
 * @property {number} inStock
 * @property {number} reorderPoint
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} Opportunity
 * @property {number} id
 * @property {number} customerId
 * @property {number} productId
 * @property {string} stage
 * @property {string} status
 * @property {number} value
 * @property {Date} closeDate
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} Activity
 * @property {number} id
 * @property {string} type
 * @property {string} description
 * @property {number} customerId
 * @property {number} opportunityId
 * @property {Date} dueDate
 * @property {string} completed
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} InventoryItem
 * @property {number} id
 * @property {number} productId
 * @property {number} quantity
 * @property {string} location
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
export const inventory = pgTable("inventory", {
  id: integer("id").primaryKey().notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * @typedef {object} Supplier
 * @property {number} id
 * @property {string} name
 * @property {string} contact
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} PurchaseOrder
 * @property {number} id
 * @property {number} supplierId
 * @property {string} status
 * @property {Date} orderDate
 * @property {Date} deliveryDate
 * @property {number} total
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
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

/**
 * @typedef {object} Invoice
 * @property {number} id
 * @property {number} customerId
 * @property {number} amount
 * @property {string} status
 * @property {Date} dueDate
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().notNull(),
  customerId: integer("customer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * @typedef {object} Payment
 * @property {number} id
 * @property {number} invoiceId
 * @property {number} amount
 * @property {Date} paymentDate
 * @property {string} paymentMethod
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().notNull(),
  invoiceId: integer("invoice_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * @typedef {object} StockMovement
 * @property {number} id
 * @property {number} productId
 * @property {number} quantity
 * @property {string} type
 * @property {string} reference
 * @property {Date} createdAt
 */
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