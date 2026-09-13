import { Server } from 'socket.io';
import axios from 'axios';

export class ConsoleService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(Console connected: );

      socket.on('join_console', async (data: { serverId: string }) => {
        socket.join(console_);
        console.log(User joined console for server );
      });

      socket.on('send_command', async (data: { serverId: string, command: string }) => {
        // 1. Find server in DB
        // 2. Forward command to Daemon via REST/WS
        // 3. Broadcast response back to the socket room
        console.log(Command sent to : );
        socket.to(console_).emit('console_output', > \nExecuting...);
      });

      socket.on('disconnect', () => {
        console.log('Console disconnected');
      });
    });
  }

  broadcastOutput(serverId: string, text: string) {
    this.io.to(console_).emit('console_output', text);
  }
}
