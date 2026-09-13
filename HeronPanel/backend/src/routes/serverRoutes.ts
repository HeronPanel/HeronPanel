import { FastifyInstance } from 'fastify';
import * as serverController from '../controllers/serverController';
import { authenticate } from '../middleware/authMiddleware';

export async function serverRoutes(fastify: FastifyInstance) {
  fastify.post('/servers', { preHandler: [authenticate] }, serverController.createServer);
  fastify.get('/servers', { preHandler: [authenticate] }, serverController.getMyServers);
  fastify.post('/servers/:id/action', { preHandler: [authenticate] }, serverController.serverAction);
}
