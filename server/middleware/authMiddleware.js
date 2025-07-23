const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { JWT_ACCESS_SECRET } = require("../constants/env");
const HttpStatus = require("../constants/http");

module.exports = (req, res, next) => {
  // get the header from authorization information
  const authHeader = req.headers.authorization;
  // get the token from authorization
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(HttpStatus.UNAUTHORIZED, "NoAccessToken");
  }
  jwt.verify(token, JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("TokenExpiredError from middleware");
        throw new ApiError(HttpStatus.UNAUTHORIZED, "TokenExpiredError");
      } else {
        console.log("Invalid token from middleware");
        throw new ApiError(HttpStatus.FORBIDDEN, "Invalid token");
      }
    }
    req.userId = decoded.id || decoded._id || decoded.userId;
    next();
  });
};
