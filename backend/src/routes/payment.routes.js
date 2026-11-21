const express = require("express");
const {
  create,
  listMine,
  updateStatus,
} = require("../controllers/payment.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();
router.post("/", authenticate, authorizeRoles("LANDLORD"), create);
router.get("/my", authenticate, listMine);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("LANDLORD"),
  updateStatus,
);

module.exports = router;
