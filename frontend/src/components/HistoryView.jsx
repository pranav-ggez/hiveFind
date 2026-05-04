import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, MessageSquare, Clock, RefreshCcw, Trophy } from 'lucide-react';

const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[13px] font-black text-hf uppercase tracking-widest flex items-center gap-2">
      <Icon size={15} className="text-blue-400" />{title}
    </h2>
    {action}
  </div>
);

const HistoryView = () => {
  const [data, setData] = useState({ queries: [], files: [], quizzes: [] });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const API = import.meta.env.VITE_API_URL;
    try { const { data } = await axios.get(`${API}/history`); setData(data); }
    catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCcw className="animate-spin text-blue-400" size={22} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8 animate-in">

      {/* ── Uploaded Documents ── */}
      <section>
        <SectionHeader icon={FileText} title="Uploaded Documents"
          action={
            <button onClick={fetchHistory} className="text-[11px] text-hf-subtle hover:text-hf flex items-center gap-1.5 transition-colors">
              <RefreshCcw size={11} /> Refresh
            </button>
          }
        />
        <div className="bg-hf-surface border border-hf rounded-2xl overflow-hidden">
          {/* Table head */}
          <div className="grid grid-cols-[1fr_140px_100px] px-5 py-3 border-b border-hf bg-hf-raised">
            {['File Name', 'Upload Date', 'Size'].map(h => (
              <span key={h} className="text-[10px] font-black text-hf-subtle uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {/* Rows */}
          {data.files.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12px] text-hf-subtle">No files uploaded yet.</div>
          ) : (
            data.files.map((file, i) => (
              <div key={file._id} className={`grid grid-cols-[1fr_140px_100px] px-5 py-3.5 items-center transition-colors hover:bg-hf-raised ${i !== 0 ? 'border-t border-hf' : ''}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText size={13} className="text-blue-400 shrink-0" />
                  <span className="text-[12px] font-semibold text-hf truncate">{file.name}</span>
                </div>
                <span className="text-[11px] text-hf-muted">{new Date(file.uploadDate).toLocaleDateString()}</span>
                <span className="text-[11px] text-hf-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Recent Queries ── */}
      <section>
        <SectionHeader icon={MessageSquare} title="Recent Queries" />
        {data.queries.length === 0 ? (
          <div className="bg-hf-surface border border-hf rounded-2xl px-5 py-10 text-center text-[12px] text-hf-subtle">
            No queries found.
          </div>
        ) : (
          <div className="space-y-3">
            {data.queries.map(q => (
              <div key={q._id} className="bg-hf-surface border border-hf rounded-2xl p-5 hover:border-hf-md transition-colors">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <p className="text-[13px] font-bold text-hf">{q.question}</p>
                  <span className="flex items-center gap-1 text-[10px] text-hf-subtle shrink-0 mt-0.5">
                    <Clock size={10} />
                    {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[12px] text-hf-muted line-clamp-2 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Quiz History ── */}
      {data.quizzes?.length > 0 && (
        <section>
          <SectionHeader icon={Trophy} title="Quiz History" />
          <div className="space-y-3">
            {data.quizzes.map(qz => (
              <div key={qz._id} className="bg-hf-surface border border-hf rounded-2xl px-5 py-4 flex items-center justify-between hover:border-hf-md transition-colors">
                <div>
                  <p className="text-[13px] font-bold text-hf">{qz.title}</p>
                  <p className="text-[11px] text-hf-muted mt-0.5">{new Date(qz.timestamp).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${
                  qz.score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  qz.score >= 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                   'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <Trophy size={12} /> {qz.score}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HistoryView;