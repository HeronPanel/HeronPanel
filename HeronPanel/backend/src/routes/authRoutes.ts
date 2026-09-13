import { FastifyInstance } from 'fastify';
import * as authController from '../controllers/authController';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', authController.register);
  fastify.post('/auth/login', authController.login);
}
