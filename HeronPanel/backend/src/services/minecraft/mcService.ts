import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MinecraftService {
  private softwareUrls = {
    vanilla: 'https://piston-data.mojang.com/v1/objects/...', // Real URLs would be fetched from Mojang API
    paper: 'https://papermc.io/api/v2/projects/paper...',
    fabric: 'https://maven.fabricmc.net/...',
  };

  async installServer(serverId: string, type: string, version: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new Error('Server not found');

    const url = this.softwareUrls[type as keyof typeof this.softwareUrls];
    if (!url) throw new Error('Unsupported software type');

    // We tell the daemon to download the JAR
    const agentUrl = \http://\:\/mc/install\;
    await axios.post(agentUrl, {
      serverId,
      jarUrl: url,
      version,
      apiKey: server.node.apiKey
    });

    return { status: 'installing' };
  }

  async acceptEula(serverId: string) {
    const server = await prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new Error('Server not found');

    const agentUrl = \http://\:\/mc/eula\;
    await axios.post(agentUrl, { serverId, apiKey: server.node.apiKey });
  }
}
