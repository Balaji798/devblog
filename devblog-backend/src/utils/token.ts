import jwt from "jsonwebtoken";
import crypto from "crypto";

const getAccessSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }
  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is missing");
  }
  return process.env.JWT_REFRESH_SECRET;
};

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role, type: "access" }, getAccessSecret(), {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string, role: string) => {
  return jwt.sign(
    {
      id: userId,
      role,
      type: "refresh",
      jti: crypto.randomUUID(),
    },
    getRefreshSecret(),
    { expiresIn: "7d" },
  );
};

export const verifyRefreshToken = (token: string) => {
  const decoded = jwt.verify(token, getRefreshSecret()) as jwt.JwtPayload;

  if (decoded.type !== "refresh" || !decoded.id) {
    throw new Error("Invalid refresh token");
  }

  return decoded;
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateTempToken = (
  providerId: string,
  name: string,
  provider: string,
) => {
  return jwt.sign(
    { providerId, name, provider, isTemp: true },
    getAccessSecret(),
    { expiresIn: "15m" },
  );
};

export const verifyTempToken = (token: string) => {
  const decoded = jwt.verify(token, getAccessSecret()) as jwt.JwtPayload;

  if (!decoded.isTemp) {
    throw new Error("Invalid token type");
  }

  return decoded;
};
