const { checkDatabaseConnection } = require("../services/health.service");

async function getHealth(req, res, next) {
  try {
    await checkDatabaseConnection();

    return res.status(200).json({
      status: "ok",
      api: "healthy",
      database: "connected",
    });
  } catch (error) {
    error.statusCode = 503;
    error.publicMessage = "Database connection is unavailable.";
    return next(error);
  }
}

module.exports = { getHealth };
