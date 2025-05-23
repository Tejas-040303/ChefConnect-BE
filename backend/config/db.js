const mongoose = require("mongoose");

// MongoDB connection string from environment variable
const mongoURI = process.env.MONGO_CONN;
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MONGO connected ");
  })
  .catch((err) => {
    console.log("error", err);
  });
