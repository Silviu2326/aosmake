import React, { useEffect, useState } from 'react';
import { Play, Clock, AlertCircle, CheckCircle, MoreHorizontal, Filter, Search, ChevronRight, X, Download } from 'lucide-react';

interface Run {
    id: string;
    status: string;
    start_time: string;
    duration_ms: number;
    workflow_version: number;
    results?: any;
    type?: string;
}

// Ensure we are using the correct backend URL
const getApiUrl = (path: string) => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `https://backendaos-production.up.railway.app/api/workflows/${path}`;
    }
    return `https://backendaos-production.up.railway.app/api/workflows/${path}`;
};

export const RunsPanel: React.FC = () => {
    const [runs, setRuns] = useState<Run[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [activeTab, setActiveTab] = useState<'precrafter' | 'crafter'>('precrafter');

    useEffect(() => {
        fetchRuns();
    }, [activeTab]);

    const fetchRuns = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(getApiUrl(`${activeTab}/runs`));
            if (response.ok) {
                const data = await response.json();
                setRuns(data);
            }
        } catch (error) {
            console.error('Failed to fetch runs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunClick = async (run: Run) => {
        // If we already have details (results), just open
        if (run.results) {
            setSelectedRun(run);
            return;
        }

        // Fetch full details
        try {
            const response = await fetch(getApiUrl(`runs/${run.id}`));
            if (response.ok) {
                const data = await response.json();
                setSelectedRun(data);
            }
        } catch (error) {
            console.error('Failed to fetch run details:', error);
        }
    };

    const formatDuration = (ms: number) => {
        if (!ms) return '-';
        if (ms < 1000) return `${ms}ms`;
        const s = Math.floor(ms / 1000);
        if (s < 60) return `${s}s`;
        const m = Math.floor(s / 60);
        return `${m}m ${s % 60}s`;
    };

    const getTimeAgo = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    const handleDownloadRun = (run: Run) => {
        const runData = {
            id: run.id,
            status: run.status,
            start_time: run.start_time,
            duration_ms: run.duration_ms,
            workflow_version: run.workflow_version,
            type: run.type || activeTab,
            results: run.results
        };

        const dataStr = JSON.stringify(runData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `run_${run.id.substring(0, 8)}_${new Date(run.start_time).toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col h-full bg-[#0D0D0D] text-gray-300 relative">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-white">Runs</h2>
                    <div className="flex bg-white/5 rounded-lg p-0.5">
                        <button
                            onClick={() => setActiveTab('precrafter')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'precrafter' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            PreCrafter
                        </button>
                        <button
                            onClick={() => setActiveTab('crafter')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'crafter' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Crafter
                        </button>
                    </div>
                </div>
                <button
                    onClick={fetchRuns}
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                    title="Refresh"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-xs text-gray-500">Loading runs...</div>
                ) : runs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No runs found for {activeTab}.</div>
                ) : (
                    <div className="w-full">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase bg-surfaceHighlight/30">
                            <div className="col-span-3">Status</div>
                            <div className="col-span-2">Version</div>
                            <div className="col-span-2">Duration</div>
                            <div className="col-span-3">Time</div>
                            <div className="col-span-2 text-right"></div>
                        </div>
                        {runs.map((run) => (
                            <div
                                key={run.id}
                                onClick={() => handleRunClick(run)}
                                className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors items-center cursor-pointer group"
                            >
                                <div className="col-span-3">
                                    <StatusBadge status={run.status} />
                                </div>
                                <div className="col-span-2 text-xs text-gray-400">
                                    v{run.workflow_version || '?'}
                                </div>
                                <div className="col-span-2 text-xs text-gray-400 font-mono">
                                    {formatDuration(run.duration_ms)}
                                </div>
                                <div className="col-span-3 text-xs text-gray-500">
                                    {getTimeAgo(run.start_time)}
                                </div>
                                <div className="col-span-2 text-right">
                                    <ChevronRight size={14} className="ml-auto text-gray-600 group-hover:text-white" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Slide-over Details Panel */}
            {selectedRun && (
                <div className="absolute top-0 right-0 bottom-0 w-[500px] bg-[#151515] border-l border-white/10 shadow-2xl z-20 flex flex-col animate-[slideIn_0.2s_ease-out]">
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-surface/50">
                        <div className="flex items-center gap-2">
                            <StatusBadge status={selectedRun.status} />
                            <span className="text-sm font-mono text-gray-500">{selectedRun.id.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDownloadRun(selectedRun)}
                                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                title="Download run data"
                            >
                                <Download size={14} />
                            </button>
                            <button
                                onClick={() => setSelectedRun(null)}
                                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-xs text-gray-500 uppercase">Started</span>
                                <div className="text-sm text-white">{new Date(selectedRun.start_time).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 uppercase">Duration</span>
                                <div className="text-sm text-white">{formatDuration(selectedRun.duration_ms)}</div>
                            </div>
                        </div>

                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Node Execution Results</h3>
                        <div className="space-y-4">
                            {selectedRun.results ? (
                                Object.entries(selectedRun.results).map(([nodeId, result]) => {
                                    // Support both old format (string) and new format ({input, output})
                                    const hasInputOutput = typeof result === 'object' && result !== null && 'output' in result;
                                    const output = hasInputOutput ? result.output : result;
                                    const input = hasInputOutput ? result.input : null;

                                    return (
                                        <div key={nodeId} className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                            <div className="bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 border-b border-white/5">
                                                <span className="text-purple-400">{nodeId}</span>
                                            </div>

                                            {/* Input Section */}
                                            {input && (
                                                <div className="border-b border-white/5">
                                                    <div className="bg-blue-500/5 px-3 py-1.5 text-[10px] font-semibold text-blue-400 uppercase flex items-center gap-2">
                                                        <span>Input</span>
                                                        <span className="text-[8px] text-gray-500">({input.model || 'N/A'})</span>
                                                    </div>
                                                    <div className="p-3 space-y-2">
                                                        {input.systemPrompt && (
                                                            <div>
                                                                <div className="text-[9px] text-gray-500 mb-1">System Prompt:</div>
                                                                <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap bg-black/30 p-2 rounded">
                                                                    {input.systemPrompt}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {input.userPrompt && (
                                                            <div>
                                                                <div className="text-[9px] text-gray-500 mb-1">User Prompt:</div>
                                                                <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap bg-black/30 p-2 rounded">
                                                                    {input.userPrompt}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {input.temperature !== undefined && (
                                                            <div className="text-[9px] text-gray-400">
                                                                Temperature: <span className="text-blue-400">{input.temperature}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Output Section */}
                                            <div>
                                                <div className="bg-green-500/5 px-3 py-1.5 text-[10px] font-semibold text-green-400 uppercase">
                                                    Output
                                                </div>
                                                <div className="p-3 overflow-x-auto">
                                                    <pre className="text-[10px] font-mono text-green-400 whitespace-pre-wrap">
                                                        {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-xs text-gray-500 italic">No execution data recorded.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper components
import { RotateCcw } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = '';
    let icon = null;
    let label = status;

    switch (status) {
        case 'success':
            colorClass = 'bg-green-500/10 text-green-400 border-green-500/20';
            icon = <CheckCircle size={10} />;
            label = 'Success';
            break;
        case 'failed':
        case 'error':
            colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            icon = <AlertCircle size={10} />;
            label = 'Failed';
            break;
        case 'running':
            colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            icon = <div className="w-2 h-2 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />;
            label = 'Running';
            break;
        default:
            colorClass = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            label = status;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${colorClass}`}>
            {icon}
            {label}
        </span>
    );
};