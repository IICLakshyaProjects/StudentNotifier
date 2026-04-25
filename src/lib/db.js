import mongoose from "mongoose";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("Missing env var: DATABASE_URL");
}

/**
 * Maintain a cached connection across hot reloads in development.
 * Next.js can evaluate server modules multiple times.
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(DATABASE_URL, {
        bufferCommands: false,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

