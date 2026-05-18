'use client';

import StackBlitzEditor from '@/components/StackBlitzEditor';
import AIAvatarPanel from '@/components/AIAvatarPanel';
import { useAuth } from '@/lib/AuthContext';
import { LogOut } from 'lucide-react';

export default function Home() {
  const { token, user, login, logout } = useAuth();

  if (!token) {
    return (
      <main className="flex flex-col items-center justify-center h-screen w-screen bg-black text-white">
        <h1 className="text-4xl font-bold mb-8">Ada AI Tutor</h1>
        <p className="mb-8 text-gray-400">Please log in to access the programming playground.</p>
        <button
          onClick={login}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Login with GitLab
        </button>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden">
      <AIAvatarPanel />

      {/* Added id for targetRef in useGeminiLive to optimize html2canvas captures */}
      <div id="ide-container" className="flex-grow flex flex-col p-4 h-full">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-white text-xl font-semibold">Coding Playground</h1>
            <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">Welcome, {user?.name || 'Student'}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
        <StackBlitzEditor />
      </div>
    </main>
  );
}
