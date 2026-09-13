import { FastifyRequest, FastifyReply } from 'fastify';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwt.verify();
  } catch (err) {
    return reply.code(401).send({ error: 'Authentication required' });
  }
};
