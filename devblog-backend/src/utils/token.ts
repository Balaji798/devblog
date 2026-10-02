import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || "secret", {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
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
    process.env.JWT_SECRET || "secret",
    {
      expiresIn: "15m",
    },
  );
};

export const verifyTempToken = (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as any;
  if (!decoded.isTemp) throw new Error("Invalid token type");
  return decoded;
};
