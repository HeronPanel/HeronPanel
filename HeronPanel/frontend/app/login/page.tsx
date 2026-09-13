'use client';
import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('heron_token', data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Image 
            src="/panellogo.png" 
            alt="HeronPanel Logo" 
            width={64} 
            height={64} 
            className="mb-4 rounded-xl"
          />
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to HeronPanel ❄️</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full p-2 rounded-lg border border-border bg-transparent focus:ring-2 focus:ring-primary outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-2 rounded-lg border border-border bg-transparent focus:ring-2 focus:ring-primary outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          
          <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
        </div>
      </div>
    </div>
  );
}
