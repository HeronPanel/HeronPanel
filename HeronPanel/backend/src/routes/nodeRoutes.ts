import { FastifyInstance } from 'fastify';
import * as nodeController from '../controllers/nodeController';
import { authenticate, checkRole } from '../middleware/authMiddleware';
import { checkPermission } from '../middleware/permissionMiddleware';

export async function nodeRoutes(fastify: FastifyInstance) {
  // Admin only routes
  fastify.post('/nodes', { preHandler: [authenticate, checkRole(['OWNER', 'ADMIN'])] }, nodeController.createNode);
  fastify.get('/nodes', { preHandler: [authenticate] }, nodeController.getNodes);
  
  // Daemon route (Public but API-Key protected)
  fastify.post('/daemon/heartbeat', nodeController.heartbeat);
}
