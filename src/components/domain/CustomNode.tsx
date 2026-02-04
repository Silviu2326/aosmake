import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Cpu, FileJson, FileSpreadsheet, FileInput, FileOutput, ArrowRight, CheckCircle2, AlertCircle, Loader2, Globe, Gift, Snowflake, DollarSign, Coins, Wallet, TrendingUp, Diamond, Users, UserCheck } from 'lucide-react';
import { NodeStatus } from '../../types';

const StatusIcon = ({ status, isChristmas, isMoney }: { status: NodeStatus, isChristmas?: boolean, isMoney?: boolean }) => {
    if (isMoney) {
        switch (status) {
            case NodeStatus.SUCCESS: return <span className="text-green-400 animate-pulse">💰</span>;
            case NodeStatus.WARNING: return <span className="text-yellow-400">📉</span>;
            case NodeStatus.ERROR: return <span className="text-red-500">💸</span>;
            case NodeStatus.RUNNING: return <span className="animate-spin">🪙</span>;
            default: return <div className="w-3 h-3 rounded-full bg-green-900 border border-green-500" />;
        }
    }
    if (isChristmas) {
        switch (status) {
            case NodeStatus.SUCCESS: return <span className="text-green-400 animate-pulse">🎄</span>;
            case NodeStatus.WARNING: return <span className="text-yellow-400">⚠️</span>;
            case NodeStatus.ERROR: return <span className="text-red-500">❄️</span>;
            case NodeStatus.RUNNING: return <Loader2 size={14} className="text-white animate-spin" />;
            default: return <div className="w-3 h-3 rounded-full bg-red-500/50" />;
        }
    }
    switch (status) {
        case NodeStatus.SUCCESS: return <CheckCircle2 size={14} className="text-success" />;
        case NodeStatus.WARNING: return <AlertCircle size={14} className="text-warning" />;
        case NodeStatus.ERROR: return <AlertCircle size={14} className="text-error" />;
        case NodeStatus.RUNNING: return <Loader2 size={14} className="text-accent animate-spin" />;
        default: return <div className="w-3 h-3 rounded-full bg-gray-600" />;
    }
}

const CustomNode = ({ data, selected }: NodeProps) => {
    const isChristmas = data.isChristmas;
    const isMoney = data.isMoney;

    if (isMoney) {
        return (
            <div className={`relative w-[220px] rounded-xl transition-all duration-500 group
                ${selected ? 'scale-105 shadow-[0_0_30px_rgba(255,215,0,0.6)]' : 'hover:scale-102'}
            `}
                style={{
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', // Black Card
                    border: selected ? '2px solid #FFD700' : '1px solid #FFD700', // Gold Border
                    boxShadow: selected ? '0 0 20px rgba(255,215,0,0.4)' : '0 4px 15px rgba(0,0,0,0.5)',
                    animation: 'shimmer 3s linear infinite'
                }}>
                {/* Cash Stack Top */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20 bg-green-800 border border-green-500 rounded px-2 py-0.5 text-[10px] text-green-100 font-mono shadow-lg">
                    💵 $$$
                </div>

                {/* Input Handle (Gold Coin) */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-4 !h-4 !bg-yellow-400 !border-2 !border-yellow-600 shadow-[0_0_5px_gold]"
                    style={{ top: '50%' }}
                />

                {/* Header (Premium) */}
                <div className="relative z-10 p-3 pt-4 flex items-start justify-between border-b border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-black rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border border-yellow-500/50 ${selected ? 'bg-yellow-500/20 text-yellow-300' : 'bg-black text-yellow-500'}`}>
                            {data.type === 'LLM' ? <Diamond size={14} /> : data.type === 'PERPLEXITY' ? <TrendingUp size={14} /> : data.type === 'CSV_INPUT' ? <FileInput size={14} /> : data.type === 'CSV_OUTPUT' ? <FileOutput size={14} /> : <Wallet size={14} />}
                        </div>
                        <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm tracking-wide font-sans">
                            {data.label}
                        </span>
                    </div>
                    <StatusIcon status={data.status} isMoney={true} />
                </div>

                {/* Body (Matrix/Finance) */}
                <div className="relative z-10 p-3 space-y-2 bg-black/80 backdrop-blur-sm rounded-b-xl">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold tracking-wider font-mono">
                        <div className="flex flex-col gap-1">
                            {data.inputs && data.inputs.map((i: string) => (
                                <span key={i} className="px-2 py-0.5 rounded border border-green-900 text-green-500">
                                    IN: {i}
                                </span>
                            ))}
                        </div>
                        <DollarSign size={12} className="text-green-600 opacity-50" />
                        <div className="flex flex-col gap-1 items-end">
                            {data.outputs && data.outputs.map((o: string) => (
                                <span key={o} className="px-2 py-0.5 rounded border border-yellow-900 text-yellow-500">
                                    OUT: {o}
                                </span>
                            ))}
                        </div>
                    </div>

                    {data.tokens && (
                        <div className="pt-2 mt-1 border-t border-white/5 flex justify-end items-center gap-1">
                            <span className="text-[9px] text-green-400 font-mono">COST:</span>
                            <span className="text-[9px] text-yellow-400 font-mono bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-500/20">
                                ${((data.tokens / 1000) * 0.02).toFixed(4)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Output Handle (Gold Coin) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-4 !h-4 !bg-yellow-400 !border-2 !border-yellow-600 shadow-[0_0_5px_gold]"
                    style={{ top: '50%' }}
                />

                <style>{`
                    @keyframes shimmer {
                        0% { border-color: #b8860b; box-shadow: 0 0 5px #b8860b; }
                        50% { border-color: #ffd700; box-shadow: 0 0 15px #ffd700; }
                        100% { border-color: #b8860b; box-shadow: 0 0 5px #b8860b; }
                    }
                `}</style>
            </div>
        );
    }

    if (isChristmas) {
        return (
            <div className={`relative w-[220px] rounded-xl transition-all duration-500 group
                ${selected ? 'scale-105 shadow-[0_0_30px_rgba(255,0,0,0.4)]' : 'hover:scale-102'}
            `}
                style={{
                    background: 'linear-gradient(135deg, rgba(20,40,60,0.95), rgba(40,10,10,0.95))',
                    border: selected ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.2)',
                    boxShadow: selected ? '0 0 20px rgba(255,215,0,0.3)' : '0 4px 6px rgba(0,0,0,0.3)',
                    animation: 'floatNode 6s ease-in-out infinite'
                }}>
                {/* Snowy Roof */}
                <div className="absolute -top-1 left-0 right-0 h-4 bg-white rounded-t-xl z-0 opacity-90" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))' }} />

                {/* Santa Hat Decor */}
                <div className="absolute -top-6 -left-4 z-20 text-4xl filter drop-shadow-lg transform -rotate-12 hover:rotate-0 transition-transform cursor-pointer">
                    🎅
                </div>

                {/* Input Handle (Ornament) */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-4 !h-4 !bg-red-500 !border-2 !border-gold shadow-[0_0_5px_red]"
                    style={{ borderColor: '#FFD700', top: '50%' }}
                />

                {/* Header (Festive) */}
                <div className="relative z-10 p-3 pt-4 flex items-start justify-between border-b border-white/10 bg-gradient-to-r from-red-500/10 to-green-500/10 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border border-white/20 ${selected ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10 text-white'}`}>
                            {data.type === 'LLM' ? <Gift size={14} /> : data.type === 'PERPLEXITY' ? <Globe size={14} /> : data.type === 'CSV_INPUT' ? <FileInput size={14} /> : data.type === 'CSV_OUTPUT' ? <FileOutput size={14} /> : <Snowflake size={14} />}
                        </div>
                        <span className="text-sm font-bold text-white drop-shadow-md tracking-wide font-serif">{data.label}</span>
                    </div>
                    <StatusIcon status={data.status} isChristmas={true} />
                </div>

                {/* Body (Frosty) */}
                <div className="relative z-10 p-3 space-y-2 bg-white/5 backdrop-blur-sm rounded-b-xl">
                    <div className="flex justify-between items-center text-[10px] text-gray-300 uppercase font-bold tracking-wider">
                        <div className="flex flex-col gap-1">
                            {data.inputs && data.inputs.map((i: string) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-green-900/40 border border-green-500/30 text-green-300 shadow-sm">
                                    {i}
                                </span>
                            ))}
                        </div>
                        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="flex flex-col gap-1 items-end">
                            {data.outputs && data.outputs.map((o: string) => (
                                <span key={o} className="px-2 py-0.5 rounded-full bg-red-900/40 border border-red-500/30 text-red-300 shadow-sm">
                                    {o}
                                </span>
                            ))}
                        </div>
                    </div>

                    {data.tokens && (
                        <div className="pt-2 mt-1 border-t border-white/5 flex justify-end">
                            <span className="text-[9px] text-yellow-400 font-mono bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                                {data.tokens} magic sparkles
                            </span>
                        </div>
                    )}
                </div>

                {/* Output Handle (Ornament) */}
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-4 !h-4 !bg-green-500 !border-2 !border-gold shadow-[0_0_5px_green]"
                    style={{ borderColor: '#FFD700', top: '50%' }}
                />

                <style>{`
                    @keyframes floatNode {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                `}</style>
            </div>
        );
    }

    // NORMAL MODE (Legacy)
    return (
        <div className={`w-[200px] rounded-lg border transition-shadow duration-200 group hover:shadow-lg backdrop-blur-sm bg-surface/80
            ${selected ? 'border-accent bg-surfaceHighlight shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10 hover:border-white/30'}
        `}>
            {/* Input Handle - Only for nodes that need it */}
            {data.type !== 'LEAD_INPUT' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="w-3 h-3 !bg-gray-500 !border-2 !border-background"
                />
            )}

            {/* Header */}
            <div className="p-3 flex items-start justify-between border-b border-white/5 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${selected ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-400'}`}>
                        {data.type === 'LLM' ? <Cpu size={14} /> : 
                         data.type === 'PERPLEXITY' ? <Globe size={14} /> : 
                         data.type === 'CSV_INPUT' ? <FileInput size={14} /> : 
                         data.type === 'CSV_OUTPUT' ? <FileOutput size={14} /> :
                         data.type === 'LEAD_INPUT' ? <Users size={14} /> :
                         data.type === 'LEAD_OUTPUT' ? <UserCheck size={14} /> :
                         data.type === 'BOX1_INPUT' ? <Users size={14} /> :
                         data.type === 'BOX1_OUTPUT' ? <UserCheck size={14} /> :
                         <FileJson size={14} />}
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
        </div>
    );
};

export default memo(CustomNode);