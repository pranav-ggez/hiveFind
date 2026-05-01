import React from 'react';
import { Settings, Shield, Zap, Database, Trash2 } from 'lucide-react';

const SettingsView = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and application data.</p>
      </header>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            AI Configuration
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Current Model</p>
              <p className="text-sm text-gray-500">gemini-flash-latest (Optimized)</p>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">Change</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Embedding Engine</p>
              <p className="text-sm text-gray-500">Ollama (nomic-embed-text)</p>
            </div>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Active</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-red-100">
        <div className="p-6 border-b border-red-50 bg-red-50/30">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
            <Database size={20} />
            Data Management
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-red-600">Clear All Data</p>
              <p className="text-sm text-gray-500">Permanently delete all indexed documents and history.</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
              <Trash2 size={16} /> Delete Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
