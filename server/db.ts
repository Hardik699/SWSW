import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;
let connectionError: string | null = null;

export async function connectDB() {
  if (!MONGODB_URI) {
    const msg =
      "MONGODB_URI environment variable is not set. MongoDB features will not be available.";
    console.warn("⚠️ ", msg);
    connectionError = msg;
    return;
  }

  if (isConnected) {
    console.log("Already connected to MongoDB");
    connectionError = null;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    connectionError = null;
    console.log("✅ Connected to MongoDB successfully");
    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    connectionError = error instanceof Error ? error.message : String(error);
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export function getDBStatus() {
  return {
    connected: isConnected,
    error: connectionError,
  };
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("Disconnected from MongoDB");
  }
}

export default mongoose;
