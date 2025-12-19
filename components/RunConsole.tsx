import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Activity, Terminal, DollarSign, FileCode, CheckCircle2, Clock, X, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { useConsole } from '../context/ConsoleContext';
import { LogEntry } from '../types';
import { ChatIA } from './ChatIA';

interface RunConsoleProps {
    isOpen: boolean;
    toggle: () => void;
}

export const RunConsole: React.FC<RunConsoleProps> = ({ isOpen, toggle }) => {
  const [activeTab, setActiveTab] = useState('logs');
  const { logs } = useConsole();
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getStatusColor = (status: LogEntry['status']) => {
      switch(status) {
          case 'success': return 'text-green-400';
          case 'error': return 'text-red-400';
          case 'running': return 'text-blue-400';
          default: return 'text-gray-400';
      }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Console Header / Toggle Strip */}
      <div 
        className="h-[56px] border-b border-border flex items-center justify-between px-4 cursor-pointer hover:bg-surfaceHighlight transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${isOpen ? 'text-accent' : 'text-gray-400'}`}>
                    {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
                <span className="font-semibold text-white">Run Console</span>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                    {logs.length > 0 ? `Latest: ${logs[logs.length-1].timestamp}` : 'Ready'}
                </span>
            </div>

            {/* Status Summary */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Terminal size={14} />
                    <span>{logs.length} events</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
             {/* Chat Button */}
             <button 
                onClick={(e) => { e.stopPropagation(); setIsChatOpen(true); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors text-xs font-medium"
             >
                 <MessageSquare size={14} />
                 ChatIA
             </button>

             {/* Tabs */}
             {isOpen && (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {['logs', 'timeline'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                                activeTab === tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Console Content */}
      {isOpen && (
        <div className="flex-1 bg-[#121212] overflow-hidden flex relative">
            {/* Logs View */}
            {activeTab === 'logs' && (
                 <div className="flex-1 p-0 overflow-y-auto font-mono text-xs">
                     <table className="w-full text-left border-collapse">
                         <thead className="bg-white/5 text-gray-500 sticky top-0">
                             <tr>
                                 <th className="p-2 w-24">Time</th>
                                 <th className="p-2 w-32">Node</th>
                                 <th className="p-2 w-24">Status</th>
                                 <th className="p-2">Message</th>
                             </tr>
                         </thead>
                         <tbody>
                             {logs.map((log) => (
                                 <tr 
                                    key={log.id} 
                                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${selectedLog?.id === log.id ? 'bg-white/10' : ''}`}
                                    onClick={() => setSelectedLog(log)}
                                 >
                                     <td className="p-2 text-gray-500">{log.timestamp}</td>
                                     <td className="p-2 text-gray-300">{log.nodeLabel}</td>
                                     <td className={`p-2 font-medium ${getStatusColor(log.status)}`}>{log.status.toUpperCase()}</td>
                                     <td className="p-2 text-gray-400 truncate max-w-xl">{log.message}</td>
                                 </tr>
                             ))}
                             {logs.length === 0 && (
                                 <tr>
                                     <td colSpan={4} className="p-8 text-center text-gray-600 italic">
                                         No logs yet. Run a workflow to see events here.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
            )}
            
            {/* Timeline View Placeholder */}
            {activeTab === 'timeline' && (
                <div className="flex-1 p-6 overflow-x-auto flex items-center justify-center text-gray-500 italic">
                    Timeline view coming soon...
                </div>
            )}

            {/* Log Detail Modal (Overlay) */}
            {selectedLog && (
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-surface border-l border-border shadow-2xl flex flex-col animate-[slideIn_0.2s_ease-out]">
                    <div className="flex items-center justify-between p-3 border-b border-border bg-surfaceHighlight">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${getStatusColor(selectedLog.status)}`}>{selectedLog.status.toUpperCase()}</span>
                            <span className="text-sm font-semibold text-white">{selectedLog.nodeLabel}</span>
                        </div>
                        <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex-1 p-4 overflow-auto font-mono text-xs text-gray-300">
                        <div className="mb-4">
                            <div className="text-gray-500 mb-1">Message</div>
                            <div className="p-2 bg-black rounded border border-white/10">{selectedLog.message}</div>
                        </div>
                        {selectedLog.input && (
                            <div className="mb-4">
                                <div className="text-gray-500 mb-1">Input / Prompts</div>
                                <pre className="p-3 bg-black rounded border border-white/10 whitespace-pre-wrap overflow-x-auto text-blue-400">
                                    {selectedLog.input}
                                </pre>
                            </div>
                        )}
                        {selectedLog.output && (
                            <div>
                                <div className="text-gray-500 mb-1">Output / Response</div>
                                <pre className="p-3 bg-black rounded border border-white/10 whitespace-pre-wrap overflow-x-auto text-green-400">
                                    {selectedLog.output}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}
      
      <ChatIA isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
