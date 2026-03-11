import { Router, RequestHandler } from "express";
import mongoose from "mongoose";

const router = Router();

const testConnection: RequestHandler = async (_req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const stateNames = ["disconnected", "connected", "connecting", "disconnecting"];

    // Try to wait for connection if it's connecting
    if (state === 2) { // connecting
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Connection timeout after 5 seconds"));
          }, 5000);

          mongoose.connection.once("connected", () => {
            clearTimeout(timeout);
            resolve(true);
          });

          mongoose.connection.once("error", (error) => {
            clearTimeout(timeout);
            reject(error);
          });
        });
      } catch (waitError) {
        // Connection failed after waiting
      }
    }

    const currentState = mongoose.connection.readyState;
    const status = {
      connected: currentState === 1,
      state: stateNames[currentState] || "unknown",
      database: mongoose.connection.db?.getName() || "N/A",
      host: mongoose.connection.host || "N/A",
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      mongodb: status,
      message: currentState === 1 ? "MongoDB is connected successfully!" : `MongoDB is not connected (state: ${stateNames[currentState]})`,
      mongodbUri: process.env.MONGODB_URI ? "✅ MONGODB_URI is set" : "❌ MONGODB_URI is not set",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      mongodb: {
        state: "error",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

router.get("/test", testConnection);

export { router as mongodbTestRouter };
