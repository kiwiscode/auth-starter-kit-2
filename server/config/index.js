const express = require("express");
const morgan = require("morgan");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const cors = require("cors");
const { NODE_ENV, FRONTEND_URL } = require("../constants/env");

module.exports = (app) => {
  app.set("trust proxy", 1);

  app.use(morgan("dev"));

  app.use(helmet());

  if (NODE_ENV === "production") {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs in production
      })
    );
  } else {
    // More flexible limit for development (for example, 5000 instead of 1000)
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5000, // higher request limit for development
      })
    );
  }

  app.use(express.urlencoded({ extended: false }));
  app.use(
    express.json({
      limit: "50mb",
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
      },
    })
  );

  // CORS MIDDLEWARE INSIDE module.exports TO ALLOW CROSS-ORIGIN INTERACTION:
  app.use(
    cors({
      origin: [
        FRONTEND_URL,
        "http://localhost:8081", // For Expo web
        "http://localhost:19006", // Expo web preview
        "http://192.168.0.145:19000", // Expo mobile preview
        "exp://192.168.0.145:19000", // Expo app
        "http://127.0.0.1:19000", // iOS simulator
      ],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
};
