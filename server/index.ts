import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getChannels, getLiveTV, getRadio, getUpdates, createUpdate } from "./routes/supabase";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Supabase API Routes
  app.get("/api/channels", getChannels);
  app.get("/api/live-tv", getLiveTV);
  app.get("/api/radio", getRadio);
  app.get("/api/updates", getUpdates);
  app.post("/api/updates", createUpdate);

  return app;
}
