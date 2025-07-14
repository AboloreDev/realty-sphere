import express from "express";
import { getAllLease, getLeasePayment } from "../controllers/lease.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/", isAuthenticated, getAllLease);
router.get("/:id/payment", isAuthenticated, getLeasePayment);
export default router;
