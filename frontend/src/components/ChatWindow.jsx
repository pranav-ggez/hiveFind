import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ messages, setMessages, isReady, isProcessing }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    // Request Lock & Validation
    if (!query.trim() || loading || !isReady || isProcessing) return;

    const currentQuery = query.trim();
    const userMsg = { role: 'user', content: currentQuery };
    
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/chat/ask', { query: currentQuery });
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: data.answer,
        sources: data.sources 
      }]);
    } catch (err) {
      console.error('Chat Error:', err);
      setError('Connection failed. Please check the backend or your API quota.');
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'I encountered an error while processing your request. Please try again later.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
      
      {/* Empty State Overlay */}
      {!isReady && !isProcessing && messages.length === 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-600 rotate-12">
            <Sparkles size={40} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Knowledge Engine Inactive</h3>
          <p className="text-sm text-gray-400 max-w-[240px] leading-relaxed">
            Upload your documents to the left panel to begin your AI-powered study session.
          </p>
        </div>
      )}

      {/* Processing State Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Building Index...</h3>
          <p className="text-xs text-gray-500">Ollama is generating embeddings for your document.</p>
        </div>
      )}

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-gray-50/10">
        {messages.length === 0 && isReady && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 animate-in zoom-in duration-700">
            <div className="w-16 h-16 border-4 border-dashed border-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={32} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">Ready for questions</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        
        {loading && (
          <div className="flex justify-start mb-6 animate-pulse">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-blue-500" />
              </div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Generating Answer...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-100">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[11px] flex items-center gap-2 animate-in slide-in-from-top-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        
        <form onSubmit={handleSend} className="relative flex items-center group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!isReady || loading || isProcessing}
            placeholder={isReady ? "Ask anything about your documents..." : "Index a document first"}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-5 pr-14 py-4 text-sm shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          />
          <button
            type="submit"
            disabled={!isReady || loading || isProcessing || !query.trim()}
            className="absolute right-2.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-lg shadow-blue-200 disabled:shadow-none"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <div className="flex justify-between items-center mt-3 px-1">
          <p className="text-[10px] text-gray-400 font-medium tracking-tight italic">
            Engine: gemini-flash-latest + Ollama nomic-embed
          </p>
          <div className="flex gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-green-500' : 'bg-gray-300'}`} />
             <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
