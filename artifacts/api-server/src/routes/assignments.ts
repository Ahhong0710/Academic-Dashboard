import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { assignmentsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateAssignmentBody,
  UpdateAssignmentBody,
  UpdateAssignmentParams,
  DeleteAssignmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(assignmentsTable).orderBy(assignmentsTable.dueDate);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const body = CreateAssignmentBody.parse(req.body);
  const [entry] = await db.insert(assignmentsTable).values(body).returning();
  res.status(201).json(entry);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateAssignmentParams.parse({ id: Number(req.params.id) });
  const body = UpdateAssignmentBody.parse(req.body);
  const [entry] = await db.update(assignmentsTable).set(body).where(eq(assignmentsTable.id, id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(entry);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteAssignmentParams.parse({ id: Number(req.params.id) });
  await db.delete(assignmentsTable).where(eq(assignmentsTable.id, id));
  res.status(204).send();
});

export default router;
