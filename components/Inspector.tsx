import React, { useState, useMemo, useEffect } from 'react';
import { NodeData, NodeVariant } from '../types';
import { Edge } from 'reactflow';
import { X, Play, Save, ChevronRight, FileOutput, Shield, FlaskConical, Plus, Code, Trash2, GitBranch, Copy, CheckCircle2, Globe, Sparkles, Maximize2, Download } from 'lucide-react';
import { getNodeFields } from '../utils/nodeUtils';
import { VariationGeneratorModal } from './VariationGeneratorModal';
import { PromptEditorModal } from './PromptEditorModal';

interface InspectorProps {
    node?: NodeData;
    availableNodes?: NodeData[];
    edges?: Edge[];
    onClose: () => void;
    onNodeUpdate: (id: string, data: Partial<NodeData>) => void;
    onDeleteNode?: (id: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ node, availableNodes = [], edges = [], onClose, onNodeUpdate, onDeleteNode }) => {
    const [activeTab, setActiveTab] = useState('prompt');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [jsonSchema, setJsonSchema] = useState('');
    const [model, setModel] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [recency, setRecency] = useState<'month' | 'week' | 'day' | 'hour'>('month');
    const [citations, setCitations] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [testOutput, setTestOutput] = useState('');
    const [isAiVarModalOpen, setIsAiVarModalOpen] = useState(false);
    const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);

    const variants = node?.variants || [];
    const activeVariantId = node?.activeVariantId || 'master';
    const selectedVariantId = node?.selectedVariantId;

    // Get the data for the currently active view (Master or Variant)
    const activeData = useMemo(() => {
        if (!node) return null;
        if (activeVariantId === 'master') return node;
        return variants.find(v => v.id === activeVariantId) || node;
    }, [node, variants, activeVariantId]);

    useEffect(() => {
        if (activeData) {
            const schemaValue = activeData.schema
                ? (typeof activeData.schema === 'object' ? JSON.stringify(activeData.schema, null, 2) : activeData.schema)
                : '{\n  "type": "object",\n  "properties": {\n    "result": { "type": "string" }\n  }\n}';

            setJsonSchema(schemaValue);
            setSystemPrompt(activeData.systemPrompt || (activeVariantId === 'master' ? `You are a specialist agent.\n\nTask: ${node?.label}\n\nContext: Analyze incoming data and transformations.\nOutput strictly JSON or requested format.` : ''));
            setUserPrompt(activeData.userPrompt || '');
            setModel(activeData.model || (node.type === 'PERPLEXITY' ? 'sonar' : 'gemini-3-pro-preview'));
            setTemperature(activeData.temperature ?? 0.7);
            setRecency(activeData.recency || 'month');
            setCitations(activeData.citations || false);

            // If viewing a variant, show its output if available
            if (activeVariantId !== 'master') {
                const v = variants.find(v => v.id === activeVariantId);
                if (v?.output) setTestOutput(JSON.stringify(v.output, null, 2));
                else setTestOutput('');
            } else {
                 setTestOutput(node?.outputData ? JSON.stringify(node.outputData, null, 2) : '');
            }
        }
    }, [node?.id, node?.schema, activeVariantId, variants, activeData]); 

    if (!node || !activeData) return null;

    const updateActiveData = (updates: Partial<NodeData> | Partial<NodeVariant>) => {
        if (activeVariantId === 'master') {
            onNodeUpdate(node.id, updates as Partial<NodeData>);
        } else {
            const newVariants = variants.map(v => 
                v.id === activeVariantId ? { ...v, ...updates } : v
            );
            onNodeUpdate(node.id, { variants: newVariants });
        }
    };

    const handleAddVariant = () => {
        const newVariant: NodeVariant = {
            id: `v_${Date.now()}`,
            label: `Variant ${variants.length + 1}`,
            systemPrompt: systemPrompt, // Clone current view
            userPrompt: userPrompt,
            temperature: temperature
        };
        onNodeUpdate(node.id, { 
            variants: [...variants, newVariant],
            activeVariantId: newVariant.id 
        });
    };

    const handleGenerateAiVariants = async (instructions: string[]) => {
        try {
            const response = await fetch('http://localhost:3001/api/workflows/generate-variations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    node: {
                        systemPrompt,
                        userPrompt,
                        temperature,
                        schema: jsonSchema
                    },
                    instructions 
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.variations) {
                 onNodeUpdate(node.id, { 
                    variants: [...variants, ...data.variations],
                });
            } else {
                console.error('Failed to generate variations:', data.error);
            }
        } catch (error) {
            console.error('Error calling generate variations:', error);
        }
    };

    const handleDeleteVariant = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newVariants = variants.filter(v => v.id !== id);
        
        // If deleting selected variant, clear selection
        const updates: any = { variants: newVariants, activeVariantId: 'master' };
        if (selectedVariantId === id) {
            updates.selectedVariantId = undefined; 
        }

        onNodeUpdate(node.id, updates);
    };

    const handleSelectWinner = () => {
        // If active is Master, we might want to allow selecting it, 
        // but 'selectedVariantId' usually implies a variant from the list. 
        // If we want "Master" to be the winner, we can set selectedVariantId to undefined or 'master'.
        // Based on my implementation in PreCrafterPanel, if !selectedVariantId and variants exist, it pauses.
        // So we MUST set a selectedVariantId to proceed.
        
        // If Master is chosen, we should probably set it to 'master' (and handle it in PreCrafter) OR
        // just treat 'undefined' as Master IF no variants exist. But if variants exist, we need to be explicit.
        
        // Let's use the ID. 'master' isn't a real variant ID in the array, but PreCrafter checks:
        // node.variants.find(v => v.id === node.selectedVariantId)
        // If I set 'master', it won't find it, so it falls back to 'node'.
        // BUT logic was: if (node.selectedVariantId && node.variants) -> check list.
        // So if I set 'master', it won't match, so it uses node.
        
        // However, PreCrafter logic: 
        // if (hasVariants && !node.data.selectedVariantId) -> PAUSE.
        // So 'master' string is truthy, so it won't pause.
        // Then executeNode:
        // if (node.selectedVariantId && node.variants) { find... }
        // It won't find 'master', so it defaults to targetData = node.
        // PERFECT.
        
        onNodeUpdate(node.id, { selectedVariantId: activeVariantId });
    };

    const isWinner = selectedVariantId === activeVariantId;

    const handleTestPrompt = async () => {
        setIsTesting(true);
        // Calculate model explicitly to ensure it's never undefined
        const effectiveModel = model || activeData.model || (node.type === 'PERPLEXITY' ? 'sonar' : 'gemini-3-pro-preview');

        console.log('[Inspector] handleTestPrompt Debug:', {
            nodeId: node?.id,
            nodeType: node?.type,
            modelState: model,
            activeDataModel: activeData?.model,
            effectiveModel
        });

        try {
            const payload = { 
                node: {
                    ...node,
                    id: node.id, // Explicitly ensure ID is present
                    model: effectiveModel, 
                    systemPrompt,
                    userPrompt,
                    temperature,
                    schema: jsonSchema
                },
                debug: {
                    modelState: model,
                    effectiveModel,
                    nodeId: node?.id
                }
            };
            console.log('Sending Test Payload:', payload);
            
            const response = await fetch('http://localhost:3001/api/workflows/run-node', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                setTestOutput(data.output);
                setActiveTab('output');
            } else {
                setTestOutput(`Error: ${data.error}`);
                setActiveTab('output');
            }
        } catch (error) {
            setTestOutput(`Error: ${error}`);
            setActiveTab('output');
        } finally {
            setIsTesting(false);
        }
    };

    const handleSchemaChange = (value: string) => {
        setJsonSchema(value);
        onNodeUpdate(node.id, { schema: value });
    };

    const handleSystemPromptChange = (value: string) => {
        setSystemPrompt(value);
        updateActiveData({ systemPrompt: value });
    };

    const handleUserPromptChange = (value: string) => {
        setUserPrompt(value);
        updateActiveData({ userPrompt: value });
    };

    const handleModelChange = (value: string) => {
        setModel(value);
        updateActiveData({ model: value });
    };

    const handleTemperatureChange = (value: string) => {
        const temp = parseFloat(value);
        setTemperature(temp);
        updateActiveData({ temperature: temp });
    };

    const handleRecencyChange = (value: string) => {
        setRecency(value as any);
        updateActiveData({ recency: value as any });
    };

    const handleCitationsChange = (value: boolean) => {
        setCitations(value);
        updateActiveData({ citations: value });
    };

    const handleLabelChange = (value: string) => {
        onNodeUpdate(node.id, { label: value });
    };

    const tabs = [
        { id: 'prompt', label: 'Prompt' },
        { id: 'rules', label: 'Rules' },
        { id: 'config', label: 'Config' },
        { id: 'tests', label: 'Tests' },
        { id: 'output', label: 'Output' },
    ];

    const handleAddVariable = (variable: string) => {
        const newValue = userPrompt + ` {{${variable}}}`;
        setUserPrompt(newValue);
        updateActiveData({ userPrompt: newValue });
    };

    const handlePromptEditorSave = (newSystemPrompt: string, newUserPrompt: string) => {
        setSystemPrompt(newSystemPrompt);
        setUserPrompt(newUserPrompt);
        
        if (activeVariantId === 'master') {
            onNodeUpdate(node.id, { 
                systemPrompt: newSystemPrompt,
                userPrompt: newUserPrompt
            });
        } else {
            const newVariants = variants.map(v => 
                v.id === activeVariantId ? { ...v, systemPrompt: newSystemPrompt, userPrompt: newUserPrompt } : v
            );
            onNodeUpdate(node.id, { variants: newVariants });
        }
    };

    // Filter nodes to only show ancestors (upstream nodes)
    const ancestorNodes = useMemo(() => {
        if (!node || !edges.length) return [];
        
        const ancestors = new Set<string>();
        const queue = [node.id];
        const visited = new Set<string>();

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            // Find all incoming edges to currentId
            const incomingEdges = edges.filter(e => e.target === currentId);
            
            incomingEdges.forEach(edge => {
                if (!ancestors.has(edge.source)) {
                    ancestors.add(edge.source);
                    queue.push(edge.source);
                }
            });
        }

        return availableNodes.filter(n => ancestors.has(n.id));
    }, [node, edges, availableNodes]);

    // Prepare variables for the modal
    const availableVariables = useMemo(() => {
        return ancestorNodes.map(n => ({
            nodeId: n.id,
            nodeLabel: n.label,
            fields: getNodeFields(n)
        }));
    }, [ancestorNodes]);

    const handleDownloadVariantsJSON = () => {
        if (!variants || variants.length === 0) return;

        const dataToExport = {
            nodeId: node.id,
            nodeLabel: node.label,
            timestamp: new Date().toISOString(),
            variants: variants.map(v => ({
                id: v.id,
                label: v.label,
                systemPrompt: v.systemPrompt,
                userPrompt: v.userPrompt,
                output: v.output
            }))
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${node.label.replace(/\s+/g, '_')}_variants.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="flex flex-col h-full bg-surface text-sm">
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-surfaceHighlight">
                <input 
                    type="text" 
                    value={node.label} 
                    onChange={(e) => handleLabelChange(e.target.value)}
                    className="font-semibold text-white bg-transparent border-none focus:ring-0 focus:outline-none w-full max-w-[200px]"
                />
                
                <div className="flex items-center gap-2">
                     {variants && variants.length > 0 && (
                        <button 
                            onClick={handleDownloadVariantsJSON}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 text-xs transition-colors border border-blue-500/20"
                            title="Download All Variants JSON"
                        >
                            <Download size={12} /> JSONs
                        </button>
                     )}

                     <button 
                        onClick={() => setIsAiVarModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 text-xs transition-colors border border-purple-500/20"
                        title="Generate Variations with AI"
                    >
                        <Sparkles size={12} /> AI Gen
                    </button>

                     {isWinner ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                            <CheckCircle2 size={12} /> Winner
                        </div>
                     ) : (
                        <button 
                            onClick={handleSelectWinner}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-green-400 text-xs transition-colors border border-white/10"
                            title="Select this variant as the winner for execution"
                        >
                            <CheckCircle2 size={12} /> Select Winner
                        </button>
                     )}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Variant Tabs */}
            <div className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] border-b border-border overflow-x-auto">
                <button
                    onClick={() => onNodeUpdate(node.id, { activeVariantId: 'master' })}
                    className={`flex items-center gap-1 px-3 py-1 rounded-t text-xs font-medium transition-colors border-b-2 ${
                        activeVariantId === 'master' 
                        ? 'text-white border-accent bg-white/5' 
                        : 'text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                >
                    <Shield size={10} /> Master
                </button>
                {variants.map(v => (
                    <div 
                        key={v.id} 
                        className={`group relative flex items-center gap-1 px-3 py-1 rounded-t text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                            activeVariantId === v.id 
                            ? 'text-white border-blue-500 bg-blue-500/10' 
                            : 'text-gray-500 border-transparent hover:text-gray-300'
                        }`}
                        onClick={() => onNodeUpdate(node.id, { activeVariantId: v.id })}
                    >
                        <GitBranch size={10} /> 
                        {v.label}
                        {selectedVariantId === v.id && <div className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1 animate-pulse" />}
                        {activeVariantId === v.id && (
                            <button 
                                onClick={(e) => handleDeleteVariant(e, v.id)}
                                className="ml-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                ))}
                <button 
                    onClick={handleAddVariant}
                    className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-green-400 transition-colors ml-1"
                    title="Clone to new variant"
                >
                    <Copy size={12} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-surface/50 overflow-x-auto hide-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[60px] py-2 text-[10px] font-medium uppercase tracking-wider transition-colors relative ${
                            activeTab === tab.id ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeTab === 'prompt' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500 font-semibold block">SYSTEM PROMPT</label>
                                <button 
                                    onClick={() => setIsPromptEditorOpen(true)}
                                    className="flex items-center gap-1 text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded transition-colors"
                                >
                                    <Maximize2 size={10} /> Expand & Edit
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-32 bg-background border border-border rounded p-3 text-gray-300 text-xs font-mono focus:border-accent focus:ring-0 resize-none leading-relaxed"
                                value={systemPrompt}
                                onChange={(e) => handleSystemPromptChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500 font-semibold block">USER PROMPT</label>
                                <span className="text-[10px] text-gray-500">Variables supported</span>
                            </div>
                            <textarea 
                                className="w-full h-32 bg-background border border-border rounded p-3 text-gray-300 text-xs font-mono focus:border-accent focus:ring-0 resize-none leading-relaxed"
                                placeholder="Enter user prompt here..."
                                value={userPrompt}
                                onChange={(e) => handleUserPromptChange(e.target.value)}
                            />
                        </div>

                        {/* Available Variables Section (Ancestors Only) */}
                        <div className="border border-white/10 rounded bg-white/5 p-3">
                             <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                 Insert Output from Upstream Node
                             </div>
                             <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {ancestorNodes.length > 0 ? (
                                    ancestorNodes.map(n => {
                                        const fieldsToShow = getNodeFields(n);
                                        const isJson = (n as any).type === 'JSON';
                                        
                                        return (
                                            <div key={n.id} className="mb-2 last:mb-0">
                                                <div className="text-[10px] text-gray-500 font-medium mb-1 truncate flex justify-between">
                                                    <span>{n.label}</span>
                                                    {isJson ? <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-1 rounded">JSON</span> : <span className="text-[8px] bg-green-500/10 text-green-400 px-1 rounded">Schema</span>}
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {fieldsToShow.map(output => (
                                                        <button 
                                                            key={output}
                                                            onClick={() => handleAddVariable(`${n.id}.${output}`)}
                                                            className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center gap-1"
                                                        >
                                                            <Plus size={8} /> {output}
                                                        </button>
                                                    ))}
                                                    {fieldsToShow.length === 0 && (
                                                         <button 
                                                            onClick={() => handleAddVariable(`${n.id}.output`)}
                                                            className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center gap-1"
                                                        >
                                                            <Plus size={8} /> output
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-[10px] text-gray-600 italic">No upstream nodes connected. Connect a node to access its outputs.</div>
                                )}
                             </div>
                        </div>

                        {/* Structured Output Schema */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-xs text-gray-500 font-semibold flex items-center gap-2">
                                <Code size={12} />
                                Structured Output / Schema (Advanced)
                            </label>
                            <div className="relative">
                                <textarea 
                                    className="w-full h-32 bg-[#0d0d0d] border border-border rounded p-3 text-green-400 text-xs font-mono focus:border-accent focus:ring-0 resize-none leading-relaxed"
                                    value={jsonSchema}
                                    onChange={(e) => handleSchemaChange(e.target.value)}
                                    placeholder='{"type": "object", "properties": {...}}'
                                />
                                <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono">JSON Schema</div>
                            </div>
                        </div>

                         <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                             <span className="text-[10px] text-gray-500">~ 850 tokens total</span>
                             <button 
                                onClick={handleTestPrompt}
                                disabled={isTesting}
                                className={`flex items-center gap-1 text-xs bg-accent/10 hover:bg-accent/20 border border-accent/20 px-3 py-1.5 rounded text-accent transition-colors ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
                             >
                                 {isTesting ? <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <Play size={10} />}
                                 {isTesting ? 'Running...' : 'Test Prompt (v2)'}
                             </button>
                         </div>

                         {onDeleteNode && (
                            <div className="pt-4 mt-2 border-t border-white/5">
                                <button 
                                    onClick={() => onDeleteNode(node.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-xs font-medium"
                                >
                                    <Trash2 size={14} /> Delete Node
                                </button>
                            </div>
                         )}
                    </div>
                )}

                {activeTab === 'rules' && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 mb-2">VALIDATION RULES</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 p-2 rounded border border-white/5">
                                <Shield size={12} className="text-green-500"/>
                                <span>Output must be valid JSON</span>
                            </div>
                             <div className="flex items-center gap-2 text-xs text-gray-300 bg-white/5 p-2 rounded border border-white/5">
                                <Shield size={12} className="text-green-500"/>
                                <span>No PII in error messages</span>
                            </div>
                        </div>
                        <button className="text-xs text-accent hover:underline mt-2">+ Add Rule</button>
                    </div>
                )}
                
                {activeTab === 'config' && (
                    <div className="space-y-4">
                         <div className="space-y-1">
                             <label className="text-xs text-gray-500">Model</label>
                             <select 
                                value={model}
                                onChange={(e) => handleModelChange(e.target.value)}
                                className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                             >
                                 {node.type === 'PERPLEXITY' ? (
                                    <>
                                        <option value="sonar-pro">sonar-pro</option>
                                        <option value="sonar">sonar</option>
                                        <option value="sonar-reasoning">sonar-reasoning</option>
                                        <option value="sonar-reasoning-pro">sonar-reasoning-pro</option>
                                    </>
                                 ) : (
                                    <>
                                        <option value="gemini-3-pro-preview">gemini-3-pro-preview</option>
                                        <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                                    </>
                                 )}
                             </select>
                         </div>
                         
                         {node.type === 'PERPLEXITY' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Recency Filter</label>
                                    <select 
                                        value={recency}
                                        onChange={(e) => handleRecencyChange(e.target.value)}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    >
                                        <option value="month">Last Month</option>
                                        <option value="week">Last Week</option>
                                        <option value="day">Last 24 Hours</option>
                                        <option value="hour">Last Hour</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <input 
                                        type="checkbox" 
                                        checked={citations}
                                        onChange={(e) => handleCitationsChange(e.target.checked)}
                                        className="rounded border-white/10 bg-white/5 checked:bg-accent focus:ring-accent"
                                    />
                                    <label className="text-xs text-gray-300">Return Citations</label>
                                </div>
                            </>
                         )}

                         <div className="space-y-1">
                             <label className="text-xs text-gray-500">Temperature</label>
                             <div className="flex items-center gap-2">
                                 <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1" 
                                    value={temperature}
                                    onChange={(e) => handleTemperatureChange(e.target.value)}
                                    className="flex-1 accent-accent h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                                 />
                                 <span className="text-xs w-8 text-right font-mono">{temperature}</span>
                             </div>
                         </div>
                    </div>
                )}

                {activeTab === 'tests' && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-semibold text-gray-500">UNIT TESTS</h4>
                             <button className="text-[10px] bg-white/10 px-2 py-1 rounded text-white">Run All</button>
                        </div>
                        <div className="p-2 border border-green-500/20 bg-green-500/5 rounded">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"/>
                                <span className="text-xs text-gray-200">Happy Path</span>
                            </div>
                            <div className="text-[10px] text-gray-500">Passed in 40ms</div>
                        </div>
                        <div className="p-2 border border-border bg-white/5 rounded">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-gray-500"/>
                                <span className="text-xs text-gray-200">Edge Case: Empty Input</span>
                            </div>
                            <div className="text-[10px] text-gray-500">Not run yet</div>
                        </div>
                    </div>
                )}

                {activeTab === 'output' && (
                    <div className="h-full flex flex-col min-h-[300px]">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>{(testOutput || node.outputData) ? 'Execution Result' : 'No output yet'}</span>
                            {(testOutput || node.outputData) && <span className="text-green-400">Success</span>}
                        </div>
                        <div className="flex-1 bg-black border border-border rounded p-3 font-mono text-[10px] text-gray-400 overflow-auto whitespace-pre-wrap">
                            {testOutput || node.outputData || 'Run "Test Prompt" to see results here.'}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t border-border bg-surfaceHighlight flex justify-between items-center">
                 <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                     Reset
                 </button>
                 <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors">
                     <Save size={12} /> Save
                 </button>
            </div>
            
            <VariationGeneratorModal 
                isOpen={isAiVarModalOpen} 
                onClose={() => setIsAiVarModalOpen(false)} 
                onGenerate={handleGenerateAiVariants} 
            />
            
            <PromptEditorModal 
                isOpen={isPromptEditorOpen}
                onClose={() => setIsPromptEditorOpen(false)}
                onSave={handlePromptEditorSave}
                initialSystemPrompt={systemPrompt}
                initialUserPrompt={userPrompt}
                nodeLabel={node.label}
                availableVariables={availableVariables}
            />
        </div>
    );
};