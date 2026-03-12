import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const resourcesTable = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("other"),
  courseName: text("course_name"),
  description: text("description"),
  filePath: text("file_path"),
  fileName: text("file_name"),
});

export const insertResourceSchema = createInsertSchema(resourcesTable).omit({ id: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resourcesTable.$inferSelect;
