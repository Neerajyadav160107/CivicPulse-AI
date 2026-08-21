const express = require("express");
const multer = require("multer");

const {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
} = require("../controllers/complaintController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Create complaint
router.post(
  "/",
  upload.single("image"),
  createComplaint
);

// Get all complaints
router.get(
  "/",
  getComplaints
);

// Update complaint status
router.patch(
  "/:id/status",
  updateComplaintStatus
);

module.exports = router;