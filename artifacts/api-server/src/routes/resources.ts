import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { resourcesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateResourceBody,
  UpdateResourceBody,
  UpdateResourceParams,
  DeleteResourceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const rows = await db.select().from(resourcesTable).orderBy(resourcesTable.type, resourcesTable.title);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const body = CreateResourceBody.parse(req.body);
  const [entry] = await db.insert(resourcesTable).values(body).returning();
  res.status(201).json(entry);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateResourceParams.parse({ id: Number(req.params.id) });
  const body = UpdateResourceBody.parse(req.body);
  const [entry] = await db.update(resourcesTable).set(body).where(eq(resourcesTable.id, id)).returning();
  if (!entry) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(entry);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteResourceParams.parse({ id: Number(req.params.id) });
  await db.delete(resourcesTable).where(eq(resourcesTable.id, id));
  res.status(204).send();
});

export default router;
