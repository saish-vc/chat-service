#!/usr/bin/env node
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import './config/index.js';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import messageRoutes from './routes/messages.js';
import { registerSocketHandlers } from './sockets/index.js';

dotenv.config();

async function startMongoMemoryServer() {
  const ms = await MongoMemoryServer.create();
  process.env.MONGO_URI = ms.getUri();
  console.log('MongoMemoryServer started URI:', ms.getUri());
  global.__MONGO_MS__ = ms;
  return ms;
}

// Start MongoMemoryServer first
startMongoMemoryServer();

// Now set up Express app (dotenv already loaded, MONGO_URI is set in env)
const http = require('http');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', messageRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'chatwave-server' });
});

registerSocketHandlers(io);

async function start() {
  // Use the mongoose directly with the in-memory URI
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('MongoDB connected');

  server.listen(process.env.PORT || 4000, () => {
    console.log(`ChatWave server running on port ${process.env.PORT || 4000}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('HTTP server closed');
  });
  if (global.__MONGO_MS__) {
    await global.__MONGO_MS__.stop();
    console.log('MongoMemoryServer stopped');
  }
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, server, io };