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
    
    // If no products exist, populate with standard vending machine products
    if (result.length === 0) {
      const standardProducts = [
        {
          name: "Snack Machines",
          category: "Vending Machines",
          description: "Advanced snack vending machine with multi-tray configuration, digital payment system, and remote monitoring capabilities.",
          specs: JSON.stringify({
            dimensions: "72\"H x 39\"W x 36\"D",
            capacity: "Up to 45 selections and 360 items",
            payment: "Card reader, mobile payments, cash",
            features: ["LED lighting", "Energy efficient", "Remote monitoring"]
          }),
          price: "4999.99"
        },
        {
          name: "Beverage Machines",
          category: "Vending Machines",
          description: "High-capacity beverage vending machine with cooling system and diverse container compatibility.",
          specs: JSON.stringify({
            dimensions: "72\"H x 42\"W x 34\"D",
            capacity: "Up to 400 bottles/cans",
            payment: "All payment types supported",
            features: ["Quick cooling", "Energy star rated", "Digital display"]
          }),
          price: "5499.99"
        },
        {
          name: "Food Machines",
          category: "Vending Machines",
          description: "Temperature-controlled food vending machine for fresh meals and snacks.",
          specs: JSON.stringify({
            dimensions: "72\"H x 41\"W x 36\"D",
            capacity: "Up to 30 selections",
            payment: "Contactless and traditional payments",
            features: ["Temperature control", "Health timer", "Digital inventory"]
          }),
          price: "6999.99"
        },
        {
          name: "Coffee Machines",
          category: "Vending Machines",
          description: "Premium coffee vending machine with fresh-ground beans and multiple drink options.",
          specs: JSON.stringify({
            dimensions: "70\"H x 30\"W x 30\"D",
            capacity: "Up to 1000 servings",
            payment: "All digital payments supported",
            features: ["Fresh grinding", "Multiple drinks", "Auto cleaning"]
          }),
          price: "7499.99"
        },
        {
          name: "Combo Machines",
          category: "Vending Machines",
          description: "Combined snack and beverage vending machine with dual temperature zones.",
          specs: JSON.stringify({
            dimensions: "72\"H x 55\"W x 36\"D",
            capacity: "200 drinks + 200 snacks",
            payment: "Full payment system",
            features: ["Dual zone cooling", "Large display", "Remote monitoring"]
          }),
          price: "8999.99"
        },
        {
          name: "Cold/Frozen Machines",
          category: "Vending Machines",
          description: "Frozen food and ice cream vending machine with advanced temperature control.",
          specs: JSON.stringify({
            dimensions: "72\"H x 41\"W x 36\"D",
            capacity: "Up to 25 selections",
            payment: "Modern payment systems",
            features: ["Deep freezing", "Smart defrost", "Temperature monitoring"]
          }),
          price: "9499.99"
        }
      ];

      await db.insert(products).values(standardProducts);
      const updatedResult = await db.select().from(products);
      res.json(updatedResult);
    } else {
      res.json(result);
    }
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
  // Deal Pipeline Routes
  app.patch("/api/opportunities/:id/stage", async (req, res) => {
    try {
      const { stage } = req.body;
      const id = parseInt(req.params.id);
      
      const result = await db
        .update(opportunities)
        .set({ 
          stage,
          updatedAt: new Date()
        })
        .where(eq(opportunities.id, id))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Stage update error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(400).json({
        error: "Failed to update stage",
        details: errorMessage
      });
    }
  });

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
