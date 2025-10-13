import express from "express";
import { updateAvailability, getFacultyAvailability } from "../controllers/facultyController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/availability", auth, updateAvailability);
router.get("/availability", auth, getFacultyAvailability);

export default router;
