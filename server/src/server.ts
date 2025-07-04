import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import tenantRoutes from "./routes/tenantRoutes";
import landlordRoutes from "./routes/landlordRoutes";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { OK } from "./constants/httpStatus";
// Cofigurations
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const APP_ORIGIN = " http://localhost:3000";

// initialisation
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

// routes definition
app.get("/", (req, res) => {
  res.status(OK).json({
    status: "healthy",
  });
});

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// routes
// AUTH ROUTES
app.use("/api/auth", authRoutes);
// USER ROUTES
app.use("/api/user", userRoutes);
// TENANT ROUTES
app.use("/api/tenant", tenantRoutes);
// manager ROUTES
app.use("/api/landlord", landlordRoutes);

// error handler
app.use(errorHandler);

//LISTEN ON PORT NUMBER
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
