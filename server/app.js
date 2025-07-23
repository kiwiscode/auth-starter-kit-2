require("dotenv").config();

const express = require("express");
const config = require("./config");
const session = require("express-session");
const app = express();
const passport = require("passport");
require("./config/passport");

require("./db");
config(app);

app.use(
  session({ secret: "your_secret", resave: false, saveUninitialized: false })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const authRouter = require("./routes/auth");
const HttpStatus = require("./constants/http");

app.use("/api/auth", authRouter);

// Global error handler
app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
  } else {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
});

module.exports = app;
