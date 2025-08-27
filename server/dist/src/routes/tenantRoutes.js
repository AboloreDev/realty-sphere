"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const tenant_controller_1 = require("../controllers/tenant.controller");
const router = express_1.default.Router();
// Routes
// get tenant by ID
router.get("/:id", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), tenant_controller_1.getTenant);
// CREATE A NEW TENANT : NOT NNEDED ALREADY HANDLED ON FRONTEND
router.post("/", isAuthenticated_1.isAuthenticated, tenant_controller_1.createTenant);
// UPDATE A TENANT DETAILS
router.patch("/:id", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), tenant_controller_1.updateTenantDetails);
// GET TENANT Residencies
router.get("/:id/residencies", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), tenant_controller_1.getTenantResidences);
// ADD TO FAVORITE
router.post("/:id/favorites/:propertyId", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), tenant_controller_1.addTenantFavoriteProperty);
// DELETE FROM FAVORITE
router.delete("/:id/favorites/:propertyId", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), tenant_controller_1.removeFromFavorite);
// GET TENANT PAYMENT STATUS
// get tenant payment status
router.get("/:tenantId/payments", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), tenant_controller_1.getTenantPaymentStatus);
exports.default = router;
