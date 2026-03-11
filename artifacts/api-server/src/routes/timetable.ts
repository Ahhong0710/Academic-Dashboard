import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { timetableTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateTimetableEntryBody,
  UpdateTimetableEntryBody,
  UpdateTimetableEntryParams,
  DeleteTimetableEntryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(timetableTable).orderBy(timetableTable.dayOfWeek, timetableTable.startTime);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const body = CreateTimetableEntryBody.parse(req.body);
  const [entry] = await db.insert(timetableTable).values(body).returning();
  res.status(201).json(entry);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateTimetableEntryParams.parse({ id: Number(req.params.id) });
  const body = UpdateTimetableEntryBody.parse(req.body);
  const [entry] = await db.update(timetableTable).set(body).where(eq(timetableTable.id, id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(entry);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteTimetableEntryParams.parse({ id: Number(req.params.id) });
  await db.delete(timetableTable).where(eq(timetableTable.id, id));
  res.status(204).send();
});

export default router;
