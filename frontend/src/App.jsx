import React, { useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import UploadPanel from './components/UploadPanel';
import QuizView from './components/QuizView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

function AppInner() {
  const [activeTab, setActiveTab] = useState('student');
  const [files, setFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const isReady = files.length > 0;

  return (
    <div className="flex h-screen bg-hf-bg overflow-hidden text-hf font-sans transition-colors duration-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-hidden flex flex-col">

        {/* ── Student Space ── */}
        {activeTab === 'student' && (
          <div className="flex flex-col h-full">
            <header className="flex items-center justify-between px-6 py-3.5 border-b border-hf bg-hf-surface shrink-0">
              <div className="flex items-center gap-3">
                <h1 className="text-[15px] font-bold tracking-tight text-hf">Student Space</h1>
                {!isReady && !isProcessing && (
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                    Setup Required
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
                isProcessing ? 'bg-blue-500/10 border-blue-500/25 text-blue-400' :
                isReady      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                               'border-hf text-hf-subtle'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isProcessing ? 'bg-blue-400 animate-pulse' :
                  isReady      ? 'bg-emerald-400' : 'bg-hf-subtle'
                }`} />
                {isProcessing ? 'Processing' : isReady ? 'Ready' : 'No Data'}
              </div>
            </header>

            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div className="w-[280px] shrink-0 border-r border-hf overflow-y-auto custom-scrollbar bg-hf-surface">
                <UploadPanel
                  onUploadStart={() => setIsProcessing(true)}
                  onUploadSuccess={() => setIsProcessing(false)}
                  files={files} setFiles={setFiles}
                />
              </div>
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-hf-bg">
                <ChatWindow
                  messages={chatMessages} setMessages={setChatMessages}
                  isReady={isReady} isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Other tabs ── */}
        {activeTab === 'history'  && <div className="flex-1 overflow-y-auto custom-scrollbar bg-hf-bg"><HistoryView /></div>}
        {activeTab === 'quiz'     && <div className="flex-1 overflow-y-auto custom-scrollbar bg-hf-bg"><QuizView /></div>}
        {activeTab === 'settings' && <div className="flex-1 overflow-y-auto custom-scrollbar bg-hf-bg"><SettingsView /></div>}
      </main>
    </div>
  );
}

export default function App() {
  return <ThemeProvider><AppInner /></ThemeProvider>;
}