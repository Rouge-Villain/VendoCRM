import { db } from "../db/index.js";
import { opportunities, products, customers } from "../db/schema.js";

export function registerRoutes(app) {
  // API Routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await db.query.opportunities.findMany();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const products = await db.query.products.findMany();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await db.query.customers.findMany();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}
