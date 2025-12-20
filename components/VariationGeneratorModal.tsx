import React, { useState } from 'react';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react';

interface VariationGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (instructions: string[]) => void;
}

export const VariationGeneratorModal: React.FC<VariationGeneratorModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [count, setCount] = useState(3);
    const [instructions, setInstructions] = useState<string[]>(['', '', '']);

    const handleCountChange = (newCount: number) => {
        const validCount = Math.max(1, Math.min(10, newCount));
        setCount(validCount);
        
        // Adjust instructions array
        if (validCount > instructions.length) {
            setInstructions([...instructions, ...Array(validCount - instructions.length).fill('')]);
        } else {
            setInstructions(instructions.slice(0, validCount));
        }
    };

    const handleInstructionChange = (index: number, value: string) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const handleSubmit = () => {
        onGenerate(instructions);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#111] border border-white/10 rounded-lg shadow-2xl w-[500px] flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-transparent">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" />
                        <span className="font-semibold text-white text-sm">Generate AI Variations</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-400 font-medium">Number of Variations</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={count} 
                            onChange={(e) => handleCountChange(parseInt(e.target.value) || 1)}
                            className="w-16 bg-[#0D0D0D] border border-white/10 rounded px-2 py-1 text-xs text-white text-center focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {instructions.map((inst, index) => (
                            <div key={index} className="space-y-1 animate-[fadeIn_0.2s_ease-out]">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-gray-500 uppercase tracking-wider">Variation {index + 1}</label>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder={`e.g. "Make it more concise", "Focus on technical details"...`}
                                    value={inst}
                                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                                    className="w-full bg-[#0D0D0D] border border-white/10 rounded p-2 text-xs text-gray-300 focus:border-purple-500 focus:outline-none transition-colors"
                                    autoFocus={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 bg-[#161616] flex justify-end gap-2">
                    <button 
                        onClick={onClose}
                        className="px-3 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={instructions.every(i => !i.trim())}
                        className="flex items-center gap-2 px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles size={12} />
                        Generate {count} Variations
                    </button>
                </div>
            </div>
        </div>
    );
};
