const {
  submitApplication,
  listTenantApplications,
  listReceivedApplications,
  reviewApplication,
} = require("../services/application.service");

function invalid(res, message) {
  return res.status(400).json({ error: { message } });
}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function submit(req, res, next) {
  const propertyId = parseId(req.body?.propertyId);
  const { message } = req.body || {};
  if (!propertyId) return invalid(res, "Property ID is invalid.");
  if (
    message !== undefined &&
    (typeof message !== "string" || message.trim().length > 1000)
  )
    return invalid(res, "Message must contain no more than 1000 characters.");
  try {
    const application = await submitApplication(
      req.auth.userId,
      propertyId,
      typeof message === "string" && message.trim() ? message.trim() : null,
    );
    return res
      .status(201)
      .json({ message: "Application submitted successfully.", application });
  } catch (error) {
    return next(error);
  }
}

async function listMine(req, res, next) {
  try {
    return res
      .status(200)
      .json({ applications: await listTenantApplications(req.auth.userId) });
  } catch (error) {
    return next(error);
  }
}

async function listReceived(req, res, next) {
  try {
    return res
      .status(200)
      .json({ applications: await listReceivedApplications(req.auth.userId) });
  } catch (error) {
    return next(error);
  }
}

async function updateStatus(req, res, next) {
  const id = parseId(req.params.id);
  const { status } = req.body || {};
  if (!id) return invalid(res, "Application ID is invalid.");
  if (!["APPROVED", "REJECTED"].includes(status))
    return invalid(res, "Status must be APPROVED or REJECTED.");
  try {
    return res
      .status(200)
      .json({
        application: await reviewApplication(id, req.auth.userId, status),
      });
  } catch (error) {
    return next(error);
  }
}

module.exports = { submit, listMine, listReceived, updateStatus };
