import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, FileText, User, Maximize2 } from 'lucide-react';
import { VariableHighlighter } from './VariableHighlighter';

interface PromptEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (systemPrompt: string, userPrompt: string) => void;
    initialSystemPrompt: string;
    initialUserPrompt: string;
    nodeLabel: string;
    availableVariables?: { nodeId: string, nodeLabel: string, fields: string[] }[];
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialSystemPrompt,
    initialUserPrompt,
    nodeLabel,
    availableVariables = []
}) => {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [activeField, setActiveField] = useState<'system' | 'user'>('user'); // Default to user prompt

    // Refs to track selection position for each field
    const systemRef = useRef<HTMLTextAreaElement>(null);
    const userRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSystemPrompt(initialSystemPrompt || '');
            setUserPrompt(initialUserPrompt || '');
            setActiveField('user');
        }
    }, [isOpen, initialSystemPrompt, initialUserPrompt]);

    const handleSave = () => {
        onSave(systemPrompt, userPrompt);
        onClose();
    };

    const handleInsertVariable = (variable: string) => {
        const textarea = activeField === 'system' ? systemRef.current : userRef.current;
        const setFunction = activeField === 'system' ? setSystemPrompt : setUserPrompt;

        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const insertion = ` {{${variable}}} `; // Add spaces for better UX

        setFunction(before + insertion + after);

        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            const newPos = start + insertion.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-[90vw] max-w-[1200px] h-[85vh] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                            <Maximize2 size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Advanced Prompt Editor</h3>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <span>Editing:</span>
                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{nodeLabel}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Body: Editors + Sidebar */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content Area - Split View */}
                    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
                        {/* System Prompt Section */}
                        <div
                            className={`flex-1 flex flex-col border-b border-white/5 transition-colors ${activeField === 'system' ? 'bg-[#0D0D0D]' : 'bg-[#0A0A0A] opacity-80 hover:opacity-100'}`}
                            onClick={() => setActiveField('system')}
                        >
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/30">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                    <FileText size={14} className={activeField === 'system' ? 'text-purple-400' : 'text-gray-500'} />
                                    SYSTEM PROMPT
                                    {activeField === 'system' && <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">Active</span>}
                                </div>
                                <span className="text-[10px] text-gray-600">Defines the agent's persona and core rules</span>
                            </div>
                            <div className="flex-1 w-full h-full p-0 relative">
                                <VariableHighlighter
                                    ref={systemRef}
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    onClick={() => setActiveField('system')}
                                    onFocus={() => setActiveField('system')}
                                    className="w-full h-full !border-0"
                                    placeholder="You are a helpful assistant..."
                                />
                            </div>
                        </div>

                        {/* User Prompt Section */}
                        <div
                            className={`flex-1 flex flex-col transition-colors ${activeField === 'user' ? 'bg-[#0D0D0D]' : 'bg-[#0A0A0A] opacity-80 hover:opacity-100'}`}
                            onClick={() => setActiveField('user')}
                        >
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/30 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                    <User size={14} className={activeField === 'user' ? 'text-blue-400' : 'text-gray-500'} />
                                    USER PROMPT
                                    {activeField === 'user' && <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Active</span>}
                                </div>
                                <span className="text-[10px] text-gray-600">The specific task or query for this execution</span>
                            </div>
                            <div className="flex-1 w-full h-full p-0 relative">
                                <VariableHighlighter
                                    ref={userRef}
                                    value={userPrompt}
                                    onChange={(e) => setUserPrompt(e.target.value)}
                                    onClick={() => setActiveField('user')}
                                    onFocus={() => setActiveField('user')}
                                    className="w-full h-full !border-0"
                                    placeholder="Analyze the following data: {{variable}}..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Available Variables */}
                    <div className="w-[300px] border-l border-white/5 bg-surface/50 flex flex-col">
                        <div className="p-4 border-b border-white/5">
                            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Context Variables</h4>
                            <p className="text-[10px] text-gray-500">
                                Click to insert into the <span className={activeField === 'system' ? "text-purple-400" : "text-blue-400"}>active editor</span>
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                            {availableVariables.length > 0 ? (
                                availableVariables.map(node => (
                                    <div key={node.nodeId} className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></div>
                                            <div className="text-xs font-medium text-gray-300 truncate" title={node.nodeLabel}>
                                                {node.nodeLabel}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 pl-3">
                                            {node.fields.map(field => (
                                                <button
                                                    key={field}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleInsertVariable(`${node.nodeId}.${field}`);
                                                    }}
                                                    className="group flex items-center justify-between px-2 py-1.5 rounded bg-black/20 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-left w-full"
                                                >
                                                    <span className="text-[10px] text-blue-300/80 font-mono truncate group-hover:text-blue-300 flex-1 mr-2">
                                                        {field}
                                                    </span>
                                                    <Plus size={10} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                </button>
                                            ))}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleInsertVariable(`${node.nodeId}.output`);
                                                }}
                                                className="group flex items-center justify-between px-2 py-1.5 rounded bg-black/20 border border-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all text-left w-full mt-1"
                                                title="Insert complete JSON output"
                                            >
                                                <span className="text-[10px] text-purple-300/80 font-mono truncate group-hover:text-purple-300 flex-1 mr-2">
                                                    output (raw)
                                                </span>
                                                <Plus size={10} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8">
                                    <div className="text-gray-600 mb-2">No upstream nodes</div>
                                    <p className="text-[10px] text-gray-700">
                                        Connect nodes to this one to access their outputs here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-surface flex justify-between items-center z-10">
                    <div className="text-xs text-gray-500">
                        Pro Tip: Use <span className="font-mono text-gray-400">{`{{nodeId.field}}`}</span> syntax for dynamic values
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded border border-white/10 text-xs font-medium text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2"
                        >
                            <Save size={14} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};