import React from 'react';
import { View } from '../../types';
import {
  History,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {

  const menuItems = [
    { id: View.PRECRAFTER, icon: Zap, label: 'PreCrafter' },
    { type: 'divider' },
    { id: View.RUNS, icon: History, label: 'Runs' },
  ];

  return (
    <div className="w-[260px] h-full border-r border-border bg-surface flex flex-col flex-shrink-0 z-20">
      <div className="h-16 flex items-center px-4 border-b border-border">
        <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mr-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-semibold text-white tracking-wide">AOS Studio</span>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={`div-${index}`} className="h-px bg-white/5 my-2 mx-2" />;
          }
          if (item.type === 'spacer') {
            return <div key={`spacer-${index}`} className="flex-1" />;
          }

          const isActive = currentView === item.id;
          const Icon = item.icon as React.ElementType;

          return (
            <button
              key={item.id}
              onClick={() => item.id && setCurrentView(item.id as View)}
              className={`w-full flex items-center px-3 py-2 rounded-md transition-colors group relative ${isActive
                ? 'bg-accent/10 text-accent'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              {item.id === View.RUNS && (
                <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-error animate-pulse" />
              )}
              <Icon size={18} className={`mr-3 ${isActive ? 'text-accent' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/10" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">Dev User</span>
            <span className="text-[10px] text-gray-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};