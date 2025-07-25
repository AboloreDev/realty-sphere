"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const landlordRoutes_1 = __importDefault(require("./routes/landlordRoutes"));
const propertyRoutes_1 = __importDefault(require("./routes/propertyRoutes"));
const applicationRoutes_1 = __importDefault(require("./routes/applicationRoutes"));
const leaseRoutes_1 = __importDefault(require("./routes/leaseRoutes"));
const mapsRoutes_1 = __importDefault(require("./routes/mapsRoutes"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middleware/errorHandler");
const httpStatus_1 = require("./constants/httpStatus");
const cloudinaryConfig_1 = require("./utils/cloudinaryConfig");
// Cofigurations
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const APP_ORIGIN = " http://localhost:3000";
// initialisation
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: APP_ORIGIN,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// cloudinary config
(0, cloudinaryConfig_1.cloudinaryConfig)();
// routes definition
app.get("/", (req, res) => {
    res.status(httpStatus_1.OK).json({
        status: "healthy",
    });
});
app.use("/api/auth", (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
}));
// routes
// AUTH ROUTES
app.use("/api/auth", authRoutes_1.default);
// USER ROUTES
app.use("/api/user", userRoutes_1.default);
// TENANT ROUTES
app.use("/api/tenant", tenantRoutes_1.default);
// manager ROUTES
app.use("/api/landlord", landlordRoutes_1.default);
// property routes
app.use("/api/properties", propertyRoutes_1.default);
// lease router
app.use("/api/lease", leaseRoutes_1.default);
// application routes
app.use("/api/applications", applicationRoutes_1.default);
// maps Routes
app.use("/api", mapsRoutes_1.default);
// error handler
app.use(errorHandler_1.errorHandler);
//LISTEN ON PORT NUMBER
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
