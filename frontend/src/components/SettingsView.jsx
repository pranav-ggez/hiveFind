import React, { useState } from 'react';
import { Zap, Database, Trash2, Loader2, Cpu, Globe, ShieldCheck, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Row = ({ label, sub, right }) => (
  <div className="flex items-center justify-between py-4 border-b border-hf last:border-0">
    <div className="min-w-0 mr-4">
      <p className="text-[13px] font-semibold text-hf">{label}</p>
      {sub && <p className="text-[11px] text-hf-muted mt-0.5">{sub}</p>}
    </div>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);

const Badge = ({ color, label }) => {
  const c = {
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue:  'bg-blue-500/10 border-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  }[color];
  return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${c}`}>{label}</span>;
};

const Card = ({ title, icon: Icon, accent, children }) => (
  <div className={`rounded-2xl border overflow-hidden ${accent ? 'border-red-500/20' : 'border-hf'} bg-hf-surface`}>
    <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${accent ? 'border-red-500/15 bg-red-500/5' : 'border-hf bg-hf-raised'}`}>
      <Icon size={15} className={accent ? 'text-red-400' : 'text-hf-muted'} />
      <h2 className={`text-[11px] font-black uppercase tracking-widest ${accent ? 'text-red-400' : 'text-hf'}`}>{title}</h2>
    </div>
    <div className="px-5">{children}</div>
  </div>
);

const SettingsView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const handleClear = async () => {
    if (!window.confirm('Permanently delete all indexed documents and history?')) return;
    setIsLoading(true); setError(null); setSuccess(null);
    try {
      const res = await axios.delete('/api/system/clear');
      setSuccess(res.data.message || 'Index cleared successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear index.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-5 animate-in">
      <div className="mb-2">
        <h1 className="text-xl font-black text-hf tracking-tight">Settings</h1>
        <p className="text-[13px] text-hf-muted mt-1">Manage your AI configuration and application data.</p>
      </div>

      {/* AI Config */}
      <Card title="AI Configuration" icon={Zap}>
        <Row label="Language Model"    sub="gemini-flash-latest · Optimized for speed"  right={<Badge color="blue"  label="Active"   />} />
        <Row label="Embedding Engine"  sub="Ollama · nomic-embed-text"                  right={<Badge color="green" label="Running"  />} />
        <Row label="Retrieval"         sub="Top-K cosine similarity (k = 5)"            right={<Badge color="amber" label="Default"  />} />
        <Row label="Chunk Size"        sub="512 tokens · 64-token overlap"              right={<span className="text-[11px] font-mono text-hf-subtle">512 / 64</span>} />
      </Card>

      {/* System */}
      <Card title="System" icon={Cpu}>
        <Row label="Backend"       sub="FastAPI · Python 3.11"             right={<Badge color="green" label="Online" />} />
        <Row label="Vector Store"  sub="In-memory FAISS index"             right={<Badge color="blue"  label="Local"  />} />
        <Row label="API Region"    sub="Google Cloud · us-central1"        right={<Globe size={14} className="text-hf-subtle" />} />
        <Row label="Privacy"       sub="Documents never leave your machine" right={<ShieldCheck size={14} className="text-emerald-400" />} />
      </Card>

      {/* About */}
      <Card title="About" icon={Info}>
        <Row label="HiveFind" sub="AI-powered student study assistant" right={<span className="text-[11px] font-mono text-hf-subtle">v1.0.0</span>} />
        <Row label="Stack"    sub="React · FastAPI · Gemini · Ollama" />
      </Card>

      {/* Data Management */}
      <Card title="Data Management" icon={Database} accent>
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mt-4">
            <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-400 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 mt-4">
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-400 font-medium">{success}</p>
          </div>
        )}
        <Row
          label="Clear All Data"
          sub="Permanently deletes all indexed documents and chat history."
          right={
            <button onClick={handleClear} disabled={isLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-[12px] font-bold px-3.5 py-2 rounded-lg transition-all"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {isLoading ? 'Clearing…' : 'Delete Everything'}
            </button>
          }
        />
      </Card>
    </div>
  );
};

export default SettingsView;