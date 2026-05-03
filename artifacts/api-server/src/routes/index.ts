import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fuelRouter from "./fuel";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fuelRouter);

export default router;
