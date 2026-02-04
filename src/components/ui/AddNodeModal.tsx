import React, { useState } from 'react';
import { Node } from 'reactflow';
import { X, ArrowDown, ArrowRight } from 'lucide-react';

interface AddNodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (sourceId: string, targetId: string, label: string, type: string) => void;
    nodes: Node[];
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onConfirm, nodes }) => {
    const [sourceId, setSourceId] = useState<string>('');
    const [targetId, setTargetId] = useState<string>('');
    const [nodeLabel, setNodeLabel] = useState<string>('New Processor');
    const [nodeType, setNodeType] = useState<string>('LLM');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(sourceId, targetId, nodeLabel, nodeType);
        // Reset
        setSourceId('');
        setTargetId('');
        setNodeLabel('New Processor');
        setNodeType('LLM');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-[400px] bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface">
                    <h3 className="text-sm font-semibold text-white">Add New Node</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Name Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Node Name</label>
                        <input 
                            type="text" 
                            value={nodeLabel}
                            onChange={(e) => setNodeLabel(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors"
                            placeholder="e.g. Data Validator"
                        />
                    </div>

                    {/* Type Input */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Node Type</label>
                        <select 
                            value={nodeType}
                            onChange={(e) => setNodeType(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-accent focus:outline-none transition-colors appearance-none"
                        >
                            <option value="LLM">LLM Processor</option>
                            <option value="PERPLEXITY">Perplexity Search</option>
                            <option value="ANYMAILFINDER">AnymailFinder</option>
                            <option value="JSON">JSON Static Data</option>
                            <option value="JSON_BUILDER">JSON Builder</option>
                            <option value="CSV_INPUT">CSV Input (Load Data)</option>
                            <option value="CSV_OUTPUT">CSV Output (Export Data)</option>
                            <option value="FILTER">Filter (Bifurcación)</option>
                            <option value="LEAD_INPUT">Lead Input (Database)</option>
                            <option value="LEAD_OUTPUT">Lead Output (Save Results)</option>
                            <option value="BOX1_INPUT">Box1 Input (Box1 Leads)</option>
                            <option value="BOX1_OUTPUT">Box1 Output (Mark Developed)</option>
                        </select>
                    </div>

                    <div className="relative">
                        <div className="absolute left-3 top-[26px] bottom-[-20px] w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/50 -z-10" />
                        
                        {/* Source Selection (After) */}
                        <div className="space-y-1.5 mb-4">
                            <label className="text-xs font-medium text-blue-400 flex items-center gap-1">
                                <ArrowDown size={12} /> Place After (Source)
                            </label>
                            <select 
                                value={sourceId}
                                onChange={(e) => setSourceId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-blue-500/50 focus:outline-none transition-colors appearance-none"
                            >
                                <option value="">-- Start of Flow --</option>
                                {nodes.map(n => (
                                    <option key={n.id} value={n.id}>{n.data.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Target Selection (Before) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-purple-400 flex items-center gap-1">
                                <ArrowRight size={12} /> Place Before (Target)
                            </label>
                            <select 
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-purple-500/50 focus:outline-none transition-colors appearance-none"
                            >
                                <option value="">-- End of Flow --</option>
                                {nodes.filter(n => n.id !== sourceId).map(n => (
                                    <option key={n.id} value={n.id}>{n.data.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-2 rounded border border-white/10 text-xs font-medium text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2 rounded bg-accent hover:bg-accent/90 text-xs font-medium text-white transition-colors"
                        >
                            Add Node
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};