require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/postgres");
const { redisClient, connectRedis } = require("./config/redis");
const customerRoutes = require("./routes/customerRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const riskAssessmentRoutes = require("./routes/riskAssessmentRoutes");
const loanRoutes = require("./routes/loanRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "Loan Risk Management API is running!"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        const db = await pool.query("SELECT NOW()");
        const redis = await redisClient.ping();

        res.json({
            status: "success",
            postgres: "Connected",
            redis,
            database_time: db.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Customer routes
app.use("/api/customers", customerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/risk-assessments", riskAssessmentRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);

async function startServer() {
    try {
        await pool.query("SELECT 1");
        console.log("PostgreSQL connected successfully");

        await connectRedis();

        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    } catch (error) {
        console.error("Startup failed:", error);
        process.exit(1);
    }
}

startServer();
