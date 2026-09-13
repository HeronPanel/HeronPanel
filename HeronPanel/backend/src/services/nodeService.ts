import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NodeService {
  async createNode(data: { name: string, address: string, port: number, apiKey: string }) {
    return prisma.node.create({ data });
  }

  async getAllNodes() {
    return prisma.node.findMany();
  }

  async updateNodeStatus(nodeId: string, status: 'ONLINE' | 'OFFLINE', metrics: any) {
    return prisma.node.update({
      where: { id: nodeId },
      data: { 
        status,
        // In a real production app, metrics would be stored in a Time-Series DB or a JSON field
        // For this phase, we update the status.
      },
    });
  }

  async findNodeByApiKey(apiKey: string) {
    return prisma.node.findUnique({ where: { apiKey } });
  }
}
