const express = require("express");
const router = express.Router();

const {
    getCustomers,
    getCustomerById,
    createCustomer
} = require("../controllers/customerController");

// GET all customers
router.get("/", getCustomers);

// GET customer by ID
router.get("/:id", getCustomerById);

// POST create customer
router.post("/", createCustomer);

module.exports = router;
