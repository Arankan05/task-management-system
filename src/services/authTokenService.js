const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const REFRESH_DAYS = Number(process.env.JWT_REFRESH_DAYS || 7);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );

const getRefreshExpiry = () => {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_DAYS);
  return d;
};

const createRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(64).toString("hex");

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt: getRefreshExpiry(),
    },
  });

  return raw;
};

const verifyRefreshToken = async (raw) => {
  if (!raw) return null;

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: {
      user: {
        select: {
          id: true,
          role: true,
          email: true,
        },
      },
    },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.refreshToken.delete({ where: { id: record.id } }).catch(() => {});
    }
    return null;
  }

  return record;
};

const revokeRefreshToken = async (raw) => {
  if (!raw) return;
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(raw) },
  });
};

const revokeAllUserRefreshTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

const rotateRefreshToken = async (oldRaw, userId) => {
  await revokeRefreshToken(oldRaw);
  return createRefreshToken(userId);
};

module.exports = {
  ACCESS_EXPIRY,
  REFRESH_DAYS,
  signAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  rotateRefreshToken,
};
