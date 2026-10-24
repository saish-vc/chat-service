#!/usr/bin/env node
// Set required environment variables first
process.env.JWT_SECRET = 'test-jwt-secret-12345';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'development';

// Start MongoMemoryServer first
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const { registerSocketHandlers } = require('./sockets/index');

async function startMongoMemoryServer() {
  const ms = await MongoMemoryServer.create();
  process.env.MONGO_URI = ms.getUri();
  console.log('MongoMemoryServer started URI:', ms.getUri());
  global.__MONGO_MS__ = ms;
  return ms;
}

// Start MongoMemoryServer and wait for it
startMongoMemoryServer().then(() => {
  // Set up Express app
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
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');

    server.listen(process.env.PORT || 4001, () => {
      console.log('ChatWave server running on port ' + (process.env.PORT || 4000));
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

  console.log('ChatWave server starting with MongoDB in-memory...');
}).catch(e => {
  console.error('Failed to start MongoMemoryServer:', e);
  process.exit(1);
});