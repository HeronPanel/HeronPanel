import { FastifyRequest, FastifyReply } from 'fastify';
import { ServerService } from '../services/serverService';

const serverService = new ServerService();

export const createServer = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, nodeId, port } = request.body as any;
  const userId = (request.user as any).id;
  try {
    const server = await serverService.createServer({ name, userId, nodeId, port });
    return reply.code(201).send(server);
  } catch (e: any) {
    return reply.code(400).send({ error: e.message });
  }
};

export const getMyServers = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request.user as any).id;
  const servers = await serverService.getServersByUser(userId);
  return reply.send(servers);
};

export const serverAction = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as any;
  const { action } = request.body as any;
  try {
    const result = await serverService.performAction(id, action);
    return reply.send(result);
  } catch (e: any) {
    return reply.code(500).send({ error: e.message });
  }
};
