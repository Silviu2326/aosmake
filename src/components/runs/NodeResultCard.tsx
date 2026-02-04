import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface NodeResult {
    id: string;
    nodeId: string;
    nodeType: string;
    status: 'success' | 'error';
    input: any;
    output: any;
    duration: number;
    tokens?: number;
}

interface NodeResultCardProps {
    result: NodeResult;
}

export function NodeResultCard({ result }: NodeResultCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(result.output, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-white/10 rounded-lg bg-surfaceHighlight/30 overflow-hidden">
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                            {result.nodeId}
                            <span className="text-xs font-normal text-gray-500 uppercase tracking-wide px-1.5 py-0.5 border border-white/5 rounded">
                                {result.nodeType}
                            </span>
                        </span>
                        <span className="text-xs text-gray-500">
                            {result.duration}ms • {result.tokens ? `${result.tokens} tokens` : 'Local execution'}
                        </span>
                    </div>
                </div>

                <Badge variant={result.status === 'success' ? 'success' : 'error'} className="capitalize">
                    {result.status}
                </Badge>
            </div>

            {expanded && (
                <div className="border-t border-white/10 p-4 space-y-4">
                    {/* Input Section */}
                    <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Terminal size={12} /> Input
                        </div>
                        <pre className="text-xs font-mono bg-black/50 p-3 rounded-md text-gray-300 overflow-auto max-h-40 scrollbar-thin">
                            {JSON.stringify(result.input, null, 2)}
                        </pre>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Terminal size={12} /> Output
                            </div>
                            <button
                                onClick={handleCopy}
                                className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied' : 'Copy JSON'}
                            </button>
                        </div>
                        <pre className="text-xs font-mono bg-black/50 p-3 rounded-md text-green-400/90 overflow-auto max-h-60 scrollbar-thin">
                            {JSON.stringify(result.output, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
