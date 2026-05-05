import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Sparkles, MessageSquare, AlertCircle, HelpCircle, List, BookOpen, Zap } from 'lucide-react';
import MessageBubble from './MessageBubble';

const API = import.meta.env.VITE_API_URL;

const SUGGESTIONS = [
  { icon: HelpCircle, label: 'Explain a concept', prompt: 'Can you explain the main concept from my document in simple terms?' },
  { icon: List, label: 'Summarize key points', prompt: 'What are the key takeaways from my uploaded document?' },
  { icon: BookOpen, label: 'Quiz me on it', prompt: 'Ask me 3 quiz questions based on the document content.' },
  { icon: Zap, label: 'Most important fact', prompt: 'What is the single most important fact in my document?' },
];

const ChatWindow = ({ messages, setMessages, isReady, isProcessing }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const isSending = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const createMessage = (role, content, sources = []) => ({
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    sources
  });

  const send = async (text) => {
    const q = (text || query).trim();
    if (!q || loading || isSending.current || !isReady || isProcessing) return;

    isSending.current = true;
    setLoading(true);

    setMessages(prev => [...prev, createMessage('user', q)]);
    setQuery('');
    setError(null);

    try {
      const { data } = await axios.post(`${API}/chat/ask`, { query: q });

      setMessages(prev => [
        ...prev,
        createMessage('bot', data.answer, data.sources || [])
      ]);

    } catch {
      setError('Connection failed. Check backend or API quota.');
      setMessages(prev => [
        ...prev,
        createMessage('bot', 'I encountered an error. Please try again.')
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => { isSending.current = false; }, 300);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full relative bg-hf-bg">

      {!isReady && !isProcessing && isEmpty && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 p-8 bg-hf-bg">
          <div className="w-14 h-14 rounded-2xl bg-hf-blue-dim border border-blue-500/20 flex items-center justify-center">
            <Sparkles size={26} className="text-blue-400" />
          </div>

          <div className="text-center">
            <h3 className="text-base font-bold text-hf">Knowledge Engine Inactive</h3>
            <p className="text-[13px] text-hf-muted mt-1 max-w-[220px] leading-relaxed">
              Upload a document on the left to power your AI study session.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs mt-1">
            {SUGGESTIONS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-hf-surface border border-hf text-hf-muted">
                <Icon size={13} className="shrink-0 text-blue-400 opacity-60" />
                <span className="text-[11px] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex items-center gap-3 animate-pulse">
            <Loader2 size={14} className="animate-spin text-blue-400" />
            <span className="text-[11px] text-blue-400 font-bold uppercase">Generating…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 px-5 py-4 border-t border-hf bg-hf-surface">
        {error && (
          <div className="mb-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle size={12} className="text-red-400" />
            <p className="text-[11px] text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={!isReady || loading || isProcessing}
            placeholder="Ask anything about your documents…"
            className="flex-1 bg-hf-raised border border-hf rounded-xl px-4 py-3 text-[13px]"
          />

          <button type="submit" disabled={!query.trim() || loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;