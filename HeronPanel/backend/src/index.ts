import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { authRoutes } from './routes/authRoutes';
import { nodeRoutes } from './routes/nodeRoutes';
import { serverRoutes } from './routes/serverRoutes';
import { ConsoleService } from './services/consoleService';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Socket.io setup
const server = http.createServer(fastify.server);
const io = new Server(server, {
  cors: { origin: '*' }
});

const consoleService = new ConsoleService(io);

// Register plugins
fastify.register(cors, {
  origin: true
});

fastify.register(cookie);

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'fallback-secret-key'
});

// Register routes
fastify.register(authRoutes);
fastify.register(nodeRoutes);
fastify.register(serverRoutes);

// Basic health check
fastify.get('/health', async () => {
  return { status: 'ok', brand: 'HeronPanel', theme: 'SNOW ??' };
});

const start = async () => {
  try {
    // Start the HTTP server instead of fastify.listen
    server.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' }, () => {
      console.log(?? HeronPanel API & Sockets running on http://localhost:3000);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
