import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DatabaseService {
  async createDatabase(serverId: string, dbName: string) {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: { node: true }
    });

    if (!server) throw new Error('Server not found');

    const agentUrl = \http://\:\/db/create\;
    const response = await axios.post(agentUrl, {
      dbName,
      apiKey: server.node.apiKey
    });

    return response.data;
  }
}
