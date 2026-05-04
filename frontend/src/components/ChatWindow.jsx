import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Sparkles, MessageCircle, AlertCircle, HelpCircle, List, BookOpen, Zap } from 'lucide-react';
import MessageBubble from './MessageBubble';

const SUGGESTIONS = [
  { icon: HelpCircle, label: 'Explain a concept',    prompt: 'Can you explain the main concept from my document in simple terms?' },
  { icon: List,       label: 'Summarize key points', prompt: 'What are the key takeaways from my uploaded document?' },
  { icon: BookOpen,   label: 'Quiz me on it',         prompt: 'Ask me 3 quiz questions based on the document content.' },
  { icon: Zap,        label: 'Most important fact',  prompt: 'What is the single most important fact in my document?' },
];

const ChatWindow = ({ messages, setMessages, isReady, isProcessing }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const isSending = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const q = (text || query).trim();
    if (!q || loading || isSending.current || !isReady || isProcessing) return;
    isSending.current = true; setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setQuery(''); setError(null);
    const API = import.meta.env.VITE_API_URL;
    try {
      const { data } = await axios.post(`${API}/chat/ask`, { query: q });
      setMessages(prev => [...prev, { role: 'bot', content: data.answer, sources: data.sources }]);
    } catch {
      setError('Connection failed. Check backend or API quota.');
      setMessages(prev => [...prev, { role: 'bot', content: 'I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => { isSending.current = false; }, 300);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-hf-surface rounded-3xl border border-hf shadow-sm overflow-hidden">
      
      {/* Content Area: This container swaps its content based on state */}
      <div className="flex-1 flex flex-col min-h-0">
        {isProcessing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <Loader2 className="animate-spin text-blue-400 mb-4" size={28} />
            <h3 className="text-base font-bold text-hf">Building Index…</h3>
            <p className="text-[12px] text-hf-muted mt-1">Generating embeddings for your document.</p>
          </div>
        ) : !isReady && isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 animate-in fade-in duration-500">
            <div className="w-14 h-14 rounded-2xl bg-hf-blue-dim border border-blue-500/20 flex items-center justify-center">
              <Sparkles size={26} className="text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-hf">Knowledge Engine Inactive</h3>
              <p className="text-[13px] text-hf-muted mt-1 max-w-[220px] leading-relaxed">Upload a document to power your AI study session.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-hf-bg">
            {isEmpty && isReady && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center gap-5">
                <div className="text-center">
                  <MessageCircle size={22} className="text-hf-subtle opacity-40 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-hf-subtle opacity-60">Ready — try a prompt</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                    <button key={label} onClick={() => send(prompt)}
                      className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-hf-surface border border-hf hover:border-blue-500/30 hover:bg-hf-blue-dim text-left transition-all group"
                    >
                      <Icon size={13} className="shrink-0 text-blue-400 mt-0.5" />
                      <span className="text-[11px] font-semibold text-hf-muted group-hover:text-hf transition-colors">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            
            {loading && (
              <div className="flex items-center gap-3 animate-pulse mb-6">
                <div className="w-7 h-7 rounded-lg bg-hf-raised border border-hf flex items-center justify-center shrink-0">
                  <Loader2 size={14} className="animate-spin text-blue-400" />
                </div>
                <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Generating…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area is now always separate and accessible */}
      <div className="shrink-0 px-5 py-4 border-t border-hf bg-hf-surface">
        {error && (
          <div className="mb-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle size={12} className="text-red-400 shrink-0" />
            <p className="text-[11px] text-red-400 font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={e => { e.preventDefault(); send(); }} className="relative flex items-center">
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            disabled={!isReady || loading || isProcessing}
            placeholder={isReady ? 'Ask anything about your documents…' : 'Index a document first'}
            className="flex-1 bg-hf-raised border border-hf rounded-xl px-4 py-3 text-[13px] text-hf placeholder:text-hf-subtle focus:outline-none focus:border-blue-500/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
          />
          <button type="submit" disabled={!isReady || loading || isProcessing || !query.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-hf-raised disabled:text-hf-subtle rounded-xl flex items-center justify-center shrink-0 transition-all text-white shadow-lg shadow-blue-900/20 disabled:shadow-none"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-hf-subtle font-medium italic">gemini-flash · ollama nomic-embed</p>
          <div className="flex items-center gap-1.5">
             <div className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-hf-subtle opacity-40'}`} />
             <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-400 animate-pulse' : 'bg-hf-subtle opacity-40'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
