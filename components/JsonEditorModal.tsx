import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Plus } from 'lucide-react';

interface JsonEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (json: string) => void;
    initialValue: string;
    nodeLabel: string;
    availableVariables?: { nodeId: string, nodeLabel: string, fields: string[] }[];
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({ isOpen, onClose, onSave, initialValue, nodeLabel, availableVariables = [] }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue || '{\n  \n}');
            setError(null);
        }
    }, [isOpen, initialValue]);

    const handleSave = () => {
        try {
            JSON.parse(value); // Validate JSON
            onSave(value);
            onClose();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleInsertVariable = (variable: string) => {
        if (!textareaRef.current) return;
        
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const insertion = `{{${variable}}}`;
        
        setValue(before + insertion + after);
        
        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertion.length, start + insertion.length);
        }, 0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-[900px] h-[600px] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Edit JSON</span>
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded">{nodeLabel}</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body: Editor + Sidebar */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor */}
                    <div className="flex-1 relative flex flex-col">
                        <textarea 
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                setError(null);
                            }}
                            className="flex-1 w-full bg-[#0D0D0D] text-green-400 font-mono text-xs p-4 resize-none focus:outline-none"
                            spellCheck={false}
                        />
                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded flex items-center gap-2 pointer-events-none">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Available Variables */}
                    {availableVariables.length > 0 && (
                        <div className="w-[250px] border-l border-white/5 bg-surface/50 flex flex-col">
                            <div className="p-3 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Insert Variables
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                                {availableVariables.map(node => (
                                    <div key={node.nodeId} className="space-y-1">
                                        <div className="text-[10px] text-gray-500 font-medium truncate px-1">
                                            {node.nodeLabel}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {node.fields.map(field => (
                                                <button 
                                                    key={field}
                                                    onClick={() => handleInsertVariable(`${node.nodeId}.${field}`)}
                                                    className="text-left px-2 py-1.5 rounded bg-black/40 border border-white/5 text-[10px] text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center gap-2 group"
                                                >
                                                    <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <span className="truncate">{field}</span>
                                                </button>
                                            ))}
                                            {node.fields.length === 0 && (
                                                <button 
                                                    onClick={() => handleInsertVariable(`${node.nodeId}.output`)}
                                                    className="text-left px-2 py-1.5 rounded bg-black/40 border border-white/5 text-[10px] text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center gap-2 group"
                                                >
                                                     <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                     <span className="truncate">output (raw)</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-surface flex justify-end gap-3 z-10">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-white/10 text-xs font-medium text-gray-400 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-accent hover:bg-accent/90 text-xs font-medium text-white transition-colors flex items-center gap-2"
                    >
                        <Save size={14} />
                        Save JSON
                    </button>
                </div>
            </div>
        </div>
    );
};