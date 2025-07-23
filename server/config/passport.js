const passport = require("passport");
const bcrypt = require("bcrypt");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = require("../constants/env");

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(profile.id, salt);

        if (user) {
          user.isActive = true;
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          await user.save();
          return done(null, user);
        }

        if (!user) {
          user = await User.create({
            googleId: hashedPassword,
            email: profile.emails[0].value,
            fullname: profile.displayName,
            provider: "google",
            isActive: true,
            password: hashedPassword,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
