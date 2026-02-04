import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { GitBranch, CheckCircle2, AlertCircle, Loader2, Check, X, Plus } from 'lucide-react';
import { NodeStatus } from '../../types';

const StatusIcon = ({ status }: { status: NodeStatus }) => {
    switch (status) {
        case NodeStatus.SUCCESS: return <CheckCircle2 size={14} className="text-success" />;
        case NodeStatus.WARNING: return <AlertCircle size={14} className="text-warning" />;
        case NodeStatus.ERROR: return <AlertCircle size={14} className="text-error" />;
        case NodeStatus.RUNNING: return <Loader2 size={14} className="text-accent animate-spin" />;
        default: return <div className="w-3 h-3 rounded-full bg-gray-600" />;
    }
}

const FilterNode = ({ data, selected, id }: NodeProps) => {
    const condition = data.filterCondition || {};
    const hasCondition = condition.field && condition.operator;
    const hasTrueConnection = data.hasTrueConnection || false;
    const hasFalseConnection = data.hasFalseConnection || false;

    const handleAddTrueNode = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.onAddNode) {
            data.onAddNode(id, 'true');
        }
    };

    const handleAddFalseNode = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.onAddNode) {
            data.onAddNode(id, 'false');
        }
    };

    return (
        <div className={`w-[220px] rounded-lg border transition-shadow duration-200 group hover:shadow-lg backdrop-blur-sm
            ${selected
                ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                : 'border-yellow-500/30 bg-surface/80 hover:border-yellow-500/50'}
        `}>
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-gray-500 !border-2 !border-background"
                style={{ top: '50%' }}
            />

            {/* Header */}
            <div className="p-3 flex items-start justify-between border-b border-yellow-500/20">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${selected ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        <GitBranch size={14} />
                    </div>
                    <span className="text-sm font-medium text-gray-200">{data.label}</span>
                </div>
                <StatusIcon status={data.status} />
            </div>

            {/* Body - Condition Display */}
            <div className="p-3 space-y-2">
                {hasCondition ? (
                    <div className="text-[10px] font-mono bg-black/30 rounded p-2 border border-white/5">
                        <span className="text-blue-400">{data.conditionDisplayName || condition.field}</span>
                        <span className="text-yellow-400 mx-1">{condition.operator}</span>
                        {condition.value && <span className="text-green-400">"{condition.value}"</span>}
                    </div>
                ) : (
                    <div className="text-[10px] text-gray-500 italic text-center py-1">
                        Click para configurar condición
                    </div>
                )}

                {/* Output Labels with Add Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                    {/* TRUE output */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Check size={10} className="text-green-500" />
                            <span className="text-[9px] text-green-500 uppercase font-bold">True</span>
                        </div>
                        {!hasTrueConnection && (
                            <button
                                onClick={handleAddTrueNode}
                                className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-[9px] text-green-400 transition-colors"
                            >
                                <Plus size={10} />
                                Añadir
                            </button>
                        )}
                    </div>

                    {/* FALSE output */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <X size={10} className="text-red-500" />
                            <span className="text-[9px] text-red-500 uppercase font-bold">False</span>
                        </div>
                        {!hasFalseConnection && (
                            <button
                                onClick={handleAddFalseNode}
                                className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-[9px] text-red-400 transition-colors"
                            >
                                <Plus size={10} />
                                Añadir
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Output Handle TRUE (top-right) */}
            <Handle
                type="source"
                position={Position.Right}
                id="true"
                className="w-3 h-3 !bg-green-500 !border-2 !border-background"
                style={{ top: '35%' }}
            />

            {/* Output Handle FALSE (bottom-right) */}
            <Handle
                type="source"
                position={Position.Right}
                id="false"
                className="w-3 h-3 !bg-red-500 !border-2 !border-background"
                style={{ top: '65%' }}
            />
        </div>
    );
};

export default memo(FilterNode);
