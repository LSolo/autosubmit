import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

interface LogMessage {
  timestamp: string;
  message: string;
}

export default function LiveLogConsole() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to log stream');
      setLogs(prev => [...prev, { timestamp: new Date().toISOString(), message: 'SYSTEM: UPLINK ESTABLISHED...' }]);
    });

    socket.on('log', (data: LogMessage) => {
      setLogs(prev => [...prev, data]);
    });

    socket.on('disconnect', () => {
      setLogs(prev => [...prev, { timestamp: new Date().toISOString(), message: 'SYSTEM: UPLINK LOST.' }]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/90 backdrop-blur-xl rounded-lg border border-cyber-green/50 shadow-[0_0_20px_rgba(0,255,102,0.15)] font-tech text-sm mt-6 relative overflow-hidden group">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
      
      {/* Header */}
      <div className="bg-cyber-green/10 px-4 py-2 border-b border-cyber-green/30 flex items-center justify-between relative z-30">
        <div className="flex items-center gap-2">
            <span className="text-cyber-green text-xs font-orbitron tracking-widest drop-shadow-[0_0_5px_rgba(0,255,102,0.5)]">TERMINAL // SYSTEM_MONITOR_V4</span>
        </div>
        <div className="flex space-x-1">
           <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse shadow-[0_0_5px_rgba(0,255,102,0.8)]"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse delay-75 shadow-[0_0_5px_rgba(0,255,102,0.8)]"></div>
           <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse delay-150 shadow-[0_0_5px_rgba(0,255,102,0.8)]"></div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 h-64 overflow-y-auto font-mono text-xs relative z-30 scrollbar-thin scrollbar-thumb-cyber-green/50 scrollbar-track-black/50 text-cyber-green/90">
        {logs.length === 0 && (
          <div className="text-cyber-green/50 italic animate-pulse">Initializing neural handshake...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="mb-1 break-words leading-tight hover:bg-cyber-green/5 transition-colors">
            <span className="text-cyber-blue/50 mr-3 opacity-70">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={log.message.toLowerCase().includes('error') || log.message.toLowerCase().includes('fail') ? 'text-cyber-pink font-bold drop-shadow-[0_0_5px_rgba(255,0,85,0.8)]' : 'text-cyber-green drop-shadow-[0_0_2px_rgba(0,255,102,0.5)]'}>
              {'>'} {log.message}
            </span>
          </div>
        ))}
        <div className="mt-2 animate-pulse text-cyber-green font-bold">_</div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
