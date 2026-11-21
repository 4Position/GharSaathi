const express = require("express");
const {
  submit,
  listMine,
  listReceived,
  updateStatus,
} = require("../controllers/application.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const router = express.Router();
router.post("/", authenticate, authorizeRoles("TENANT"), submit);
router.get("/my", authenticate, authorizeRoles("TENANT"), listMine);
router.get("/received", authenticate, authorizeRoles("LANDLORD"), listReceived);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("LANDLORD"),
  updateStatus,
);
module.exports = router;
