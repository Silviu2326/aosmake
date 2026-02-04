import React, { useState } from 'react';
import { Search, Filter, Box, Command, Cpu, Globe, Mail, MessageSquare, Code, LayoutTemplate } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Modules' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'processors', label: 'Processors' },
  { id: 'models', label: 'AI Models' },
  { id: 'templates', label: 'Templates' },
];

const MOCK_LIBRARY_ITEMS = [
  { id: '1', name: 'OpenAI GPT-4', category: 'models', type: 'LLM', description: 'Latest GPT-4 model for reasoning and generation.', icon: Cpu, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: '2', name: 'Postgres Reader', category: 'connectors', type: 'Source', description: 'Read data from PostgreSQL databases securely.', icon: DatabaseIcon, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: '3', name: 'Email Validator', category: 'processors', type: 'Utility', description: 'Check email syntax and domain deliverability.', icon: Mail, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: '4', name: 'Slack Notifier', category: 'connectors', type: 'Sink', description: 'Send alerts and messages to Slack channels.', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: '5', name: 'Lead Scoring V2', category: 'templates', type: 'Flow', description: 'Pre-built template for scoring inbound leads.', icon: LayoutTemplate, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: '6', name: 'JSON Transformer', category: 'processors', type: 'Transform', description: 'Map and transform JSON structures using jq.', icon: Code, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: '7', name: 'Web Scraper', category: 'connectors', type: 'Source', description: 'Extract content from web pages.', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
];

function DatabaseIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
    )
}

export const LibraryPanel: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all' 
    ? MOCK_LIBRARY_ITEMS 
    : MOCK_LIBRARY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] text-gray-300">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-pink-500/10 flex items-center justify-center text-pink-400">
                <Box size={18} />
             </div>
             <div>
                <h2 className="text-lg font-semibold text-white leading-none">Library</h2>
                <p className="text-[10px] text-gray-500 mt-1">Modules, connectors, and templates</p>
             </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex items-center bg-[#1a1a1a] border border-white/5 rounded-md px-3 py-1.5 w-64">
                <Search size={14} className="text-gray-500 mr-2" />
                <input 
                    type="text" 
                    placeholder="Search library..." 
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
                />
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Categories */}
        <div className="w-48 border-r border-white/5 bg-surface/50 p-4 space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Categories</h3>
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        activeCategory === cat.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="group flex flex-col bg-surface border border-white/5 rounded-lg p-4 hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                                <item.icon size={20} />
                            </div>
                            <span className="text-[10px] font-mono text-gray-500 border border-white/5 px-1.5 py-0.5 rounded bg-black/20">
                                {item.type}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-white mb-1 group-hover:text-accent transition-colors">{item.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{item.description}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                            <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full bg-gray-600 border border-[#0D0D0D]" />
                                <div className="w-4 h-4 rounded-full bg-gray-500 border border-[#0D0D0D]" />
                            </div>
                            <span className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">v2.1.0</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};