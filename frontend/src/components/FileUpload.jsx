import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    const API = import.meta.env.VITE_API_URL;
    try {
      await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload size={20} className="text-blue-600" />
        Upload Documents
      </h2>
      
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-8 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 relative">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          accept=".pdf,.docx"
        />
        <FileText size={40} className="text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {file ? file.name : 'Click or drag PDF/DOCX here'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle size={16} /> File processed and indexed!
        </div>
      )}

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {uploading ? 'Processing...' : 'Start Indexing'}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
