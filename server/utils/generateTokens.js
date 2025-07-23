const jwt = require("jsonwebtoken");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = require("../constants/env");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id || user._id || user.userId, email: user.email },
    JWT_ACCESS_SECRET,
    // { expiresIn: "7d" }
    { expiresIn: "10s" }
  );

  const refreshToken = jwt.sign(
    { id: user.id || user._id || user.userId, email: user.email },
    JWT_REFRESH_SECRET,
    // { expiresIn: "30d" }
    { expiresIn: "1m" }
  );

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
