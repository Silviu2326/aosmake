import React from 'react';
import { Database, Plus, RefreshCw, Table, Clock, HardDrive, MoreHorizontal, Search, FileSpreadsheet } from 'lucide-react';

const MOCK_DATASETS = [
  { id: '1', name: 'Leads Q1 2025', type: 'PostgreSQL', rows: '1.2M', size: '4.5 GB', updated: '10m ago', status: 'active' },
  { id: '2', name: 'Email Templates', type: 'S3 Bucket', rows: '450', size: '120 MB', updated: '1h ago', status: 'active' },
  { id: '3', name: 'User Preferences', type: 'Redis', rows: '85k', size: '256 MB', updated: 'Live', status: 'active' },
  { id: '4', name: 'Blacklist Domains', type: 'CSV Upload', rows: '2.3k', size: '450 KB', updated: '2 days ago', status: 'archived' },
  { id: '5', name: 'Competitor Pricing', type: 'Scraped', rows: '12k', size: '15 MB', updated: '4h ago', status: 'active' },
];

export const DatasetsPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] text-gray-300">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface">
        <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Database size={18} />
             </div>
             <div>
                <h2 className="text-lg font-semibold text-white leading-none">Datasets</h2>
                <p className="text-[10px] text-gray-500 mt-1">Manage your training and input data</p>
             </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex items-center bg-[#1a1a1a] border border-white/5 rounded-md px-3 py-1.5 w-64">
                <Search size={14} className="text-gray-500 mr-2" />
                <input 
                    type="text" 
                    placeholder="Find dataset..." 
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
                />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent hover:bg-accent/90 text-white text-xs font-medium transition-colors">
                <Plus size={14} />
                Connect Data
            </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5">
           <StatCard label="Total Storage" value="12.4 TB" icon={HardDrive} />
           <StatCard label="Active Records" value="45.2 M" icon={Table} />
           <StatCard label="Sync Frequency" value="15 min" icon={RefreshCw} />
           <StatCard label="Data Sources" value="8" icon={Database} />
      </div>

      {/* Dataset List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-3">
             <div className="flex items-center px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <div className="flex-1">Name</div>
                 <div className="w-32">Type</div>
                 <div className="w-24 text-right">Rows</div>
                 <div className="w-24 text-right">Size</div>
                 <div className="w-32 text-right">Last Sync</div>
                 <div className="w-10"></div>
             </div>

             {MOCK_DATASETS.map((ds) => (
                 <div key={ds.id} className="flex items-center px-4 py-3 bg-surface border border-white/5 rounded-lg hover:border-white/10 transition-colors group">
                     <div className="flex-1 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${ds.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-500'}`} />
                        <div>
                            <div className="text-sm font-medium text-white">{ds.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{ds.id}</div>
                        </div>
                     </div>
                     <div className="w-32">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300 border border-white/5">
                            {ds.type}
                        </span>
                     </div>
                     <div className="w-24 text-right text-xs text-gray-400 font-mono">{ds.rows}</div>
                     <div className="w-24 text-right text-xs text-gray-400 font-mono">{ds.size}</div>
                     <div className="w-32 text-right text-xs text-gray-500 flex items-center justify-end gap-1.5">
                        <Clock size={12} />
                        {ds.updated}
                     </div>
                     <div className="w-10 flex justify-end">
                        <button className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                     </div>
                 </div>
             ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
    <div className="bg-surface border border-white/5 rounded-lg p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
            <Icon size={20} />
        </div>
        <div>
            <div className="text-2xl font-semibold text-white">{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        </div>
    </div>
);