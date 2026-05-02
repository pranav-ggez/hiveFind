import React from 'react';
import { GraduationCap, History, LayoutGrid, Settings, Hexagon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const NAV = [
  { id: 'student',  label: 'Student Space', icon: GraduationCap },
  { id: 'history',  label: 'History',        icon: History },
  { id: 'quiz',     label: 'Quiz Me',         icon: LayoutGrid },
];

const NavBtn = ({ id, label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-150 border ${
      active
        ? 'bg-hf-blue-dim text-hf-blue border-blue-500/20'
        : 'text-hf-muted hover:text-hf hover:bg-hf-raised border-transparent'
    }`}
  >
    <Icon size={15} className="shrink-0" />
    {label}
  </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isDark, toggle } = useTheme();

  return (
    <aside className="w-56 shrink-0 bg-hf-sidebar border-r border-hf flex flex-col h-screen transition-colors duration-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-hf">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/30">
          <Hexagon size={13} className="text-white fill-white" />
        </div>
        <span className="text-[14px] font-black tracking-tight text-hf">HiveFind</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => (
          <NavBtn key={item.id} {...item} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-hf pt-3 space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-hf-muted hover:text-hf hover:bg-hf-raised border border-transparent transition-all"
        >
          {isDark
            ? <Sun  size={15} className="shrink-0 text-amber-400" />
            : <Moon size={15} className="shrink-0 text-blue-400" />
          }
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <span className={`ml-auto text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
            isDark
              ? 'bg-hf-raised border-hf text-hf-subtle'
              : 'bg-amber-100 border-amber-200 text-amber-600'
          }`}>
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        <NavBtn id="settings" label="Settings" icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </aside>
  );
};

export default Sidebar;