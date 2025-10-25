// src/routes/auth.js
import express from 'express';
import { requestOtp, verifyOtp, registerFaculty, registerAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register-faculty', registerFaculty);
router.post('/register-admin', registerAdmin);

export default router;
