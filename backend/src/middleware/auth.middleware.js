const jwt = require("jsonwebtoken");
const { getJwtConfig } = require("../services/auth.service");

const allowedRoles = ["LANDLORD", "TENANT"];

function unauthorized(res) {
  return res.status(401).json({
    error: { message: "Authentication is required." },
  });
}

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return unauthorized(res);
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return unauthorized(res);
  }

  try {
    const { secret } = getJwtConfig();
    const payload = jwt.verify(token, secret);

    if (
      typeof payload !== "object" ||
      !Number.isInteger(payload.id) ||
      !allowedRoles.includes(payload.role)
    ) {
      return unauthorized(res);
    }

    req.auth = { userId: payload.id, role: payload.role };
    return next();
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }

    return unauthorized(res);
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({
        error: {
          message: "You do not have permission to perform this action.",
        },
      });
    }

    return next();
  };
}

module.exports = { authenticate, authorizeRoles };
