import express from "express";
import { signup, login, verifyEmail, verifyOtpAndCreateUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { getPasswordStrength } from "../utils/validation.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtpAndCreateUser);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);

// Check password strength in real-time
router.post("/check-password-strength", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  const strength = getPasswordStrength(password);
  res.json(strength);
});

// Debug/utility: return current authenticated user info
router.get("/whoami", authenticate, (req, res) => {
	res.json({ user: req.user });
});

export default router;
