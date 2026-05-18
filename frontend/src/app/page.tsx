import StackBlitzEditor from '@/components/StackBlitzEditor';
import AIAvatarPanel from '@/components/AIAvatarPanel';

export default function Home() {
  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden">
      {/* Left Pane: AI Avatar & Interaction */}
      <AIAvatarPanel />

      {/* Right Pane: StackBlitz IDE (Editor & Preview) */}
      <div className="flex-grow flex flex-col p-4 h-full">
        {/* Header/Nav for IDE */}
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-white text-xl font-semibold">Coding Playground</h1>
            <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors">
                    Run Tests
                </button>
            </div>
        </div>

        {/* IDE Embedding */}
        <StackBlitzEditor />
      </div>
    </main>
  );
}
