import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["MONGO_URL", "keyForToken"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Missing expected environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUrl: process.env.MONGO_URL,
  mongoDbName: process.env.database,
  jwtSecret: process.env.keyForToken,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

export default env;

