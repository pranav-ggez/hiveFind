import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const UploadPanel = ({ onUploadStart, onUploadSuccess, files, setFiles }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    if (files.some(f => f.name === file.name)) {
      setError('This file is already in your active index.');
      return;
    }

    setIsUploading(true);
    onUploadStart(); // Let parent know we are processing
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const newFile = {
        id: data.fileId,
        name: data.fileName,
        chunks: data.totalChunks,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setFiles(prev => [newFile, ...prev]);
      onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
      onUploadSuccess(); // Reset processing state even on error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full overflow-hidden">
      {/* Upload Zone */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Ingestion Zone</h3>
          {isUploading && <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />}
        </div>

        <label className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${
          isUploading ? 'bg-blue-50/30 border-blue-200' : 'hover:bg-gray-50 hover:border-gray-300 border-gray-200'
        }`}>
          <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" disabled={isUploading} />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700">Analyzing Document</p>
                <p className="text-[10px] text-gray-400 mt-1">Generating 768d vectors...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600 rounded-2xl flex items-center justify-center transition-colors">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-gray-700">Drop PDF / DOCX</p>
                <p className="text-[10px] text-gray-400 mt-1">Max 5MB • Auto-chunking</p>
              </div>
            </div>
          )}
        </label>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-medium flex items-start gap-2 border border-red-100 animate-in slide-in-from-top-1">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Active Index */}
      <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Active Knowledge Index</h3>
          <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded-lg text-gray-500">{files.length}</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {files.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center mb-3 text-gray-200">
                <FileText size={24} />
              </div>
              <p className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter leading-tight">
                No context loaded.<br/>AI is currently restricted.
              </p>
            </div>
          ) : (
            files.map(file => (
              <div key={file.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-blue-200 hover:bg-white transition-all animate-in slide-in-from-left-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:text-blue-600 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate leading-none mb-1.5">{file.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">{file.chunks} Chunks</span>
                       <span className="text-[9px] text-gray-400 font-medium tracking-tighter">{file.date}</span>
                    </div>
                  </div>
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPanel;
