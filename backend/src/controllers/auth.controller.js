const {
  getUserProfile,
  loginUser,
  registerUser,
} = require("../services/auth.service");

const allowedRoles = ["LANDLORD", "TENANT"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendValidationError(res, message) {
  return res.status(400).json({ error: { message } });
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getRegistrationData(body) {
  const { name, email, password, role } = body || {};

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100
  ) {
    return { error: "Name must be between 2 and 100 characters." };
  }

  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    return { error: "Please provide a valid email address." };
  }

  if (typeof password !== "string" || password.length < 8) {
    return { error: "Password must contain at least 8 characters." };
  }

  if (!allowedRoles.includes(role)) {
    return { error: "Role must be either LANDLORD or TENANT." };
  }

  return {
    data: {
      name: name.trim(),
      email: normalizeEmail(email),
      password,
      role,
    },
  };
}

function getLoginData(body) {
  const { email, password } = body || {};

  if (typeof email !== "string" || !emailPattern.test(email.trim())) {
    return { error: "Please provide a valid email address." };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Password is required." };
  }

  return { data: { email: normalizeEmail(email), password } };
}

async function register(req, res, next) {
  const result = getRegistrationData(req.body);

  if (result.error) {
    return sendValidationError(res, result.error);
  }

  try {
    const user = await registerUser(result.data);
    return res.status(201).json({
      message: "Registration successful.",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  const result = getLoginData(req.body);

  if (result.error) {
    return sendValidationError(res, result.error);
  }

  try {
    const { token, user } = await loginUser(result.data);
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await getUserProfile(req.auth.userId);
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, me, register };
