import React from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Flow } from '../../stores/useAppStore';

interface FlowVisualizationProps {
    flow: Flow | null;
    nodeStatuses: Record<string, 'pending' | 'running' | 'success' | 'error'>;
}

// Mock initial nodes if flow is null or has no visual data
const defaultNodes: Node[] = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start' }, type: 'input' },
    { id: '2', position: { x: 100, y: 200 }, data: { label: 'Lead Analyzer (LLM)' } },
    { id: '3', position: { x: 100, y: 300 }, data: { label: 'Enrichment (API)' } },
];
const defaultEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
];

export function FlowVisualization({ flow, nodeStatuses }: FlowVisualizationProps) {
    // In a real app, we would transform flow.nodes/edges to ReactFlow format
    // Here we use static mock for visual structure
    const nodes = defaultNodes.map(n => ({
        ...n,
        style: getNodeStyle(nodeStatuses[n.id])
    }));

    return (
        <div className="h-full w-full bg-background/50">
            <ReactFlow
                nodes={nodes}
                edges={defaultEdges}
                fitView
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#333" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    );
}

function getNodeStyle(status?: string) {
    const baseStyle = { background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '8px', padding: '10px' };
    switch (status) {
        case 'running': return { ...baseStyle, border: '1px solid #3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' };
        case 'success': return { ...baseStyle, border: '1px solid #22c55e' };
        case 'error': return { ...baseStyle, border: '1px solid #ef4444' };
        default: return baseStyle;
    }
}
