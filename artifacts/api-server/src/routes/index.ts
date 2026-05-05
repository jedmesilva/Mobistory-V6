import { Router, type IRouter } from "express";
import healthRouter from "./health";
import fuelRouter from "./fuel";
import vehicleRouter from "./vehicle";

const router: IRouter = Router();

router.use(healthRouter);
router.use(fuelRouter);
router.use(vehicleRouter);

export default router;
