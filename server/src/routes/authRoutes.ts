import express from "express";
import {
  forgotPassword,
  loginUser,
  logout,
  registerUser,
  resendVerificationMail,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email/:code", verifyEmail);
router.post("/resend-email", resendVerificationMail);
router.post("forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/logout", logout);

export default router;
