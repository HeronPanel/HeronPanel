import { FastifyRequest, FastifyReply } from 'fastify';
import { NodeService } from '../services/nodeService';

const nodeService = new NodeService();

export const createNode = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, address, port, apiKey } = request.body as any;
  try {
    const node = await nodeService.createNode({ name, address, port, apiKey });
    return reply.code(201).send(node);
  } catch (e: any) {
    return reply.code(400).send({ error: e.message });
  }
};

export const getNodes = async (request: FastifyRequest, reply: FastifyReply) => {
  const nodes = await nodeService.getAllNodes();
  return reply.send(nodes);
};

export const heartbeat = async (request: FastifyRequest, reply: FastifyReply) => {
  const { apiKey, metrics } = request.body as any;
  const node = await nodeService.findNodeByApiKey(apiKey);
  
  if (!node) {
    return reply.code(401).send({ error: 'Invalid Node API Key' });
  }

  await nodeService.updateNodeStatus(node.id, 'ONLINE', metrics);
  return reply.send({ status: 'ok', nodeId: node.id });
};
