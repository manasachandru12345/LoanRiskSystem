const pool = require("../config/postgres");

// Get all risk assessments
const getRiskAssessments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ra.*,
                la.loan_type,
                la.requested_amount,
                c.full_name,
                c.email
            FROM risk_assessments ra
            JOIN loan_applications la
                ON ra.application_id = la.application_id
            JOIN customers c
                ON la.customer_id = c.customer_id
            ORDER BY ra.assessment_id
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get risk assessment by ID
const getRiskAssessmentById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM risk_assessments
            WHERE assessment_id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Risk assessment not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new risk assessment
const createRiskAssessment = async (req, res) => {
    try {
        const { application_id, credit_score } = req.body;

        if (
            application_id == null ||
            !Number.isInteger(Number(application_id)) ||
            Number(application_id) <= 0 ||
            credit_score == null ||
            !Number.isInteger(Number(credit_score)) ||
            Number(credit_score) < 300 ||
            Number(credit_score) > 850
        ) {
            return res.status(400).json({
                message: "Enter a valid application ID and credit score between 300 and 850"
            });
        }

        const score = Number(credit_score);

        let risk_level;
        let risk_percentage;
        let remarks;

        // Illustrative project rule based on credit score
        if (score >= 750) {
            risk_level = "Low";
            risk_percentage = 15;
            remarks = "Good credit profile";
        } else if (score >= 650) {
            risk_level = "Medium";
            risk_percentage = 45;
            remarks = "Average credit profile";
        } else {
            risk_level = "High";
            risk_percentage = 80;
            remarks = "Low credit score";
        }

        const result = await pool.query(`
            INSERT INTO risk_assessments
            (application_id, credit_score, risk_level, risk_percentage, remarks)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            Number(application_id),
            score,
            risk_level,
            risk_percentage,
            remarks
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                message: "Loan application ID does not exist"
            });
        }

        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getRiskAssessments,
    getRiskAssessmentById,
    createRiskAssessment
};
