import express, { application } from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./lib/db.js";
import authRoute from "./routes/authRoute.js";
import messageRoute from "./routes/messageRoute.js";
import groupRoutes from "./routes/groupRoute.js"
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middleware/rateLimiter.js";
import cors from "cors"; 
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";


const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "20mb" }));
 
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
}));


app.use(cookieParser());

// Rate Limiter
app.use(globalLimiter);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/groups", groupRoutes)


// Connect to DB first
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database", err);
    process.exit(1);
  });
