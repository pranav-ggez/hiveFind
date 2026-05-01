import React from 'react';
import { LayoutDashboard, History, GraduationCap, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'student', label: 'Student Space', icon: GraduationCap },
    { id: 'history', label: 'History', icon: History },
    { id: 'quiz', label: 'Quiz Me', icon: LayoutDashboard },
  ];

  return (
    <div className="w-64 bg-secondary text-white h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">H</div>
          HiveFind
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-1">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Settings size={20} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
