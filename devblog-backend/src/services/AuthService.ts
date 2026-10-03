import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyTempToken,
  verifyRefreshToken,
} from "../utils/token";

export class AuthService {
  static async register(data: any) {
    const existing = await User.findOne({ email: data.email });

    if (existing) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

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
      accessToken,
      refreshToken,
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account deactivated");
    }

    if (!user.password) {
      throw new Error("Use OAuth to sign in");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

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
      accessToken,
      refreshToken,
    };
  }

  static async refresh(oldRefreshToken: string) {
    const decoded = verifyRefreshToken(oldRefreshToken);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new Error("Invalid refresh token");
    }

    // Verify the token against the stored hash.
    if (user.refreshTokenHash !== hashToken(oldRefreshToken)) {
      throw new Error("Refresh token has already been used or revoked");
    }

    // Rotate refresh token.
    const newRefreshToken = generateRefreshToken(user.id, user.role);

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    const accessToken = generateAccessToken(user.id, user.role);

    return {
      accessToken,
      newRefreshToken,
    };
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
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (provider === "google" && existingUser.googleId === providerId) {
        return this.updateOAuthSession(existingUser);
      }

      if (provider === "facebook" && existingUser.facebookId === providerId) {
        return this.updateOAuthSession(existingUser);
      }

      throw new Error(
        "Account exists with a different provider. Explicit linkage required.",
      );
    }

    const newUser = await User.create({
      name: profileName,
      email,
      googleId: provider === "google" ? providerId : undefined,
      facebookId: provider === "facebook" ? providerId : undefined,
    });

    const refreshToken = generateRefreshToken(newUser.id, newUser.role);

    newUser.refreshTokenHash = hashToken(refreshToken);
    await newUser.save();

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
    if (!user.isActive) {
      throw new Error("Account deactivated");
    }

    const refreshToken = generateRefreshToken(user.id, user.role);

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

  static async resetPassword(email: string, newPasswordRaw: string) {
    const user = await User.findOne({ email });
    if (!user || (!user.isActive && !user?.isDeleted)) {
      throw new Error("No active account found for that email address.");
    }

    const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true },
    );

    return Boolean(updatedUser);
  }
}
