import React from 'react';
import { CheckCircle, AlertCircle, Clock, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StepResult {
    id: string;
    nodeLabel: string;
    status: 'pending' | 'running' | 'success' | 'error';
    output?: any;
    duration?: number;
}

interface OutputPanelProps {
    steps: StepResult[];
}

export function OutputPanel({ steps }: OutputPanelProps) {
    return (
        <div className="flex flex-col h-full bg-surface">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Execution Output</h2>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {steps.length === 0 && (
                    <div className="text-center text-gray-500 py-10 text-xs">
                        Run test to see output steps
                    </div>
                )}

                {steps.map((step) => (
                    <div key={step.id} className="border border-white/10 rounded-lg bg-surfaceHighlight/30 overflow-hidden">
                        <div className="flex items-center justify-between p-3 bg-white/5">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(step.status)}
                                <span className="text-sm font-medium text-white">{step.nodeLabel}</span>
                            </div>
                            {step.duration && (
                                <span className="text-xs text-gray-500">{step.duration}ms</span>
                            )}
                        </div>

                        {step.output && (
                            <div className="p-3 border-t border-white/10">
                                <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1 flex items-center gap-1">
                                    <Terminal size={10} /> Output
                                </div>
                                <pre className="text-xs font-mono text-green-400/90 whitespace-pre-wrap">
                                    {JSON.stringify(step.output, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'running': return <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
        case 'success': return <CheckCircle size={14} className="text-green-500" />;
        case 'error': return <AlertCircle size={14} className="text-red-500" />;
        default: return <Clock size={14} className="text-gray-600" />;
    }
}
