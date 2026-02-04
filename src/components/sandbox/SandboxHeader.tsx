import React from 'react';
import { Button } from '../ui/Button';
import { Play, Loader2, ChevronDown } from 'lucide-react';
import { Flow } from '../../stores/useAppStore';

interface SandboxHeaderProps {
    flows: Flow[];
    selectedFlowId: string | undefined;
    onFlowSelect: (id: string) => void;
    onRunTest: () => void;
    isRunning: boolean;
}

export function SandboxHeader({ flows, selectedFlowId, onFlowSelect, onRunTest, isRunning }: SandboxHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-surface border-b border-white/5">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Sandbox</h1>

                {/* Flow Selector */}
                <div className="relative group">
                    <select
                        className="appearance-none bg-surfaceHighlight border border-white/10 text-white pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:border-accent"
                        value={selectedFlowId || ''}
                        onChange={(e) => onFlowSelect(e.target.value)}
                    >
                        <option value="" disabled>Select a flow to test...</option>
                        {flows.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>

            <Button
                variant="primary"
                onClick={onRunTest}
                disabled={!selectedFlowId || isRunning}
                className="w-32"
            >
                {isRunning ? (
                    <>
                        <Loader2 size={16} className="mr-2 animate-spin" /> Running
                    </>
                ) : (
                    <>
                        <Play size={16} className="mr-2" /> Run Test
                    </>
                )}
            </Button>
        </div>
    );
}
