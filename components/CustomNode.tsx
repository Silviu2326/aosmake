import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Cpu, FileJson, ArrowRight, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import { NodeStatus } from '../types';

const StatusIcon = ({ status }: { status: NodeStatus }) => {
    switch (status) {
        case NodeStatus.SUCCESS: return <CheckCircle2 size={14} className="text-success" />;
        case NodeStatus.WARNING: return <AlertCircle size={14} className="text-warning" />;
        case NodeStatus.ERROR: return <AlertCircle size={14} className="text-error" />;
        case NodeStatus.RUNNING: return <Loader2 size={14} className="text-accent animate-spin" />;
        default: return <div className="w-3 h-3 rounded-full bg-gray-600" />;
    }
}

const CustomNode = ({ data, selected }: NodeProps) => {
    return (
        <div className={`w-[200px] rounded-lg border transition-shadow duration-200 group hover:shadow-lg backdrop-blur-sm bg-surface/80
            ${selected ? 'border-accent bg-surfaceHighlight shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10 hover:border-white/30'}
        `}>
            {/* Input Handle */}
            <Handle 
                type="target" 
                position={Position.Left} 
                className="w-3 h-3 !bg-gray-500 !border-2 !border-background" 
            />

            {/* Header */}
            <div className="p-3 flex items-start justify-between border-b border-white/5 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${selected ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-400'}`}>
                        {data.type === 'LLM' ? <Cpu size={14} /> : data.type === 'PERPLEXITY' ? <Globe size={14} /> : <FileJson size={14} />}
                    </div>
                    <span className="text-sm font-medium text-gray-200">{data.label}</span>
                </div>
                <StatusIcon status={data.status} />
            </div>
            
            {/* Body */}
            <div className="p-2 space-y-2 pointer-events-none">
                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-semibold">
                    <div className="flex flex-col gap-1">
                        {data.inputs && data.inputs.map((i: string) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/5">{i}</span>)}
                    </div>
                    <ArrowRight size={10} className="text-gray-600" />
                    <div className="flex flex-col gap-1 items-end">
                        {data.outputs && data.outputs.map((o: string) => <span key={o} className="px-1.5 py-0.5 rounded bg-white/5">{o}</span>)}
                    </div>
                </div>
                
                {data.tokens && (
                    <div className="pt-2 mt-1 border-t border-white/5 flex justify-end">
                        <span className="text-[10px] text-accent/70 font-mono bg-accent/5 px-1.5 rounded">{data.tokens} tokens</span>
                    </div>
                )}
            </div>

            {/* Output Handle */}
            <Handle 
                type="source" 
                position={Position.Right} 
                className="w-3 h-3 !bg-gray-500 !border-2 !border-background" 
            />

             {/* Selection Glow (handled by border class above, but could be enhanced here) */}
        </div>
    );
};

export default memo(CustomNode);