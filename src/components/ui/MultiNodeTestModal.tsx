import React, { useState, useEffect, useMemo } from 'react';
import { X, Play, FlaskConical, ChevronRight, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { NodeData } from '../../types';
import { Edge } from 'reactflow';
import { getNodeFields } from '../../utils/nodeUtils';

interface MultiNodeTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: NodeData[];
    edges: Edge[];
}

interface NodeTestResult {
    nodeId: string;
    status: 'pending' | 'running' | 'success' | 'error';
    output?: any;
    error?: string;
    duration?: number;
}

export const MultiNodeTestModal: React.FC<MultiNodeTestModalProps> = ({
    isOpen,
    onClose,
    nodes,
    edges
}) => {
    const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
    const [inputValues, setInputValues] = useState<Record<string, string>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<Record<string, NodeTestResult>>({});
    const [showResults, setShowResults] = useState(false);

    // Get nodes in topological order (execution order)
    const orderedNodes = useMemo(() => {
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const inDegree = new Map<string, number>();
        const adjacency = new Map<string, string[]>();

        nodes.forEach(n => {
            inDegree.set(n.id, 0);
            adjacency.set(n.id, []);
        });

        edges.forEach(e => {
            const current = inDegree.get(e.target) || 0;
            inDegree.set(e.target, current + 1);
            const adj = adjacency.get(e.source) || [];
            adj.push(e.target);
            adjacency.set(e.source, adj);
        });

        const queue: string[] = [];
        inDegree.forEach((degree, nodeId) => {
            if (degree === 0) queue.push(nodeId);
        });

        const sorted: NodeData[] = [];
        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            const node = nodeMap.get(nodeId);
            if (node) sorted.push(node);

            const neighbors = adjacency.get(nodeId) || [];
            neighbors.forEach(neighbor => {
                const newDegree = (inDegree.get(neighbor) || 1) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0) queue.push(neighbor);
            });
        }

        return sorted;
    }, [nodes, edges]);

    // Get required inputs for selected nodes (variables from unselected upstream nodes)
    const requiredInputs = useMemo(() => {
        const inputs: Array<{ variable: string; displayName: string; nodeLabel: string }> = [];
        const selectedSet = selectedNodeIds;

        selectedNodeIds.forEach(nodeId => {
            const node = nodes.find(n => n.id === nodeId);
            if (!node) return;

            // Extract variables from prompts
            const variableRegex = /\{\{([^}]+)\}\}/g;
            const prompts = `${node.systemPrompt || ''} ${node.userPrompt || ''}`;

            let match;
            while ((match = variableRegex.exec(prompts)) !== null) {
                const variable = match[1].trim();
                const parts = variable.split('.');
                const sourceNodeId = parts[0];

                // Only add if source node is NOT selected (we need to provide this input)
                if (!selectedSet.has(sourceNodeId)) {
                    const sourceNode = nodes.find(n => n.id === sourceNodeId);
                    const field = parts.slice(1).join('.');
                    const displayName = sourceNode ? `${sourceNode.label}.${field}` : variable;

                    // Avoid duplicates
                    if (!inputs.find(i => i.variable === variable)) {
                        inputs.push({
                            variable,
                            displayName,
                            nodeLabel: sourceNode?.label || sourceNodeId
                        });
                    }
                }
            }
        });

        return inputs;
    }, [selectedNodeIds, nodes]);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedNodeIds(new Set());
            setInputValues({});
            setResults({});
            setShowResults(false);
        }
    }, [isOpen]);

    const toggleNodeSelection = (nodeId: string) => {
        const newSelected = new Set(selectedNodeIds);
        if (newSelected.has(nodeId)) {
            newSelected.delete(nodeId);
        } else {
            newSelected.add(nodeId);
        }
        setSelectedNodeIds(newSelected);
    };

    const selectLastN = (n: number) => {
        const lastN = orderedNodes.slice(-n).map(node => node.id);
        setSelectedNodeIds(new Set(lastN));
    };

    const selectAll = () => {
        setSelectedNodeIds(new Set(orderedNodes.map(n => n.id)));
    };

    const selectNone = () => {
        setSelectedNodeIds(new Set());
    };

    const runTests = async () => {
        if (selectedNodeIds.size === 0) return;

        setIsRunning(true);
        setShowResults(true);
        const newResults: Record<string, NodeTestResult> = {};

        // Initialize all selected nodes as pending
        selectedNodeIds.forEach(nodeId => {
            newResults[nodeId] = { nodeId, status: 'pending' };
        });
        setResults({ ...newResults });

        // Build context from input values
        const context: Record<string, any> = {};
        Object.entries(inputValues).forEach(([variable, value]) => {
            // Parse variable path and set in context
            const parts = variable.split('.');
            const nodeId = parts[0];
            const field = parts.slice(1).join('.');

            if (!context[nodeId]) context[nodeId] = {};
            context[nodeId][field] = value;
        });

        // Run nodes in order
        const selectedOrdered = orderedNodes.filter(n => selectedNodeIds.has(n.id));

        for (const node of selectedOrdered) {
            // Update status to running
            newResults[node.id] = { nodeId: node.id, status: 'running' };
            setResults({ ...newResults });

            const startTime = Date.now();

            try {
                // Build node context from previous results and input values
                const nodeContext: Record<string, any> = { ...context };

                // Add results from previously executed nodes
                Object.entries(newResults).forEach(([prevNodeId, result]) => {
                    if (result.status === 'success' && result.output) {
                        nodeContext[prevNodeId] = result.output;
                    }
                });

                const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/run-node', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        node: {
                            ...node,
                            model: node.model || 'gemini-2.0-flash'
                        },
                        context: nodeContext
                    })
                });

                const data = await response.json();
                const duration = Date.now() - startTime;

                if (data.success) {
                    newResults[node.id] = {
                        nodeId: node.id,
                        status: 'success',
                        output: data.output,
                        duration
                    };

                    // Add to context for next nodes
                    context[node.id] = data.output;
                } else {
                    newResults[node.id] = {
                        nodeId: node.id,
                        status: 'error',
                        error: data.error || 'Unknown error',
                        duration
                    };
                }
            } catch (error: any) {
                newResults[node.id] = {
                    nodeId: node.id,
                    status: 'error',
                    error: error.message || 'Network error',
                    duration: Date.now() - startTime
                };
            }

            setResults({ ...newResults });
        }

        setIsRunning(false);
    };

    if (!isOpen) return null;

    const successCount = Object.values(results).filter(r => r.status === 'success').length;
    const errorCount = Object.values(results).filter(r => r.status === 'error').length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[800px] max-h-[85vh] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/20 rounded-lg">
                            <FlaskConical size={18} className="text-accent" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Test de Nodos</h3>
                            <p className="text-[10px] text-gray-500">
                                Selecciona los nodos a testear y proporciona los inputs
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Node Selection */}
                    <div className="w-1/2 border-r border-white/10 flex flex-col">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                Nodos ({selectedNodeIds.size}/{orderedNodes.length} seleccionados)
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => selectLastN(3)}
                                    className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                >
                                    Últimos 3
                                </button>
                                <button
                                    onClick={() => selectLastN(5)}
                                    className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                >
                                    Últimos 5
                                </button>
                                <button
                                    onClick={selectAll}
                                    className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={selectNone}
                                    className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white"
                                >
                                    Ninguno
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {orderedNodes.map((node, index) => {
                                const isSelected = selectedNodeIds.has(node.id);
                                const result = results[node.id];

                                return (
                                    <div
                                        key={node.id}
                                        onClick={() => !isRunning && toggleNodeSelection(node.id)}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-accent/20 border border-accent/30'
                                                : 'bg-white/5 border border-transparent hover:bg-white/10'
                                        } ${isRunning ? 'cursor-not-allowed opacity-70' : ''}`}
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold ${
                                            isSelected ? 'border-accent bg-accent text-black' : 'border-gray-600 text-gray-600'
                                        }`}>
                                            {isSelected ? '✓' : index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-white truncate">{node.label}</div>
                                            <div className="text-[10px] text-gray-500">{node.type}</div>
                                        </div>
                                        {result && (
                                            <div className="flex items-center gap-1">
                                                {result.status === 'running' && (
                                                    <Loader2 size={14} className="text-accent animate-spin" />
                                                )}
                                                {result.status === 'success' && (
                                                    <CheckCircle2 size={14} className="text-green-500" />
                                                )}
                                                {result.status === 'error' && (
                                                    <XCircle size={14} className="text-red-500" />
                                                )}
                                                {result.duration && (
                                                    <span className="text-[9px] text-gray-500">{result.duration}ms</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Panel - Inputs & Results */}
                    <div className="w-1/2 flex flex-col">
                        {!showResults ? (
                            <>
                                <div className="p-3 border-b border-white/5">
                                    <span className="text-xs text-gray-400">
                                        Inputs requeridos ({requiredInputs.length})
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    {requiredInputs.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <AlertCircle size={24} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-xs">
                                                {selectedNodeIds.size === 0
                                                    ? 'Selecciona nodos para ver los inputs requeridos'
                                                    : 'No se requieren inputs externos'}
                                            </p>
                                        </div>
                                    ) : (
                                        requiredInputs.map((input) => (
                                            <div key={input.variable} className="space-y-1">
                                                <label className="text-[10px] text-blue-400 font-mono">
                                                    {input.displayName}
                                                </label>
                                                <textarea
                                                    value={inputValues[input.variable] || ''}
                                                    onChange={(e) => setInputValues(prev => ({
                                                        ...prev,
                                                        [input.variable]: e.target.value
                                                    }))}
                                                    placeholder={`Valor para ${input.displayName}...`}
                                                    className="w-full h-20 bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:border-accent focus:outline-none resize-none"
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Resultados</span>
                                    <div className="flex gap-2 text-[10px]">
                                        <span className="text-green-500">{successCount} OK</span>
                                        <span className="text-red-500">{errorCount} Error</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {orderedNodes
                                        .filter(n => selectedNodeIds.has(n.id))
                                        .map((node) => {
                                            const result = results[node.id];
                                            if (!result) return null;

                                            return (
                                                <details key={node.id} className="group">
                                                    <summary className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                                        result.status === 'success' ? 'bg-green-500/10' :
                                                        result.status === 'error' ? 'bg-red-500/10' :
                                                        'bg-white/5'
                                                    }`}>
                                                        {result.status === 'running' && (
                                                            <Loader2 size={12} className="text-accent animate-spin" />
                                                        )}
                                                        {result.status === 'success' && (
                                                            <CheckCircle2 size={12} className="text-green-500" />
                                                        )}
                                                        {result.status === 'error' && (
                                                            <XCircle size={12} className="text-red-500" />
                                                        )}
                                                        {result.status === 'pending' && (
                                                            <div className="w-3 h-3 rounded-full bg-gray-500" />
                                                        )}
                                                        <span className="text-xs text-white flex-1">{node.label}</span>
                                                        <ChevronRight size={12} className="text-gray-500 group-open:rotate-90 transition-transform" />
                                                    </summary>
                                                    <div className="mt-1 p-2 bg-black/30 rounded text-[10px] font-mono max-h-32 overflow-auto">
                                                        {result.status === 'error' ? (
                                                            <span className="text-red-400">{result.error}</span>
                                                        ) : result.output ? (
                                                            <pre className="text-gray-400 whitespace-pre-wrap">
                                                                {typeof result.output === 'string'
                                                                    ? result.output
                                                                    : JSON.stringify(result.output, null, 2)}
                                                            </pre>
                                                        ) : (
                                                            <span className="text-gray-500">Esperando...</span>
                                                        )}
                                                    </div>
                                                </details>
                                            );
                                        })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                    <div className="text-[10px] text-gray-500">
                        {showResults && !isRunning && (
                            <button
                                onClick={() => setShowResults(false)}
                                className="text-accent hover:underline"
                            >
                                ← Volver a inputs
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={runTests}
                            disabled={selectedNodeIds.size === 0 || isRunning}
                            className="flex items-center gap-2 px-4 py-2 text-xs bg-accent hover:bg-accent/80 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Ejecutando...
                                </>
                            ) : (
                                <>
                                    <Play size={14} />
                                    Ejecutar Test ({selectedNodeIds.size})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
