const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshUserAccessToken,
  changePassword,
  verifyEmail,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const passport = require("passport");
const { FRONTEND_URL } = require("../constants/env");
const generateTokens = require("../utils/generateTokens");
const HttpStatus = require("../constants/http");
const ApiError = require("../utils/ApiError");

// Public authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshUserAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected routes (require authentication)
router.post("/logout", authMiddleware, logout);
router.post("/change-password", authMiddleware, changePassword);

// Google OAuth - Initiate login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth - Callback after authentication
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login`,
    session: false,
    scope: ["profile", "email"],
  }),
  (req, res) => {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user);

    // res.redirect(`${FRONTEND_URL}/profile`);
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user,
    });
  }
);

// Get current authenticated user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }

    res.status(HttpStatus.OK).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
