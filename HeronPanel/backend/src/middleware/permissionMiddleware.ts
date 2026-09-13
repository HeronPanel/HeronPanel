import { FastifyRequest, FastifyReply } from 'fastify';

export const checkRole = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as any;
    if (!user || !roles.includes(user.role)) {
      return reply.code(403).send({ error: 'Insufficient permissions' });
    }
  };
};

export const checkPermission = (permission: string) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Note: For granular permissions, we would check a permissions table 
    // or a JSON field in the User/Role model.
    // Currently, we will simulate this based on the Role enum.
    const user = request.user as any;
    if (!user) return reply.code(401).send({ error: 'Unauthenticated' });
    
    if (user.role === 'OWNER') return; // Owner has all permissions
    
    // Logic for ADMIN/USER based on the permission string
    // This will be expanded as we implement the granular permission table.
    const permissionsMap: Record<string, string[]> = {
      'server.start': ['OWNER', 'ADMIN'],
      'server.stop': ['OWNER', 'ADMIN'],
      'files.write': ['OWNER', 'ADMIN', 'USER'],
    };

    const allowedRoles = permissionsMap[permission] || [];
    if (!allowedRoles.includes(user.role)) {
      return reply.code(403).send({ error: \Missing permission: \\ });
    }
  };
};
