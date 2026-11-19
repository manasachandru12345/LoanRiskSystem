
const pool = require("../config/postgres");
const { redisClient } = require("../config/redis");

// Get all customers
const getCustomers = async (req, res) => {
    try {
        const cachedCustomers = await redisClient.get("customers:all");

        if (cachedCustomers) {
            console.log("Customers fetched from Redis cache");
            return res.json(JSON.parse(cachedCustomers));
        }

        const result = await pool.query(
            "SELECT * FROM customers ORDER BY customer_id"
        );

        await redisClient.setEx(
            "customers:all",
            60,
            JSON.stringify(result.rows)
        );

        console.log("Customers fetched from PostgreSQL and cached in Redis");
        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM customers WHERE customer_id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new customer
const createCustomer = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            annual_income,
            employment_status
        } = req.body;

        // Validate required fields
        if (!full_name || !email || annual_income === undefined ||
            annual_income === null || annual_income === "") {
            return res.status(400).json({
                message: "Full name, email and annual income are required"
            });
        }

        const income = Number(annual_income);

        if (!Number.isFinite(income) || income < 0) {
            return res.status(400).json({
                message: "Annual income must be a valid non-negative number"
            });
        }

        const result = await pool.query(
            `INSERT INTO customers
             (full_name, email, phone, annual_income, employment_status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                full_name,
                email,
                phone || null,
                income,
                employment_status || null
            ]
        );

        // Clear cache after insertion
        await redisClient.del("customers:all");

        res.status(201).json(result.rows[0]);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCustomers,
    getCustomerById,
    createCustomer
};
