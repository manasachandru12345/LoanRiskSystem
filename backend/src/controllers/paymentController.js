const pool = require("../config/postgres");

// Get all payments
const getPayments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.*,
                l.application_id,
                c.full_name
            FROM payments p
            JOIN loans l ON p.loan_id = l.loan_id
            JOIN loan_applications la
                ON l.application_id = la.application_id
            JOIN customers c
                ON la.customer_id = c.customer_id
            ORDER BY p.payment_id
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM payments
            WHERE payment_id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new payment
const createPayment = async (req, res) => {
    try {
        const { loan_id, payment_amount, payment_date } = req.body;

        if (
            loan_id == null ||
            !Number.isInteger(Number(loan_id)) ||
            Number(loan_id) <= 0 ||
            payment_amount == null ||
            !Number.isFinite(Number(payment_amount)) ||
            Number(payment_amount) <= 0
        ) {
            return res.status(400).json({
                message: "Enter a valid loan ID and payment amount"
            });
        }

        const result = await pool.query(`
            INSERT INTO payments
            (loan_id, payment_amount, payment_date)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [
            Number(loan_id),
            Number(payment_amount),
            payment_date || null
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                message: "Loan ID does not exist"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { payment_status } = req.body;

        const allowedStatuses = ["Paid", "Pending", "Failed"];

        if (!allowedStatuses.includes(payment_status)) {
            return res.status(400).json({
                message: "Status must be Paid, Pending or Failed"
            });
        }

        const result = await pool.query(`
            UPDATE payments
            SET payment_status = $1
            WHERE payment_id = $2
            RETURNING *
        `, [payment_status, req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPayments,
    getPaymentById,
    createPayment,
    updatePaymentStatus
};
