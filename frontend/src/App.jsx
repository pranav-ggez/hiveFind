import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import UploadPanel from './components/UploadPanel';
import QuizView from './components/QuizView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

function App() {
  const [activeTab, setActiveTab] = useState('student');
  
  // Central System State
  const [files, setFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived State
  const isReady = files.length > 0;

  const handleUploadStart = () => {
    setIsProcessing(true);
  };

  const handleUploadSuccess = () => {
    setIsProcessing(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full max-w-[1600px] mx-auto p-8 flex flex-col">
          
          {activeTab === 'student' && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
              <header className="mb-8 shrink-0 flex items-center justify-between px-2">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Student Space
                    {!isReady && !isProcessing && <span className="text-[10px] bg-amber-50 text-yellow-600 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Setup Required</span>}
                  </h1>
                  <p className="text-gray-400 text-sm font-medium mt-1">
                    {isProcessing ? "Ingesting data..." : isReady ? "Context loaded. Ask anything." : "Upload documents to begin."}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                    isProcessing ? 'bg-blue-50 border-blue-100 text-blue-600' :
                    isReady ? 'bg-green-50 border-green-100 text-green-700' :
                    'bg-gray-50 border-gray-100 text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isProcessing ? 'bg-blue-500 animate-pulse' :
                      isReady ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {isProcessing ? 'Processing' : isReady ? 'Ready' : 'No Data'}
                    </span>
                  </div>
                </div>
              </header>

              <div className="flex-1 flex gap-8 min-h-0">
                {/* Left Panel: Upload & Index (28%) */}
                <div className="w-[28%] min-w-[320px] flex flex-col h-full">
                  <UploadPanel 
                    onUploadStart={handleUploadStart}
                    onUploadSuccess={handleUploadSuccess} 
                    files={files} 
                    setFiles={setFiles} 
                  />
                </div>

                {/* Right Panel: Chat Interface (72%) */}
                <div className="flex-1 flex flex-col h-full min-w-0">
                  <ChatWindow 
                    messages={chatMessages} 
                    setMessages={setChatMessages} 
                    isReady={isReady} 
                    isProcessing={isProcessing}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'quiz' && <QuizView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
