import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { SandboxHeader } from '../components/sandbox/SandboxHeader';
import { FlowVisualization } from '../components/sandbox/FlowVisualization';
import { InputPanel } from '../components/sandbox/InputPanel';
import { OutputPanel } from '../components/sandbox/OutputPanel';
import { Flow } from '../stores/useAppStore';

// Mock Flows
const MOCK_FLOWS: Flow[] = [
    { id: '1', name: 'Lead Scoring Flow (v2)', status: 'active' },
    { id: '2', name: 'Email Enricher', status: 'draft' },
];

const DEFAULT_JSON = JSON.stringify({
    firstName: "Alice",
    lastName: "Wonderland",
    email: "alice@example.com",
    company: "Wonder Corp"
}, null, 2);

export function SandboxPage() {
    const [selectedFlowId, setSelectedFlowId] = useState<string>();
    const [isRunning, setIsRunning] = useState(false);
    const [inputMode, setInputMode] = useState<'lead' | 'json'>('json');
    const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);

    // Execution State
    const [nodeStatuses, setNodeStatuses] = useState<Record<string, any>>({});
    const [executionSteps, setExecutionSteps] = useState<any[]>([]);

    const handleLeadSelect = (id: string) => {
        // Mock loading lead data into JSON
        setJsonInput(JSON.stringify({
            firstName: "John",
            lastName: "Smith",
            email: "john@acme.com",
            source: "Selected from DB: " + id
        }, null, 2));
        setInputMode('json'); // Switch to view data
    };

    const handleRunTest = async () => {
        setIsRunning(true);
        setExecutionSteps([]);
        setNodeStatuses({});

        // Simulate execution steps
        const sequence = [
            { id: '1', label: 'Start', duration: 100, output: { timestamp: Date.now() } },
            { id: '2', label: 'Lead Analyzer (LLM)', duration: 1500, output: { score: 85, reason: "Strong match" } },
            { id: '3', label: 'Enrichment (API)', duration: 800, output: { enriched: true, role: "CTO" } },
        ];

        for (const step of sequence) {
            setNodeStatuses(prev => ({ ...prev, [step.id]: 'running' }));
            await new Promise(r => setTimeout(r, step.duration));

            setExecutionSteps(prev => [...prev, {
                id: step.id,
                nodeLabel: step.label,
                status: 'success',
                output: step.output,
                duration: step.duration
            }]);
            setNodeStatuses(prev => ({ ...prev, [step.id]: 'success' }));
        }

        setIsRunning(false);
    };

    const selectedFlow = MOCK_FLOWS.find(f => f.id === selectedFlowId) || null;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
            <SandboxHeader
                flows={MOCK_FLOWS}
                selectedFlowId={selectedFlowId}
                onFlowSelect={setSelectedFlowId}
                onRunTest={handleRunTest}
                isRunning={isRunning}
            />

            <div className="flex-1 flex min-h-0">
                {/* Left: Visualization (Flexible) */}
                <div className="flex-1 bg-black/20 relative">
                    <ReactFlowProvider>
                        <FlowVisualization
                            flow={selectedFlow}
                            nodeStatuses={nodeStatuses}
                        />
                    </ReactFlowProvider>
                </div>

                {/* Right: Panels (Fixed Width) */}
                <div className="w-[450px] flex flex-col border-l border-white/10">
                    <div className="h-1/2 min-h-[300px]">
                        <InputPanel
                            mode={inputMode}
                            onModeChange={setInputMode}
                            onLeadSelect={handleLeadSelect}
                            jsonValue={jsonInput}
                            onJsonChange={setJsonInput}
                        />
                    </div>
                    <div className="h-1/2 min-h-[300px] border-t border-white/10">
                        <OutputPanel steps={executionSteps} />
                    </div>
                </div>
            </div>
        </div>
    );
}
