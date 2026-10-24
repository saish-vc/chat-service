const mongoose = require("mongoose");
const config = require("../config");

function getMongoUri() {
  // Allow an externally provided test URI (e.g. from a running in-memory mongod) to take precedence.
  if (process.env.TEST_MONGO_URI) {
    return process.env.TEST_MONGO_URI;
  }
  return process.env.MONGO_URI || config.mongoUri;
}

const connectDB = async (customUri) => {
  const uri = customUri || getMongoUri();
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 2000,
    socketTimeoutMS: 45000,
  });
  console.log("MongoDB connected");
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

module.exports = connectDB;
