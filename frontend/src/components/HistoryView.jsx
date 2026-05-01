import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, FileText, MessageSquare, Clock, RefreshCcw } from 'lucide-react';

const HistoryView = () => {
  const [data, setData] = useState({ queries: [], files: [], quizzes: [] });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/history');
      setData(data);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          Uploaded Documents
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Upload Date</th>
                <th className="px-6 py-3">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.files.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No files uploaded yet.</td>
                </tr>
              ) : (
                data.files.map((file) => (
                  <tr key={file._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{file.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={20} className="text-blue-600" />
          Recent Queries
        </h2>
        <div className="space-y-4">
          {data.queries.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-400">
              No queries found.
            </div>
          ) : (
            data.queries.map((q) => (
              <div key={q._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <p className="font-semibold text-gray-900">{q.question}</p>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider shrink-0">
                    <Clock size={12} /> {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{q.answer}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HistoryView;
