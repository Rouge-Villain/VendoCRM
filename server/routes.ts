import type { Express } from "express";
import { db } from "db";
import { customers, products, opportunities, activities, maintenanceRecords } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Customers
  app.get("/api/customers", async (req, res) => {
    const result = await db.select().from(customers);
    res.json(result);
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const result = await db.insert(customers).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const result = await db.delete(customers)
        .where(eq(customers.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to delete customer" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const result = await db.select().from(products);
    res.json(result);
  });

  app.get("/api/products/:id", async (req, res) => {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(req.params.id)));
    if (result.length === 0) {
      res.status(404).json({ error: "Product not found" });
    } else {
      res.json(result[0]);
    }
  });

  // Opportunities
  app.get("/api/opportunities", async (req, res) => {
    const result = await db.select().from(opportunities);
    res.json(result);
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const result = await db.insert(opportunities).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    const result = await db
      .select()
      .from(activities)
      .orderBy(activities.createdAt);
    res.json(result);
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const result = await db.insert(activities).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid activity data" });
    }
  });

  // Maintenance Records
  app.get("/api/maintenance", async (req, res) => {
    const customerId = req.query.customerId;
    const query = customerId 
      ? db.select().from(maintenanceRecords).where(eq(maintenanceRecords.customerId, Number(customerId)))
      : db.select().from(maintenanceRecords);
    
    const result = await query;
    res.json(result);
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const data = {
        ...req.body,
        scheduledDate: new Date(req.body.scheduledDate)
      };
      console.log("Processing maintenance data:", data);
      const result = await db.insert(maintenanceRecords).values(data).returning();
      res.json(result[0]);
    } catch (error: unknown) {
      console.error("Maintenance creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(400).json({ 
        error: "Invalid maintenance record data", 
        details: errorMessage 
      });
    }
  });
  app.patch("/api/maintenance/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const id = parseInt(req.params.id);
      
      const result = await db
        .update(maintenanceRecords)
        .set({ 
          status,
          completedDate: status === "done" ? new Date() : null,
          updatedAt: new Date()
        })
        .where(eq(maintenanceRecords.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Maintenance record not found" });
      }

      res.json(result[0]);
    } catch (error: unknown) {
      console.error("Status update error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(400).json({
        error: "Failed to update status",
        details: errorMessage
      });
    }
  });

}
