'use client';

import { Mic, MicOff, Video, MessagesSquare } from 'lucide-react';

export default function AIAvatarPanel() {
  return (
    <div className="w-80 h-full flex flex-col bg-gray-900 border-r border-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MessagesSquare size={20} className="text-blue-400" />
          Ada Tutor
        </h2>
        <div className="flex gap-2">
           <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
        </div>
      </div>

      {/* Avatar / Viseme Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-xl animate-pulse">
            <span className="text-4xl font-bold text-white tracking-widest">ADA</span>
        </div>
        <p className="mt-8 text-center text-gray-400 text-sm">
          "I am ready. Let's write some code together."
        </p>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-800 bg-gray-950">
        <div className="flex justify-center gap-4">
          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <Mic size={20} className="text-gray-300" />
          </button>
          <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <Video size={20} className="text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
