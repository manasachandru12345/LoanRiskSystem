const express = require("express");
const router = express.Router();

const {
    getApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication
} = require("../controllers/applicationController");

// GET all applications
router.get("/", getApplications);

// GET application by ID
router.get("/:id", getApplicationById);

// POST new application
router.post("/", createApplication);

// PUT update application status
router.put("/:id", updateApplication);

// DELETE application
router.delete("/:id", deleteApplication);

module.exports = router;
