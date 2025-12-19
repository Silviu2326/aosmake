import React, { useState } from 'react';
import { FileText, FileCode, FileJson, Image, Download, Share2, Search, Grid, List, MoreVertical } from 'lucide-react';

const MOCK_ARTIFACTS = [
  { id: '1', name: 'campaign_results.json', type: 'json', size: '245 KB', date: '2 hrs ago', run: 'run_8f2a' },
  { id: '2', name: 'email_template_v2.html', type: 'html', size: '12 KB', date: '5 hrs ago', run: 'run_7b1x' },
  { id: '3', name: 'lead_list_enriched.csv', type: 'csv', size: '1.2 MB', date: '1 day ago', run: 'run_9c3d' },
  { id: '4', name: 'summary_report.pdf', type: 'pdf', size: '450 KB', date: '2 days ago', run: 'run_5a6b' },
  { id: '5', name: 'debug_log.txt', type: 'text', size: '2 MB', date: '2 days ago', run: 'run_5a6b' },
  { id: '6', name: 'generated_image_01.png', type: 'image', size: '3.4 MB', date: '3 days ago', run: 'run_1a2b' },
];

export const ArtifactsPanel: React.FC = () => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="flex flex-col h-full bg-[#0D0D0D] text-gray-300">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">Artifacts</h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-500">6 Items</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#1a1a1a] border border-white/5 rounded-md px-3 py-1.5 w-48 mr-2">
                        <Search size={14} className="text-gray-500 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
                        />
                    </div>
                    <div className="flex bg-white/5 rounded-md p-0.5 border border-white/5">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Grid size={14} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <List size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {MOCK_ARTIFACTS.map(item => (
                            <ArtifactCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                         {MOCK_ARTIFACTS.map(item => (
                            <ArtifactListItem key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ArtifactCard = ({ item }: { item: any }) => {
    return (
        <div className="group relative bg-surface border border-white/5 hover:border-accent/50 rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/50 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                    <FileIcon type={item.type} size={20} />
                </div>
                <button className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                </button>
            </div>
            
            <h3 className="text-sm font-medium text-white truncate mb-1" title={item.name}>{item.name}</h3>
            
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-3">
                <span>{item.size}</span>
                <span>{item.date}</span>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 transition-colors">
                     <Download size={12} /> Download
                 </button>
                 <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300">
                     <Share2 size={12} />
                 </button>
            </div>

            <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/40 rounded text-[9px] text-gray-500 font-mono">
                {item.type.toUpperCase()}
            </div>
        </div>
    );
};

const ArtifactListItem = ({ item }: { item: any }) => (
    <div className="flex items-center gap-4 p-3 bg-surface border border-white/5 rounded-md hover:bg-white/5 transition-colors group">
        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-accent shrink-0">
             <FileIcon type={item.type} size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span>{item.size}</span>
                <span>•</span>
                <span>Generated by <span className="text-gray-400 hover:underline cursor-pointer">{item.run}</span></span>
            </div>
        </div>
        <div className="text-xs text-gray-500">{item.date}</div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Download">
                 <Download size={16} />
             </button>
             <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Share">
                 <Share2 size={16} />
             </button>
        </div>
    </div>
);

const FileIcon = ({ type, size }: { type: string, size: number }) => {
    switch (type) {
        case 'json': return <FileJson size={size} />;
        case 'html': return <FileCode size={size} />;
        case 'image': return <Image size={size} />;
        case 'text': return <FileText size={size} />;
        default: return <FileText size={size} />;
    }
}