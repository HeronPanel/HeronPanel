import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const register = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as any;
  try {
    const user = await authService.register(email, password);
    return reply.code(201).send({ message: 'User registered successfully', userId: user.id });
  } catch (e: any) {
    return reply.code(400).send({ error: e.message });
  }
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = request.body as any;
  try {
    const user = await authService.login(email, password);
    const token = reply.jwt.sign({ id: user.id, role: user.role });
    return reply.send({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role } 
    });
  } catch (e: any) {
    return reply.code(401).send({ error: e.message });
  }
};
