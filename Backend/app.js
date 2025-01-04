const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const AuthRouter= require("./routes/authrouter");
// const reviewRouter = require("./routes/reviewRouter");
const app = express();
require("dotenv").config(); // Correct import for dotenv
require("./models/db"); // Change to require
const PORT = process.env.PORT; // Use PORT from .env or default to 3000

// Your other middleware, routes, and server logic go here
app.get("/ping", (req, res) => {
  res.send("PONG");
});
app.use(express.json()); // Use express.json() for parsing JSON payloads
app.use(bodyParser.json());
app.use(cors());
app.use("/auth", AuthRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
