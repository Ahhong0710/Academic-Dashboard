import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timetableTable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  courseName: text("course_name").notNull(),
  courseCode: varchar("course_code", { length: 50 }),
  instructor: text("instructor"),
  dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  room: text("room"),
  color: varchar("color", { length: 20 }),
});

export const insertTimetableSchema = createInsertSchema(timetableTable).omit({ id: true });
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetableTable.$inferSelect;
