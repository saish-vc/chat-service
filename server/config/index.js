const required = ["JWT_SECRET"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error(
    "Missing required environment variables:",
    missing.join(", ")
  );
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatwave",
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};
