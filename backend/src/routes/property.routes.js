const express = require("express");
const {
  create,
  getById,
  list,
  listMine,
  update,
  updateStatus,
} = require("../controllers/property.controller");
const {
  authenticate,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", list);
router.get("/my", authenticate, authorizeRoles("LANDLORD"), listMine);
router.get("/:id", getById);
router.post("/", authenticate, authorizeRoles("LANDLORD"), create);
router.put("/:id", authenticate, authorizeRoles("LANDLORD"), update);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("LANDLORD"),
  updateStatus,
);

module.exports = router;
