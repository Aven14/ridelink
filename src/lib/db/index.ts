import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL || "postgresql://dummy:dummy@ep-dummy-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require");
export const db = drizzle(sql, { schema });

export type DB = typeof db;
