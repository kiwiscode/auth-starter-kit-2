const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const { JWT_REFRESH_SECRET, FRONTEND_URL } = require("../constants/env");
const {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} = require("../utils/emailTemplates");
const generateTokens = require("../utils/generateTokens");

const {
  ONE_DAY_MS,
  oneYearFromNow,
  FIFTEEN_SECONDS_MS,
} = require("../utils/date");
const HttpStatus = require("../constants/http");

exports.register = async (req, res, next) => {
  try {
    const { email, fullname, password } = req.body;
    if (!email || !fullname || !password) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "All fields are required.");
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Password must be at least 8 characters and include a lowercase letter, uppercase letter, and digit."
      );
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(
        HttpStatus.CONFLICT,
        "A user with this email already exists."
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Email verification token ve expire oluştur
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpire = oneYearFromNow();
    const user = await User.create({
      email,
      fullname,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpire,
      emailVerified: false,
    });
    const { accessToken, refreshToken } = generateTokens(user);

    // Email verification linki gönder
    const verifyUrl = `${FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail({
      to: user.email,
      ...getVerifyEmailTemplate(verifyUrl),
    });

    res.status(HttpStatus.CREATED).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
      message: "Registration successful! Please verify your email address.",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Email and password are required."
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
    }
    const { accessToken, refreshToken } = generateTokens(user);

    user.isActive = true;
    await user.save();
    res.status(HttpStatus.OK).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Email is required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
      // Always return the same message for security reasons
      return res.status(HttpStatus.OK).json({
        message:
          "If this email is registered, password reset instructions have been sent.",
      });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpire = Date.now() + 1000 * 60 * 15; // Valid for 15 minutes
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      ...getPasswordResetTemplate(resetUrl),
    });
    res.status(HttpStatus.OK).json({
      message:
        "If this email is registered, password reset instructions have been sent.",
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Token and new password are required."
      );
    }
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Password must be at least 8 characters and include a lowercase letter, uppercase letter, and digit."
      );
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid or expired token.");
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.isActive = true;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(HttpStatus.OK).json({
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found.");
    }
    user.isActive = false;
    await user.save();

    res.status(HttpStatus.OK).json({ message: "Successfully logged out." });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Old password and new password are required."
      );
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Password must be at least 8 characters and include a lowercase letter, uppercase letter, and digit."
      );
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found.");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Old password is incorrect.");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res
      .status(HttpStatus.OK)
      .json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
};

exports.refreshUserAccessToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, "Refresh token not found.");
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
      if (err) {
        throw new ApiError(
          HttpStatus.FORBIDDEN,
          "Invalid or expired refresh token."
        );
      }

      // Remaining time (ms)
      const now = Date.now();
      const expMs = user.exp * 1000;
      const timeLeft = expMs - now;

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(user);

      res.status(HttpStatus.OK).json({
        accessToken,
        // refreshToken: timeLeft <= ONE_DAY_MS ? newRefreshToken : null,
        refreshToken: timeLeft <= FIFTEEN_SECONDS_MS ? newRefreshToken : null,
      });
    });
  } catch (err) {
    next(err);
  }
};

// Email verification endpoint
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new ApiError(HttpStatus.BAD_REQUEST, "Token is required.");
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(
        HttpStatus.BAD_REQUEST,
        "Invalid or expired verification token."
      );
    }

    if (user.emailVerified) {
      return res
        .status(HttpStatus.OK)
        .json({ message: "Email is already verified." });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpire = null;
    await user.save();

    return res
      .status(HttpStatus.OK)
      .json({ message: "Email successfully verified." });
  } catch (err) {
    next(err);
  }
};
