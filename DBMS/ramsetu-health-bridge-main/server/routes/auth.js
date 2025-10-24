import express from "express";
import { signup, login, verifyEmail, verifyOtpAndCreateUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtpAndCreateUser);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);

// Debug/utility: return current authenticated user info
router.get("/whoami", authenticate, (req, res) => {
	res.json({ user: req.user });
});

export default router;
