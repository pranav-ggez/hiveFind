import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, X, Cpu, Layers, Lightbulb } from 'lucide-react';

const TIPS = [
  'Shorter documents give more precise answers.',
  'Upload lecture slides as PDF for best results.',
  'Ask follow-up questions to drill deeper.',
  'Multiple docs build a richer knowledge index.',
];

const UploadPanel = ({ onUploadStart, onUploadSuccess, files, setFiles }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  const totalChunks = files.reduce((a, f) => a + (f.chunks || 0), 0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File exceeds 5MB limit.'); return; }
    if (files.some(f => f.name === file.name)) { setError('File already indexed.'); return; }

    setIsUploading(true); onUploadStart(); setError(null);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFiles(prev => [{ id: data.fileId, name: data.fileName, chunks: data.totalChunks, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
      onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
      onUploadSuccess();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Upload zone ── */}
      <div className="p-4 border-b border-hf">
        <p className="text-[10px] font-black text-hf-subtle uppercase tracking-widest mb-3">Ingestion Zone</p>
        <label className={`group flex flex-col items-center justify-center border border-dashed rounded-xl p-5 cursor-pointer gap-3 transition-all ${
          isUploading ? 'border-blue-500/40 bg-blue-500/5' : 'border-hf hover:border-blue-500/40 hover:bg-blue-500/5'
        }`}>
          <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" disabled={isUploading} />
          {isUploading ? (
            <>
              <Loader2 className="animate-spin text-blue-400" size={22} />
              <div className="text-center">
                <p className="text-[11px] font-bold text-hf">Analyzing…</p>
                <p className="text-[10px] text-hf-subtle mt-0.5">Generating vectors</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-hf-raised group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
                <Upload size={16} className="text-hf-muted group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-hf">Drop PDF / DOCX</p>
                <p className="text-[10px] text-hf-subtle mt-0.5">Max 5MB · Auto-chunking</p>
              </div>
            </>
          )}
        </label>
        {error && (
          <div className="mt-3 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-400 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-hf">
        {[
          { icon: FileText, label: 'Docs',   value: files.length },
          { icon: Layers,   label: 'Chunks', value: totalChunks },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-hf-raised rounded-xl p-3 flex flex-col gap-1 border border-hf">
            <div className="flex items-center gap-1.5 text-hf-subtle">
              <Icon size={11} /><span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xl font-black text-hf leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Knowledge index ── */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black text-hf-subtle uppercase tracking-widest">Knowledge Index</p>
          <span className="text-[10px] font-bold bg-hf-raised border border-hf text-hf-subtle px-2 py-0.5 rounded-md">{files.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-xl border border-dashed border-hf flex items-center justify-center mb-3">
                <FileText size={16} className="text-hf-subtle opacity-40" />
              </div>
              <p className="text-[10px] text-hf-subtle font-semibold uppercase tracking-wider leading-snug opacity-70">
                No context loaded.<br />AI is restricted.
              </p>
            </div>
          ) : (
            files.map(file => (
              <div key={file.id} className="group flex items-start gap-3 p-3 rounded-xl bg-hf-raised border border-hf hover:border-blue-500/30 transition-all">
                <div className="w-8 h-8 bg-hf-bg border border-hf rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-hf truncate leading-none mb-1.5">{file.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase">{file.chunks} chunks</span>
                    <span className="text-[9px] text-hf-subtle">{file.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <button onClick={() => setFiles(p => p.filter(f => f.id !== file.id))} className="opacity-0 group-hover:opacity-100 transition-opacity text-hf-subtle hover:text-red-400">
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-hf space-y-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-hf-raised border border-hf">
          <Cpu size={12} className="text-hf-subtle shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-hf-subtle uppercase tracking-widest">Engine</p>
            <p className="text-[10px] font-semibold text-hf truncate">gemini-flash · nomic-embed</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <Lightbulb size={12} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-500 font-medium leading-snug">{TIPS[tipIndex]}</p>
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;