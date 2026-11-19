const pool = require("../config/postgres");

// Get all loans
const getLoans = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                l.*,
                c.full_name,
                c.email,
                la.loan_type
            FROM loans l
            JOIN loan_applications la
                ON l.application_id = la.application_id
            JOIN customers c
                ON la.customer_id = c.customer_id
            ORDER BY l.loan_id
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get loan by ID
const getLoanById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM loans
            WHERE loan_id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Loan not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new loan
const createLoan = async (req, res) => {
    try {
        const {
            application_id,
            approved_amount,
            interest_rate,
            start_date
        } = req.body;

        if (
            application_id == null ||
            !Number.isInteger(Number(application_id)) ||
            Number(application_id) <= 0 ||
            approved_amount == null ||
            !Number.isFinite(Number(approved_amount)) ||
            Number(approved_amount) <= 0 ||
            interest_rate == null ||
            !Number.isFinite(Number(interest_rate)) ||
            Number(interest_rate) < 0
        ) {
            return res.status(400).json({
                message: "Enter a valid application ID, approved amount and interest rate"
            });
        }

        const application = await pool.query(`
            SELECT application_status
            FROM loan_applications
            WHERE application_id = $1
        `, [Number(application_id)]);

        if (application.rows.length === 0) {
            return res.status(400).json({
                message: "Loan application does not exist"
            });
        }

        if (application.rows[0].application_status !== "Approved") {
            return res.status(400).json({
                message: "Only approved applications can receive a loan"
            });
        }

        const result = await pool.query(`
            INSERT INTO loans
            (application_id, approved_amount, interest_rate, start_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            Number(application_id),
            Number(approved_amount),
            Number(interest_rate),
            start_date || null
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A loan already exists for this application"
            });
        }

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Loan application does not exist"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

// Update loan status
const updateLoanStatus = async (req, res) => {
    try {
        const { loan_status } = req.body;

        const allowedStatuses = [
            "Active",
            "Closed",
            "Defaulted"
        ];

        if (!allowedStatuses.includes(loan_status)) {
            return res.status(400).json({
                message: "Status must be Active, Closed or Defaulted"
            });
        }

        const result = await pool.query(`
            UPDATE loans
            SET loan_status = $1
            WHERE loan_id = $2
            RETURNING *
        `, [loan_status, req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Loan not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getLoans,
    getLoanById,
    createLoan,
    updateLoanStatus
};
