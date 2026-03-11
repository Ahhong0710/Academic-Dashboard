import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assignmentsTable = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  courseName: text("course_name").notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
});

export const insertAssignmentSchema = createInsertSchema(assignmentsTable).omit({ id: true });
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignmentsTable.$inferSelect;
