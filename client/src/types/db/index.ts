import { z } from "zod";

// Re-export all types from schema
export * from "../schema";

// Additional database specific types can be added here
export type DatabaseError = {
  code: string;
  message: string;
};

export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};
