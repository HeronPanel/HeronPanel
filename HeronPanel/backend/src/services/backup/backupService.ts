import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BackupService {
  async createBackup(serverId: string) {
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: { node: true }
    });

    if (!server) throw new Error('Server not found');

    const agentUrl = \http://\:\/backup/create\;
    const response = await axios.post(agentUrl, {
      serverId,
      apiKey: server.node.apiKey
    });

    return response.data;
  }

  async deleteBackup(backupId: string) {
    // Logic to find server associated with backup and tell daemon to delete
    return { status: 'deleted' };
  }
}
