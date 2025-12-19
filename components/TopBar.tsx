import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Play, Layout, Box, FastForward, SkipForward } from 'lucide-react';

export const TopBar: React.FC = () => {
  const [runMenuOpen, setRunMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-10">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="flex items-center hover:text-gray-300 cursor-pointer transition-colors">
          <Layout size={16} className="mr-2" />
          <span>Workspace</span>
        </div>
        <ChevronRight size={14} />
        <div className="flex items-center hover:text-gray-300 cursor-pointer transition-colors">
          <span>Project Alpha</span>
        </div>
        <ChevronRight size={14} />
        <span className="text-white font-medium">Two-Phase</span>
      </div>

      {/* Center: Controls */}
      <div className="flex items-center space-x-4">
        {/* Project Selector */}
        <div className="flex items-center bg-surface border border-white/10 rounded-md px-3 py-1.5 cursor-pointer hover:border-white/20 transition-all">
          <Box size={14} className="text-accent mr-2" />
          <span className="text-sm text-gray-200 mr-2">Email Generator V1</span>
          <ChevronDown size={12} className="text-gray-500" />
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Dataset Selector */}
        <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Dataset</span>
            <select className="bg-transparent text-sm text-white border-none focus:ring-0 cursor-pointer hover:text-accent transition-colors">
                <option>Golden Leads (50)</option>
                <option>Test Batch A (10)</option>
            </select>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Run Mode */}
         <div className="flex bg-surfaceHighlight rounded-md p-0.5 border border-white/5">
            <button className="px-3 py-1 text-xs font-medium bg-background text-white rounded shadow-sm">Single</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-white transition-colors">Batch</button>
         </div>
      </div>

      {/* Right: Versions & Actions */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
            <Chip label="PreCrafter" version="v4.2" color="blue" />
            <Chip label="Spec" version="v1.1" color="purple" />
            <Chip label="Crafter" version="v7.0" color="green" />
        </div>

        {/* Split Run Button */}
        <div className="relative flex items-center shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-md">
            <button className="flex items-center bg-accent hover:bg-accentDark text-black font-semibold px-4 py-2 rounded-l-md transition-all active:scale-95 border-r border-black/10">
                <Play size={16} className="mr-2 fill-current" />
                RUN ALL
            </button>
            <button 
                onClick={() => setRunMenuOpen(!runMenuOpen)}
                className="bg-accent hover:bg-accentDark text-black px-2 py-2 rounded-r-md transition-all active:bg-accentDark/80"
            >
                <ChevronDown size={16} />
            </button>

            {runMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]">
                    <div className="p-1">
                        <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Execution Mode</div>
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md gap-3">
                            <FastForward size={14} className="text-blue-400"/>
                            Run PreCrafter Only
                        </button>
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md gap-3">
                            <SkipForward size={14} className="text-green-400"/>
                            Run Crafter Only
                            <span className="text-[10px] text-gray-500 ml-auto">Use Cached</span>
                        </button>
                         <button className="w-full flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-md gap-3">
                            <Play size={14} className="text-accent"/>
                            Run End-to-End
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

const Chip: React.FC<{ label: string, version: string, color: 'blue' | 'purple' | 'green' }> = ({ label, version, color }) => {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
    }
    return (
        <div className={`flex items-center px-2 py-1 rounded border ${colors[color]} text-xs font-mono`}>
            <span className="opacity-70 mr-1.5">{label}</span>
            <span className="font-semibold">{version}</span>
        </div>
    )
}