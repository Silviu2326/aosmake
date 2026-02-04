import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';

interface InputPanelProps {
    mode: 'lead' | 'json';
    onModeChange: (mode: 'lead' | 'json') => void;
    // Lead Mode Props
    onLeadSelect: (leadId: string) => void;
    // JSON Mode Props
    jsonValue: string;
    onJsonChange: (val: string) => void;
}

export function InputPanel({ mode, onModeChange, onLeadSelect, jsonValue, onJsonChange }: InputPanelProps) {
    return (
        <div className="flex flex-col h-full bg-surface border-r border-white/5">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Input Context</h2>

                {/* Mode Toggle */}
                <div className="flex p-1 bg-surfaceHighlight rounded-lg mb-4">
                    <button
                        className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition-colors", mode === 'lead' ? 'bg-surface text-white shadow-sm' : 'text-gray-400 hover:text-white')}
                        onClick={() => onModeChange('lead')}
                    >
                        Lead Selection
                    </button>
                    <button
                        className={clsx("flex-1 py-1.5 text-xs font-medium rounded-md transition-colors", mode === 'json' ? 'bg-surface text-white shadow-sm' : 'text-gray-400 hover:text-white')}
                        onClick={() => onModeChange('json')}
                    >
                        Raw JSON
                    </button>
                </div>

                {/* Lead Selector */}
                {mode === 'lead' && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <Input
                            placeholder="Search leads..."
                            className="pl-9 h-9 text-xs"
                            onChange={(e) => console.log('Search', e.target.value)}
                        />
                        <div className="mt-2 space-y-1">
                            <div
                                className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer text-xs"
                                onClick={() => onLeadSelect('l1')}
                            >
                                <div className="text-white font-medium">John Smith</div>
                                <div className="text-gray-500">Acme Inc</div>
                            </div>
                            <div
                                className="p-2 rounded hover:bg-white/10 cursor-pointer text-xs"
                                onClick={() => onLeadSelect('l2')}
                            >
                                <div className="text-white font-medium">Jane Doe</div>
                                <div className="text-gray-500">Tech Corp</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#0d0d0d] p-0">
                <textarea
                    className="w-full h-full bg-transparent text-xs font-mono text-gray-300 p-4 resize-none focus:outline-none"
                    value={jsonValue}
                    onChange={(e) => onJsonChange(e.target.value)}
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
