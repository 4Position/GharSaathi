const {
  createPayment,
  listMyPayments,
  updatePaymentStatus,
} = require("../services/payment.service");

function invalid(res, message) {
  return res.status(400).json({ error: { message } });
}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function parseAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function create(req, res, next) {
  const leaseId = parseId(req.body?.leaseId);
  const amount = parseAmount(req.body?.amount);
  const dueDate = parseDate(req.body?.dueDate);
  if (!leaseId || !amount || !dueDate)
    return invalid(
      res,
      "Lease ID, a valid amount, and a valid due date are required.",
    );
  try {
    return res
      .status(201)
      .json({
        message: "Payment record created successfully.",
        payment: await createPayment(req.auth.userId, {
          leaseId,
          amount,
          dueDate,
        }),
      });
  } catch (error) {
    return next(error);
  }
}

async function listMine(req, res, next) {
  try {
    return res
      .status(200)
      .json({ payments: await listMyPayments(req.auth.userId, req.auth.role) });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  const id = parseId(req.params.id);
  const { status } = req.body || {};
  if (!id) return invalid(res, "Payment ID is invalid.");
  if (!["PENDING", "PAID", "OVERDUE"].includes(status))
    return invalid(res, "Status must be PENDING, PAID, or OVERDUE.");
  try {
    return res
      .status(200)
      .json({
        payment: await updatePaymentStatus(id, req.auth.userId, status),
      });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, listMine, updateStatus };
