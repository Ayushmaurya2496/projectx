import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

// Load environment variables
dotenv.config({ path: './.env' });

// Initialize express app
const app = express();

console.log("Loading connectDB...");

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
