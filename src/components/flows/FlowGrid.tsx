import React from 'react';
import { UIFlow, FlowCard } from './FlowCard';

interface FlowGridProps {
    flows: UIFlow[];
    onEdit: (id: string) => void;
    onTest: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
}

export function FlowGrid({ flows, onEdit, onTest, onDuplicate, onArchive }: FlowGridProps) {
    if (flows.length === 0) {
        return (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                <p className="text-gray-400">No flows found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {flows.map(flow => (
                <FlowCard
                    key={flow.id}
                    flow={flow}
                    onEdit={onEdit}
                    onTest={onTest}
                    onDuplicate={onDuplicate}
                    onArchive={onArchive}
                />
            ))}
        </div>
    );
}
