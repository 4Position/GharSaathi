const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const env = require("../config/env");

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

function createError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}

function getJwtConfig() {
  if (!env.jwtSecret || !env.jwtExpiresIn) {
    throw createError(500, "Authentication is not configured.");
  }

  return {
    secret: env.jwtSecret,
    expiresIn: env.jwtExpiresIn,
  };
}

async function registerUser({ name, email, password, role }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw createError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: safeUserSelect,
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw createError(409, "An account with this email already exists.");
    }

    throw error;
  }
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...safeUserSelect,
      passwordHash: true,
    },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError(401, "Invalid email or password.");
  }

  const { passwordHash, ...safeUser } = user;
  const jwtConfig = getJwtConfig();
  const token = jwt.sign(
    { id: safeUser.id, role: safeUser.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn },
  );

  return { token, user: safeUser };
}

async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: safeUserSelect,
  });

  if (!user) {
    throw createError(401, "Invalid authentication token.");
  }

  return user;
}

module.exports = {
  getJwtConfig,
  getUserProfile,
  loginUser,
  registerUser,
};
