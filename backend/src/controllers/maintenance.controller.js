const {
  createMaintenanceRequest,
  listMyMaintenanceRequests,
  updateMaintenanceStatus,
} = require("../services/maintenance.service");

function invalid(res, message) {
  return res.status(400).json({ error: { message } });
}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function create(req, res, next) {
  const leaseId = parseId(req.body?.leaseId);
  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const description =
    typeof req.body?.description === "string"
      ? req.body.description.trim()
      : "";
  if (!leaseId || !title || !description)
    return invalid(res, "Lease ID, title, and description are required.");
  if (title.length > 200 || description.length > 3000)
    return invalid(
      res,
      "Title must be at most 200 characters and description at most 3000 characters.",
    );
  try {
    return res
      .status(201)
      .json({
        message: "Maintenance request created successfully.",
        request: await createMaintenanceRequest(req.auth.userId, {
          leaseId,
          title,
          description,
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
      .json({
        requests: await listMyMaintenanceRequests(
          req.auth.userId,
          req.auth.role,
        ),
      });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  const id = parseId(req.params.id);
  const { status } = req.body || {};
  if (!id) return invalid(res, "Maintenance request ID is invalid.");
  if (!["OPEN", "IN_PROGRESS", "COMPLETED", "CLOSED"].includes(status))
    return invalid(
      res,
      "Status must be OPEN, IN_PROGRESS, COMPLETED, or CLOSED.",
    );
  try {
    return res
      .status(200)
      .json({
        request: await updateMaintenanceStatus(id, req.auth.userId, status),
      });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, listMine, updateStatus };
