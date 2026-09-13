'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function Terminal({ serverId }: { serverId: string }) {
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    
    socketRef.current.emit('join_console', { serverId });

    socketRef.current.on('console_output', (text: string) => {
      setOutput((prev) => [...prev, text]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [serverId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    
    socketRef.current?.emit('send_command', { serverId, command: input });
    setOutput((prev) => [...prev, > ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 font-mono p-4 rounded-xl border border-border shadow-inner">
      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap leading-relaxed">{line}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSendCommand} className="flex gap-2">
        <span className="text-primary font-bold">??</span>
        <input 
          className="flex-1 bg-transparent outline-none border-none p-0 focus:ring-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command..."
        />
      </form>
    </div>
  );
}
