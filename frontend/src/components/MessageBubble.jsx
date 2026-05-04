import React, { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
          isUser ? 'bg-blue-600 border-blue-500 text-white' : 'bg-hf-surface border-hf text-blue-400'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className={`relative px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${
            isUser 
              ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' 
              : 'bg-hf-raised border-hf text-hf rounded-tl-none'
          }`}>
            <div className={`prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'text-hf'}`}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            
            <div className={`mt-2 text-[10px] flex items-center gap-1 opacity-50 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <Clock size={10} />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Collapsible Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="bg-hf-bg border border-hf rounded-xl overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setShowSources(!showSources)}
                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold text-hf-subtle hover:bg-hf-raised transition-colors uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-400" />
                  View Sources ({message.sources.length} chunks)
                </span>
                {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showSources && ( /* Source content: list of documents found in the current context */
                <div className="px-4 py-3 border-t border-hf space-y-3 max-h-60 overflow-y-auto custom-scrollbar bg-hf-surface/50">
                  {message.sources.map((source, idx) => ( 
                    <div key={idx} className="bg-hf-raised p-3 rounded-lg border border-hf shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-tighter">
                        {source.filename}
                      </p>
                      <p className="text-[11px] text-hf-muted leading-relaxed italic">
                        "{source.content.substring(0, 150)}..."
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
