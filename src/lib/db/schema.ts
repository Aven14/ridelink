import { pgTable, text, timestamp, uuid, varchar, real, boolean, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── NextAuth Adapter Tables ──────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  username: varchar("username", { length: 32 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccountType>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

// ─── RideWayv Tables ──────────────────────────────────────────────────────────

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull(),
  inviteCode: varchar("invite_code", { length: 10 }).notNull().unique(),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const groupMembers = pgTable("group_members", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 10 }).notNull().default("member"), // "leader" | "member"
  joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.groupId] })]);

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  speed: real("speed"),       // km/h
  heading: real("heading"),   // degrés 0-360
  accuracy: real("accuracy"), // mètres
  timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
});

export const quickActions = pgTable("quick_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  actionType: varchar("action_type", { length: 20 }).notNull(), // fuel|photo|break|issue|turnback
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const rides = pgTable("rides", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at", { mode: "date" }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { mode: "date" }),
  distanceKm: real("distance_km"),
  participantIds: jsonb("participant_ids").$type<string[]>().default([]),
  routePoints: jsonb("route_points").$type<{ lat: number; lng: number }[]>().default([]),
});
