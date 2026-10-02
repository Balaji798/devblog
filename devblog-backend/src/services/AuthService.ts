import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyTempToken,
} from "../utils/token";

export class AuthService {
  static async register(
    data: any,
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const refreshToken = generateRefreshToken();

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      refreshTokenHash: hashToken(refreshToken),
    });

    const accessToken = generateAccessToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarIndex: user.avatarIndex,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email });
    if (!user || user.googleId || user.facebookId) {
      // Basic check for wrong provider
      if (user && !user.password) throw new Error("Use OAuth to sign in");
      if (!user) throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account deactivated");
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw new Error("Invalid credentials");

    const refreshToken = generateRefreshToken();
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    const accessToken = generateAccessToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarIndex: user.avatarIndex,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const hash = hashToken(oldRefreshToken);
    const user = await User.findOne({ refreshTokenHash: hash });

    if (!user || !user.isActive) {
      throw new Error("Invalid refresh token or inactive user");
    }

    // Token Rotation (invalidates the old hash by replacing it)
    const newRefreshToken = generateRefreshToken();
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    const accessToken = generateAccessToken(user.id, user.role);
    return { accessToken, newRefreshToken };
  }

  static async logout(refreshToken: string) {
    if (!refreshToken) return;
    const hash = hashToken(refreshToken);
    await User.updateOne(
      { refreshTokenHash: hash },
      { $unset: { refreshTokenHash: 1 } },
    );
  }

  static async linkOAuth(
    email: string,
    providerId: string,
    provider: "google" | "facebook",
    profileName: string,
  ) {
    // Exact policy: If user exists, we check if they ALREADY linked the other provider.
    // If they exist but haven't linked securely, we reject implicit linking.
    // (In a real enterprise system this would send a verification email, but for this assignment we will strictly reject implicit linking if it's already an existing password account that hasn't explicitly been linked).
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (provider === "google" && existingUser.googleId === providerId) {
        return this.updateOAuthSession(existingUser);
      }
      if (provider === "facebook" && existingUser.facebookId === providerId) {
        return this.updateOAuthSession(existingUser);
      }

      throw new Error(
        "Account exists with a different provider or password. Explicit linkage required from settings (feature not strictly implemented here).",
      );
    }

    // New user
    const refreshToken = generateRefreshToken();
    const newUser = await User.create({
      name: profileName,
      email,
      googleId: provider === "google" ? providerId : undefined,
      facebookId: provider === "facebook" ? providerId : undefined,
      refreshTokenHash: hashToken(refreshToken),
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarIndex: newUser.avatarIndex,
      },
      accessToken: generateAccessToken(newUser.id, newUser.role),
      refreshToken,
    };
  }

  private static async updateOAuthSession(user: IUser) {
    if (!user.isActive) throw new Error("Account deactivated");
    const refreshToken = generateRefreshToken();
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarIndex: user.avatarIndex,
      },
      accessToken: generateAccessToken(user.id, user.role),
      refreshToken,
    };
  }

  static async completeOAuth(tempToken: string, email: string) {
    const decoded = verifyTempToken(tempToken);
    return this.linkOAuth(
      email,
      decoded.providerId,
      decoded.provider,
      decoded.name,
    );
  }
}
