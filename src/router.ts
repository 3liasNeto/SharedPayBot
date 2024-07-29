import { Router } from "express";
import { botController } from "./controller/bot-controller";

const router: Router = Router()

//Routes
router.get("/", botController.setupClient);

export { router };