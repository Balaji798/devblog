import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { AuthService } from "../services/AuthService";
import { generateTempToken } from "../utils/token";
import logger from "../utils/logger";

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:5000/api/v1"}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) throw new Error("No email found in Google profile");
          const name =
            profile.displayName || profile.name?.givenName || "Google User";

          const payload = await AuthService.linkOAuth(
            email,
            profile.id,
            "google",
            name,
          );
          return done(null, payload);
        } catch (error) {
          logger.error(error, "Google OAuth Error");
          return done(error as Error, false);
        }
      },
    ),
  );
} else {
  logger.warn("Google Client ID/Secret missing - Google OAuth disabled.");
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:5000/api/v1"}/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          const name = profile.displayName || "Facebook User";

          if (!email) {
            const tempToken = generateTempToken(profile.id, name, "facebook");
            return done(null, { isPartial: true, tempToken, name });
          }

          const payload = await AuthService.linkOAuth(
            email,
            profile.id,
            "facebook",
            name,
          );
          return done(null, payload);
        } catch (error) {
          logger.error(error, "Facebook OAuth Error");
          return done(error as Error, false);
        }
      },
    ),
  );
} else {
  logger.warn("Facebook App ID/Secret missing - Facebook OAuth disabled.");
}

export default passport;
