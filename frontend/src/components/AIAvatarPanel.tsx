'use client';

import { Mic, MicOff, Video, MessagesSquare } from 'lucide-react';
import { useGeminiLive } from '@/lib/useGeminiLive';

export default function AIAvatarPanel() {
  const { state, connect, disconnect } = useGeminiLive();

  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting';

  return (
    <div className="w-80 h-full flex flex-col bg-gray-900 border-r border-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MessagesSquare size={20} className="text-blue-400" />
          Ada Tutor
        </h2>
        <div className="flex gap-2">
           <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
        </div>
      </div>

      {/* Avatar / Viseme Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${isConnected ? 'bg-gradient-to-tr from-blue-600 to-purple-600 animate-pulse' : 'bg-gray-800'}`}>
            <span className="text-4xl font-bold text-white tracking-widest">ADA</span>
        </div>
        <p className="mt-8 text-center text-gray-400 text-sm">
          {isConnected ? "I am listening. Let's write some code together." : "Click microphone to connect."}
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex justify-center gap-4">
          <button
             onClick={isConnected ? disconnect : connect}
             disabled={isConnecting}
             className={`p-3 rounded-full transition-colors ${isConnected ? 'bg-red-900 hover:bg-red-800 text-red-300' : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'}`}
          >
            {isConnected ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
