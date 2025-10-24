import express from "express";
import { updateAvailability, getFacultyAvailability,updateFacultyProfile } from "../controllers/facultyController.js";
import auth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/availability", auth, updateAvailability);
router.get("/availability", auth, getFacultyAvailability);
router.post("/save-profile", updateFacultyProfile);

export default router;
