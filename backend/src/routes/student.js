// backend/src/routes/student.js
import express from "express";
import { updateStudentInfo, registerStudent , getStudentProfile} from "../controllers/studentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register student (admin or self-registration)
router.post("/register", registerStudent);

// ✅ Update student info (protected)
router.put("/update-info", verifyToken, updateStudentInfo);

// ✅ Get student profile by email (protected)
router.get("/profile", getStudentProfile);

export default router;
