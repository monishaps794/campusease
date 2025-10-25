import express from "express";
import auth from "../middleware/auth.js";
import { listStaffrooms, getNotificationsForUser } from "../controllers/commonController.js";

const router = express.Router();

router.get("/staffrooms", auth, listStaffrooms);
router.get("/notifications", auth, getNotificationsForUser);

export default router;
