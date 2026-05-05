import React, { useState } from 'react';
import { User, Bot, ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  const safeSources = Array.isArray(message.sources) ? message.sources : [];

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
          isUser ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-gray-100 text-blue-600'
        }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        <div className="flex flex-col gap-2 min-w-0">

          <div className={`relative px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
          }`}>

            <div className={`prose prose-sm max-w-none ${isUser ? 'text-white prose-invert' : 'text-gray-800'}`}>
              <ReactMarkdown
                components={{
                  table: ({ children }) => (
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-xs">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-100">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border px-2 py-1 font-semibold text-left">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border px-2 py-1">{children}</td>
                  )
                }}
              >
                {message.content || ''}
              </ReactMarkdown>
            </div>

            <div className={`mt-2 text-[10px] flex items-center gap-1 opacity-50 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <Clock size={10} />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {!isUser && safeSources.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm transition-all">
              <button 
                onClick={() => setShowSources(!showSources)}
                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-500" />
                  View Sources ({safeSources.length} chunks)
                </span>
                {showSources ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showSources && (
                <div className="px-4 py-3 border-t border-gray-50 space-y-3 max-h-60 overflow-y-auto custom-scrollbar bg-gray-50/30">
                  {safeSources.map((source, idx) => (
                    <div key={`${source.filename || 'src'}-${idx}`} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-tighter">
                        {source.filename || 'Unknown Source'}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed italic">
                        "{(source.content || '').substring(0, 150)}..."
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