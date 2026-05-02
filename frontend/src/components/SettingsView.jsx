import React, { useState } from 'react';
import { Settings, Shield, Zap, Database, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const SettingsView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleClearIndex = async () => {
    const confirmClear = window.confirm(
      'Are you sure you want to delete all indexed documents and history? This action cannot be undone.'
    );

    if (!confirmClear) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete('/api/system/clear');
      setSuccess(response.data.message);
      // Optionally, you might want to force a reload or dispatch a global state update here
      // For now, a simple alert and success message will suffice.
    } catch (err) {
      console.error('Error clearing index:', err);
      setError(err.response?.data?.message || 'Failed to clear index. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative text-sm" role="alert">
              <strong className="font-bold">Success:</strong>
              <span className="block sm:inline"> {success}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 text-red-600">Clear All Data</p>
              <p className="text-sm text-gray-500">Permanently delete all indexed documents and history.</p>
            </div>
            <button
              onClick={handleClearIndex}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {isLoading ? 'Clearing...' : 'Delete Everything'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
