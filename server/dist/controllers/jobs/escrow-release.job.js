"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopEscrowJob = exports.startEscrowJob = exports.EscrowCronJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const payment_service_1 = require("../../services/payment.service");
class EscrowCronJob {
    /**
     * Start the escrow release cron job
     * Runs every 2 hours to balance performance and responsiveness
     */
    static start() {
        // Run every 2 hours at minute 0 (12:00, 2:00, 4:00, 6:00, etc.)
        this.task = node_cron_1.default.schedule("0 */2 * * *", () => __awaiter(this, void 0, void 0, function* () {
            yield this.executeEscrowRelease();
        }), {
            timezone: "UTC",
        });
        console.log("🚀 Escrow release cron job started - runs every 2 hours");
        console.log(`⏰ Next run: ${this.getNextRunTime()}`);
    }
    /**
     * Execute the escrow release with proper error handling and logging
     */
    static executeEscrowRelease() {
        return __awaiter(this, void 0, void 0, function* () {
            // Prevent overlapping executions
            if (this.jobRunning) {
                console.log("⏳ Escrow job already running, skipping execution");
                return;
            }
            this.jobRunning = true;
            const startTime = Date.now();
            const timestamp = new Date().toISOString();
            try {
                console.log(`🔄 [${timestamp}] Starting escrow release check`);
                const releasedCount = yield (0, payment_service_1.autoReleaseEscrow)();
                const duration = Date.now() - startTime;
                if (releasedCount > 0) {
                    console.log(`✅ [${timestamp}] Successfully released ${releasedCount} payments from escrow (${duration}ms)`);
                    // Optional: Add metrics tracking
                    this.trackMetrics(releasedCount, duration);
                }
                else {
                    console.log(`ℹ️ [${timestamp}] No payments found for escrow release (${duration}ms)`);
                }
            }
            catch (error) {
                const duration = Date.now() - startTime;
                console.error(`❌ [${timestamp}] Escrow release failed after ${duration}ms:`, error);
                // Optional: Send alert to monitoring service
                yield this.handleError(error);
            }
            finally {
                this.jobRunning = false;
                console.log(`⏱️ Next escrow check: ${this.getNextRunTime()}`);
            }
        });
    }
    /**
     * Get the next scheduled run time
     */
    static getNextRunTime() {
        const now = new Date();
        const nextRun = new Date(now);
        // Find next even hour (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
        const currentHour = now.getUTCHours();
        const nextEvenHour = Math.ceil(currentHour / 2) * 2;
        if (nextEvenHour === currentHour && now.getUTCMinutes() === 0) {
            // If it's exactly on an even hour, next run is in 2 hours
            nextRun.setUTCHours(currentHour + 2);
        }
        else {
            nextRun.setUTCHours(nextEvenHour);
        }
        nextRun.setUTCMinutes(0);
        nextRun.setUTCSeconds(0);
        nextRun.setUTCMilliseconds(0);
        return nextRun.toISOString();
    }
    /**
     * Track metrics for monitoring (implement as needed)
     */
    static trackMetrics(releasedCount, duration) {
        // TODO: Implement metrics tracking
        // Examples:
        // - Send to monitoring service (DataDog, New Relic, etc.)
        // - Log to analytics platform
        // - Update dashboard metrics
        console.log(`📊 Metrics - Released: ${releasedCount}, Duration: ${duration}ms`);
    }
    /**
     * Handle errors with proper logging and alerting
     */
    static handleError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: Implement error alerting
            // Examples:
            // - Send email to admin
            // - Post to Slack channel
            // - Send to error tracking service (Sentry, Bugsnag)
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`🚨 Escrow job error requires attention: ${errorMessage}`);
        });
    }
    /**
     * Manually trigger escrow release (for testing/admin use)
     */
    static triggerManually() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔧 Manually triggering escrow release...");
            if (this.jobRunning) {
                throw new Error("Escrow job is already running");
            }
            return new Promise((resolve, reject) => {
                this.executeEscrowRelease()
                    .then(() => {
                    // Job doesn't return value directly, so we'll need to call the service
                    (0, payment_service_1.autoReleaseEscrow)().then(resolve).catch(reject);
                })
                    .catch(reject);
            });
        });
    }
    /**
     * Stop the cron job gracefully
     */
    static stop() {
        if (this.task) {
            this.task.stop();
            this.task.destroy();
            this.task = null;
            console.log("🛑 Escrow release cron job stopped");
        }
    }
    /**
     * Get job status and statistics
     */
    static getStatus() {
        return {
            isActive: this.task !== null,
            isRunning: this.jobRunning,
            nextRun: this.task ? this.getNextRunTime() : null,
            schedule: "0 */2 * * *", // Every 2 hours
            timezone: "UTC",
        };
    }
    /**
     * Update schedule (if needed)
     */
    static updateSchedule(cronExpression) {
        if (!node_cron_1.default.validate(cronExpression)) {
            throw new Error(`Invalid cron expression: ${cronExpression}`);
        }
        this.stop();
        this.task = node_cron_1.default.schedule(cronExpression, () => __awaiter(this, void 0, void 0, function* () {
            yield this.executeEscrowRelease();
        }), {
            timezone: "UTC",
        });
        console.log(`✅ Escrow cron schedule updated to: ${cronExpression}`);
    }
}
exports.EscrowCronJob = EscrowCronJob;
EscrowCronJob.jobRunning = false;
EscrowCronJob.task = null;
// Export simple function for backward compatibility
const startEscrowJob = () => {
    EscrowCronJob.start();
};
exports.startEscrowJob = startEscrowJob;
// Export for graceful shutdown
const stopEscrowJob = () => {
    EscrowCronJob.stop();
};
exports.stopEscrowJob = stopEscrowJob;
// Usage in your main app:
/*
import { EscrowCronJob } from './jobs/escrowCron';

// Start the job
EscrowCronJob.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  EscrowCronJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  EscrowCronJob.stop();
  process.exit(0);
});

// Optional: Admin endpoints
app.get('/api/admin/escrow-job/status', (req, res) => {
  res.json(EscrowCronJob.getStatus());
});

app.post('/api/admin/escrow-job/trigger', async (req, res) => {
  try {
    const releasedCount = await EscrowCronJob.triggerManually();
    res.json({ success: true, releasedCount });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
*/
