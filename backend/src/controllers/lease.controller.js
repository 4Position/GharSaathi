const {
  createLease,
  listMyLeases,
  getLeaseForUser,
  updateLeaseStatus,
} = require("../services/lease.service");
function invalid(res, message) {
  return res.status(400).json({ error: { message } });
}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}
async function create(req, res, next) {
  const applicationId = parseId(req.body?.applicationId);
  const startDate = parseDate(req.body?.startDate);
  const endDate = parseDate(req.body?.endDate);
  if (!applicationId || !startDate || !endDate || startDate >= endDate)
    return invalid(
      res,
      "Application ID and a valid start and end date are required.",
    );
  try {
    return res.status(201).json({
      lease: await createLease(req.auth.userId, {
        applicationId,
        startDate,
        endDate,
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
      .json({ leases: await listMyLeases(req.auth.userId, req.auth.role) });
  } catch (error) {
    return next(error);
  }
}
async function getById(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) return invalid(res, "Lease ID is invalid.");
  try {
    return res.status(200).json({
      lease: await getLeaseForUser(id, req.auth.userId, req.auth.role),
    });
  } catch (error) {
    return next(error);
  }
}
async function updateStatus(req, res, next) {
  const id = parseId(req.params.id);
  const { status } = req.body || {};
  if (!id) return invalid(res, "Lease ID is invalid.");
  if (!["ACTIVE", "ENDED", "TERMINATED"].includes(status))
    return invalid(res, "Status must be ACTIVE, ENDED, or TERMINATED.");
  try {
    return res
      .status(200)
      .json({ lease: await updateLeaseStatus(id, req.auth.userId, status) });
  } catch (error) {
    return next(error);
  }
}
module.exports = { create, listMine, getById, updateStatus };
