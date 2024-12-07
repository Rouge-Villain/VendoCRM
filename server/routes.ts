import { type Express } from "express";
import { db } from "@db/index";
import { sql, eq } from "drizzle-orm";
import {
  customers,
  products,
  opportunities,
  maintenanceRecords,
  inventory,
  suppliers,
  purchase_orders,
  purchase_order_items,
  invoices,
  invoice_items,
  payments,
  stock_movements,
} from "@db/schema";

export function registerRoutes(app: Express) {
  // CRM Routes
  app.get("/api/customers", async (_req, res) => {
    try {
      const result = await db.select().from(customers);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const result = await db.insert(customers).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.get("/api/products", async (_req, res) => {
    try {
      const result = await db.select().from(products);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const result = await db.insert(products).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.get("/api/opportunities", async (_req, res) => {
    try {
      const result = await db.select().from(opportunities);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const result = await db.insert(opportunities).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });

  app.get("/api/maintenance", async (_req, res) => {
    try {
      const result = await db.select().from(maintenanceRecords);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch maintenance records" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const result = await db.insert(maintenanceRecords).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid maintenance record data" });
    }
  });

  // ERP Routes
  // Inventory Management
  app.get("/api/inventory", async (_req, res) => {
    try {
      const result = await db.select().from(inventory);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const result = await db.insert(inventory).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (_req, res) => {
    try {
      const result = await db.select().from(suppliers);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const result = await db.insert(suppliers).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid supplier data" });
    }
  });

  // Purchase Orders
  app.get("/api/purchase-orders", async (_req, res) => {
    try {
      const result = await db.select().from(purchase_orders);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      const order = await db.insert(purchase_orders).values(orderData).returning();
      
      if (items && items.length > 0) {
        await db.insert(purchase_order_items).values(
          items.map((item: any) => ({
            ...item,
            purchaseOrderId: order[0].id
          }))
        );
      }
      
      res.json(order[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid purchase order data" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (_req, res) => {
    try {
      const result = await db.select().from(invoices);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { items, ...invoiceData } = req.body;
      const invoice = await db.insert(invoices).values(invoiceData).returning();
      
      if (items && items.length > 0) {
        await db.insert(invoice_items).values(
          items.map((item: any) => ({
            ...item,
            invoiceId: invoice[0].id
          }))
        );
      }
      
      res.json(invoice[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  // Payments
  app.get("/api/payments", async (_req, res) => {
    try {
      const result = await db.select().from(payments);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const result = await db.insert(payments).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  // Stock Movements
  app.get("/api/stock-movements", async (_req, res) => {
    try {
      const result = await db.select().from(stock_movements);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock movements" });
    }
  });

  app.post("/api/stock-movements", async (req, res) => {
    try {
      const result = await db.insert(stock_movements).values(req.body).returning();
      
      // Update inventory quantities
      await db.transaction(async (tx) => {
        const movement = result[0];
        const updateQuantity = movement.type === 'in' ? movement.quantity : -movement.quantity;
        
        await tx.update(inventory)
          .set({
            quantity: sql`quantity + ${updateQuantity}`,
            updatedAt: new Date()
          })
          .where(eq(inventory.productId, movement.productId));
      });
      
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid stock movement data" });
    }
  });
}