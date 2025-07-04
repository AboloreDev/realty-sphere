"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.post("/register", auth_controller_1.registerUser);
router.post("/login", auth_controller_1.loginUser);
router.post("/verify-email/:code", auth_controller_1.verifyEmail);
router.post("/resend-email", auth_controller_1.resendVerificationMail);
router.post("/forgot-password", auth_controller_1.forgotPassword);
router.post("/reset-password/verify", auth_controller_1.verifyResetPasswordCode);
router.post("/reset-password", auth_controller_1.resetPassword);
router.post("/logout", auth_controller_1.logout);
exports.default = router;
