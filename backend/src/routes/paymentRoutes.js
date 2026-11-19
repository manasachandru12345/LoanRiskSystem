const express = require("express");
const router = express.Router();

const {
    getPayments,
    getPaymentById,
    createPayment,
    updatePaymentStatus
} = require("../controllers/paymentController");

// GET all payments
router.get("/", getPayments);

// GET payment by ID
router.get("/:id", getPaymentById);

// POST new payment
router.post("/", createPayment);

// PUT update payment status
router.put("/:id", updatePaymentStatus);

module.exports = router;
