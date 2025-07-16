"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const application_controller_1 = require("../controllers/application.controller");
const router = express_1.default.Router();
// List all applications
router.get("/", isAuthenticated_1.isAuthenticated, application_controller_1.listApplications);
// CREATE APPLICATION restrict to tenant alone
router.post("/", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), application_controller_1.createApplication);
// update the appointment
router.patch("/:id", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), application_controller_1.updateApplications);
exports.default = router;
