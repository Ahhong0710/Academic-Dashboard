import { Router, type IRouter } from "express";
import healthRouter from "./health";
import timetableRouter from "./timetable";
import assignmentsRouter from "./assignments";
import resourcesRouter from "./resources";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/timetable", timetableRouter);
router.use("/assignments", assignmentsRouter);
router.use("/resources", resourcesRouter);
router.use(storageRouter);

export default router;
