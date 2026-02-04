import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { FlowStatusBadge, FlowStatus } from './FlowStatusBadge';
import { Play, Edit, MoreVertical, Copy, Archive } from 'lucide-react';
import { Flow } from '../../stores/useAppStore';

// Extended Flow interface for UI (mocking missing store fields)
export interface UIFlow extends Omit<Flow, 'status'> {
    version: string;
    status: FlowStatus; // Override string type from store
    owner?: string;
    lastRun?: Date;
    successRate?: number;
    description?: string;
}

interface FlowCardProps {
    flow: UIFlow;
    onEdit: (id: string) => void;
    onTest: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
}

export function FlowCard({ flow, onEdit, onTest, onDuplicate, onArchive }: FlowCardProps) {
    return (
        <Card className="hover:border-white/10 transition-colors group">
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div className="space-y-1.5">
                    <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        {flow.name}
                        <span className="text-xs font-normal text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            v{flow.version}
                        </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <FlowStatusBadge status={flow.status} />
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                    <MoreVertical size={16} />
                </Button>
            </CardHeader>

            <CardContent className="pb-4">
                {/* Miniature Placeholder */}
                <div className="w-full h-24 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center relative overflow-hidden mb-4 group-hover:bg-white/5 transition-colors">
                    {/* Simple node visualization mock */}
                    <div className="flex items-center gap-2 opacity-30">
                        <div className="w-6 h-6 rounded bg-gray-600"></div>
                        <div className="w-8 h-0.5 bg-gray-700"></div>
                        <div className="w-6 h-6 rounded bg-accent"></div>
                        <div className="w-8 h-0.5 bg-gray-700"></div>
                        <div className="w-6 h-6 rounded bg-gray-600"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>
                        <div className="text-gray-500">Last Run</div>
                        <div>{flow.lastRun ? flow.lastRun.toLocaleTimeString() : 'Never'}</div>
                    </div>
                    <div>
                        <div className="text-gray-500">Success Rate</div>
                        <div className={flow.successRate && flow.successRate > 90 ? 'text-green-400' : 'text-gray-300'}>
                            {flow.successRate ? `${flow.successRate}%` : '--'}
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-0 gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(flow.id)}>
                    <Edit size={14} className="mr-2" /> Edit
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => onTest(flow.id)}>
                    <Play size={14} className="mr-2" /> Test
                </Button>
            </CardFooter>
        </Card>
    );
}
