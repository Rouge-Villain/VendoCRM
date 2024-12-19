import type { Express } from "express";
import { db } from "db";
import { customers, products, opportunities, activities, maintenanceRecords, loyaltyRewards } from "@db/schema";
import { eq, sql } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Customers
  app.get("/api/customers", async (req, res) => {
    const result = await db.select().from(customers);
    res.json(result);
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const result = await db
        .select()
        .from(customers)
        .where(eq(customers.id, parseInt(req.params.id)));

      if (result.length === 0) {
        res.status(404).json({ error: "Customer not found" });
      } else {
        res.json(result[0]);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer details" });
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
    try {
      const customerId = req.query.customerId;
      const query = customerId
        ? db.select().from(activities).where(eq(activities.customerId, Number(customerId)))
        : db.select().from(activities);

      let result = await query;

      // If no activities exist and a customerId is provided, create dummy data
      if (result.length === 0 && customerId) {
        const now = new Date();
        const dummyActivities = [
          {
            customerId: Number(customerId),
            type: "call",
            description: "Discussed new vending machine placement options",
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
            contactMethod: "phone",
            contactedBy: "Sales Rep",
            outcome: "Positive",
            nextSteps: "Send follow-up email",
            followUpDate: new Date(now.getTime() + 24 * 60 * 60 * 1000)
          },
          {
            customerId: Number(customerId),
            type: "email",
            description: "Sent quote for new beverage machines",
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            contactMethod: "email",
            contactedBy: "Sales Rep",
            outcome: "Pending",
            nextSteps: "Follow up next week",
            followUpDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            customerId: Number(customerId),
            type: "meeting",
            description: "Site survey for machine installation",
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            contactMethod: "in-person",
            contactedBy: "Technical Team",
            outcome: "Completed",
            nextSteps: "Schedule installation",
            followUpDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
          }
        ];

        // Insert dummy activities
        await db.insert(activities).values(dummyActivities);

        // Fetch the inserted activities
        result = await query;
      }

      res.json(result);
    } catch (error) {
      console.error('Error handling activities:', error);
      res.status(500).json({ error: "Failed to handle activities" });
    }
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

  // Deal Pipeline Routes
  app.patch("/api/opportunities/:id/stage", async (req, res) => {
    try {
      const { stage } = req.body;
      const id = parseInt(req.params.id);

      console.log(`Updating opportunity ${id} stage to: ${stage}`);

      // Validate the stage value
      if (!stage) {
        return res.status(400).json({ error: "Stage is required" });
      }

      // Check if opportunity exists before updating
      const existing = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, id));

      if (existing.length === 0) {
        console.error(`Opportunity ${id} not found`);
        return res.status(404).json({ error: "Opportunity not found" });
      }

      const result = await db
        .update(opportunities)
        .set({
          stage,
          updatedAt: new Date()
        })
        .where(eq(opportunities.id, id))
        .returning();

      console.log(`Successfully updated opportunity ${id} stage to ${stage}`);
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

  // Loyalty Points Routes
  app.get("/api/customers/:id/loyalty", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const customer = await db
        .select({
          loyaltyPoints: customers.loyaltyPoints,
          loyaltyTier: customers.loyaltyTier,
          lastPointsEarned: customers.lastPointsEarned
        })
        .from(customers)
        .where(eq(customers.id, customerId));

      if (customer.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const rewardHistory = await db
        .select()
        .from(loyaltyRewards)
        .where(eq(loyaltyRewards.customerId, customerId))
        .orderBy(loyaltyRewards.transactionDate);

      res.json({
        loyalty: customer[0],
        history: rewardHistory
      });
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      res.status(500).json({ error: "Failed to fetch loyalty data" });
    }
  });

  app.post("/api/customers/:id/loyalty/earn", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { points, source, description } = req.body;

      // Add points to customer's balance
      const updatedCustomer = await db
        .update(customers)
        .set({
          loyaltyPoints: sql`${customers.loyaltyPoints} + ${points}`,
          lastPointsEarned: new Date(),
          // Update tier based on total points
          loyaltyTier: sql`CASE 
            WHEN loyalty_points + ${points} >= 1000 THEN 'platinum'
            WHEN loyalty_points + ${points} >= 500 THEN 'gold'
            WHEN loyalty_points + ${points} >= 200 THEN 'silver'
            ELSE 'standard'
          END`
        })
        .where(eq(customers.id, customerId))
        .returning();

      // Record the transaction
      const rewardRecord = await db.insert(loyaltyRewards).values({
        customerId,
        points,
        type: 'earned',
        source,
        description,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Points expire in 1 year
      }).returning();

      res.json({
        customer: updatedCustomer[0],
        reward: rewardRecord[0]
      });
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      res.status(500).json({ error: "Failed to add loyalty points" });
    }
  });

  app.post("/api/customers/:id/loyalty/redeem", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { points, description } = req.body;

      // Check if customer has enough points
      const customer = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId));

      if (customer[0].loyaltyPoints < points) {
        return res.status(400).json({ error: "Insufficient points" });
      }

      // Deduct points from balance
      const updatedCustomer = await db
        .update(customers)
        .set({
          loyaltyPoints: sql`${customers.loyaltyPoints} - ${points}`,
          // Update tier based on remaining points
          loyaltyTier: sql`CASE 
            WHEN loyalty_points - ${points} >= 1000 THEN 'platinum'
            WHEN loyalty_points - ${points} >= 500 THEN 'gold'
            WHEN loyalty_points - ${points} >= 200 THEN 'silver'
            ELSE 'standard'
          END`
        })
        .where(eq(customers.id, customerId))
        .returning();

      // Record the redemption
      const rewardRecord = await db.insert(loyaltyRewards).values({
        customerId,
        points: -points,
        type: 'redeemed',
        source: 'redemption',
        description,
      }).returning();

      res.json({
        customer: updatedCustomer[0],
        reward: rewardRecord[0]
      });
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
      res.status(500).json({ error: "Failed to redeem loyalty points" });
    }
  });
}