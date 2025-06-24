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
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middleware/errorHandler");
const httpStatus_1 = require("./constants/httpStatus");
// Cofigurations
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const APP_ORIGIN = "http://localhost:3000";
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
app.use("/api/auth", authRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
// error handler
app.use(errorHandler_1.errorHandler);
//LISTEN ON PORT NUMBER
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
