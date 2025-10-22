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
import propertyRoutes from "./routes/propertyRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import mapsRoutes from "./routes/mapsRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { OK } from "./constants/httpStatus";
import { cloudinaryConfig } from "./utils/cloudinaryConfig";
import { EscrowCronJob } from "./controllers/jobs/escrow-release.job";
import { handleStripeWebhook } from "./controllers/payment.controller";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
// Cofigurations
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(
  "/api/webhooks/stripe",
  express.raw({
    type: "application/json",
    limit: "2mb",
  })
);

app.post("/api/webhooks/stripe", handleStripeWebhook);

// initialisation
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://realty-sphere.vercel.app",
      "https://realty-sphere-housing.vercel.app",
    ],
    credentials: true,
  })
);

// Swagger docs route
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// cloudinary config
cloudinaryConfig();

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
// property routes
app.use("/api/properties", propertyRoutes);
// lease router
app.use("/api/lease", leaseRoutes);
// application routes
app.use("/api/applications", applicationRoutes);
// maps Routes
app.use("/api", mapsRoutes);
// apply payment routes
app.use("/api/payment", paymentRoutes);

// start escrow job
EscrowCronJob.start();

// error handler
app.use(errorHandler);

//LISTEN ON PORT NUMBER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on PORT ${PORT}`);
});

process.on("SIGINT", () => {
  EscrowCronJob.stop();
  process.exit(0);
});
