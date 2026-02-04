import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Run } from './RunsTable';
import { RunStatusBadge } from './RunStatusBadge';
import { NodeResultCard } from './NodeResultCard';
import { cn } from '../../lib/utils';

interface RunDetailPanelProps {
    run: Run | null;
    onClose: () => void;
}

// Mock Node Results based on run status
const MOCK_RESULTS = [
    { id: 'n1', nodeId: 'Lead Analyzer', nodeType: 'LLM', status: 'success' as const, duration: 1200, tokens: 450, input: { prompt: "Analyze this lead..." }, output: { score: 85, sentiment: "positive" } },
    { id: 'n2', nodeId: 'Enricher', nodeType: 'API', status: 'success' as const, duration: 800, input: { email: "test@test.com" }, output: { company: "Acme", role: "CEO" } },
    { id: 'n3', nodeId: 'Email Drafter', nodeType: 'LLM', status: 'success' as const, duration: 2100, tokens: 890, input: { context: "draft email" }, output: { subject: "Hello", body: "World" } },
];

export function RunDetailPanel({ run, onClose }: RunDetailPanelProps) {
    if (!run) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-surface border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
                run ? "translate-x-0" : "translate-x-full"
            )}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-surfaceHighlight/10">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-3">
                            Run Details
                            <span className="text-xs font-mono font-normal text-gray-500">#{run.id.slice(0, 8)}</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <RunStatusBadge status={run.status} />
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-400">{run.duration}ms duration</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-400">{run.startTime.toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Download JSON">
                            <Download size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Metadata Card */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-surfaceHighlight/20 border border-white/5">
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Workflow</div>
                            <div className="text-sm text-accent font-medium mt-1 flex items-center gap-1 cursor-pointer hover:underline">
                                v{run.workflowVersion} <ExternalLink size={12} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Type</div>
                            <div className="text-sm text-white capitalize mt-1">{run.type}</div>
                        </div>
                    </div>

                    {/* Node Results */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Execution Steps</h3>
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-4 before:w-0.5 before:bg-white/5">
                            {MOCK_RESULTS.map((result, idx) => (
                                <div key={result.id} className="relative z-10 pl-10">
                                    {/* Connector Dot */}
                                    <div className={cn(
                                        "absolute left-[13px] top-6 w-2 h-2 rounded-full border-2 border-surface",
                                        result.status === 'success' ? "bg-green-500" : "bg-red-500"
                                    )} />
                                    <NodeResultCard result={result} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}
