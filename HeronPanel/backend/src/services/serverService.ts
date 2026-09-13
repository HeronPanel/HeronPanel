import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export class ServerService {
  async createServer(data: { name: string, userId: string, nodeId: string, port: number }) {
    return prisma.server.create({ data });
  }

  async getServersByUser(userId: string) {
    return prisma.server.findMany({ where: { userId } });
  }

  async performAction(serverId: string, action: string) {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: { node: true }
    });

    if (!server) throw new Error('Server not found');

    // Communicate with the Node Agent
    const agentUrl = \http://\:\\;
    
    try {
      const response = await axios.post(\\/action\, {
        serverId: server.id,
        action: action,
        apiKey: server.node.apiKey
      });

      // Update server state based on response
      const newState = response.data.state || 'RUNNING';
      await prisma.server.update({
        where: { id: serverId },
        data: { state: newState }
      });

      return response.data;
    } catch (err: any) {
      throw new Error(\Agent Error: \\);
    }
  }
}
