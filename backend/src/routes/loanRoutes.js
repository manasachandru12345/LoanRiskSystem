const express = require("express");
const router = express.Router();

const {
    getLoans,
    getLoanById,
    createLoan,
    updateLoanStatus
} = require("../controllers/loanController");

// GET all loans
router.get("/", getLoans);

// GET loan by ID
router.get("/:id", getLoanById);

// POST create loan
router.post("/", createLoan);

// PUT update loan status
router.put("/:id", updateLoanStatus);

module.exports = router;
