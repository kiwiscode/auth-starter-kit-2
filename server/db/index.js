const mongoose = require("mongoose");
const { MONGO_URI } = require("../constants/env");
require("dotenv").config();

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    const databaseName = x.connections[0].name;
    console.log(`Mongoose connected ${databaseName}`);
  })
  .catch((err) => {
    console.log("Error connecting to mongo: ", err);
  });
