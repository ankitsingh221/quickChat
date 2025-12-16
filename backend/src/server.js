import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./lib/db.js";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "10mb" })); 
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);

// Connect to DB first
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });
