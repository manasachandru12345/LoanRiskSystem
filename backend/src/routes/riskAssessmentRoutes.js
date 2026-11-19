const express = require("express");
const router = express.Router();

const {
    getRiskAssessments,
    getRiskAssessmentById,
    createRiskAssessment
} = require("../controllers/riskAssessmentController");

// GET all risk assessments
router.get("/", getRiskAssessments);

// GET risk assessment by ID
router.get("/:id", getRiskAssessmentById);

// POST new risk assessment
router.post("/", createRiskAssessment);

module.exports = router;
