const pool = require("../config/postgres");

// Get all loan applications
const getApplications = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                la.*,
                c.full_name,
                c.email
            FROM loan_applications la
            JOIN customers c
            ON la.customer_id = c.customer_id
            ORDER BY la.application_id
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get application by ID
const getApplicationById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                la.*,
                c.full_name,
                c.email
            FROM loan_applications la
            JOIN customers c
            ON la.customer_id = c.customer_id
            WHERE la.application_id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Loan application not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new loan application
const createApplication = async (req, res) => {
    try {
        const {
            customer_id,
            loan_type,
            requested_amount,
            loan_term_months
        } = req.body;

        if (!customer_id || !loan_type ||
            requested_amount == null || loan_term_months == null) {
            return res.status(400).json({
                message: "Customer ID, loan type, amount and loan term are required"
            });
        }

        if (!Number.isFinite(Number(requested_amount)) ||
            Number(requested_amount) <= 0 ||
            !Number.isInteger(Number(loan_term_months)) ||
            Number(loan_term_months) <= 0) {
            return res.status(400).json({
                message: "Amount and loan term must be positive numbers"
            });
        }

        const result = await pool.query(`
            INSERT INTO loan_applications
            (customer_id, loan_type, requested_amount, loan_term_months)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            customer_id,
            loan_type,
            requested_amount,
            loan_term_months
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                message: "Customer ID does not exist"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

// Update application status
const updateApplication = async (req, res) => {
    try {
        const { application_status } = req.body;

        const allowedStatuses = ["Pending", "Approved", "Rejected"];

        if (!allowedStatuses.includes(application_status)) {
            return res.status(400).json({
                message: "Status must be Pending, Approved or Rejected"
            });
        }

        const result = await pool.query(`
            UPDATE loan_applications
            SET application_status = $1
            WHERE application_id = $2
            RETURNING *
        `, [application_status, req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Loan application not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete application
const deleteApplication = async (req, res) => {
    try {
        const result = await pool.query(`
            DELETE FROM loan_applications
            WHERE application_id = $1
            RETURNING *
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Loan application not found"
            });
        }

        res.json({
            message: "Loan application deleted successfully",
            application: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete this application because related records exist"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
};
