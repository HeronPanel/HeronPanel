'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export default function AdminPanel() {
  const [nodes, setNodes] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // In real implementation, fetch from /api/nodes and /api/audit-logs
    setNodes([
      { id: '1', name: 'Node-US-East', address: '1.2.3.4', status: 'ONLINE' },
      { id: '2', name: 'Node-EU-West', address: '5.6.7.8', status: 'OFFLINE' },
    ]);
    setLogs([
      { id: '1', user: 'Admin', action: 'CREATE_SERVER', target: 'Minecraft-1', result: 'SUCCESS' },
      { id: '2', user: 'User1', action: 'STOP_SERVER', target: 'Minecraft-1', result: 'SUCCESS' },
    ]);
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary">Admin Control Panel ??</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodes.map((node: any) => (
                  <TableRow key={node.id}>
                    <TableCell>{node.name}</TableCell>
                    <TableCell>{node.address}</TableCell>
                    <TableCell className={node.status === 'ONLINE' ? 'text-green-500' : 'text-red-500'}>
                      {node.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-4" variant="outline">Add New Node</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell>{log.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
