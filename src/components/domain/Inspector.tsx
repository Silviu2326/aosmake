import React, { useState, useMemo, useEffect } from 'react';
import { NodeData, NodeVariant, TestCase, NodeVersion } from '../../types';
import { Edge } from 'reactflow';
import { X, Play, Save, Shield, FlaskConical, Plus, Code, Trash2, GitBranch, Copy, CheckCircle2, Sparkles, Maximize2, Download, Loader2, XCircle, AlignLeft, History } from 'lucide-react';
import { getNodeFields } from '../../utils/nodeUtils';
import { VariationGeneratorModal } from '../ui/VariationGeneratorModal';
import { PromptEditorModal } from '../ui/PromptEditorModal';
import { MutationModal } from '../ui/MutationModal';
import { VariableHighlighter } from '../ui/VariableHighlighter';
import { NodeVersionModal } from '../ui/NodeVersionModal';

interface InspectorProps {
    node?: NodeData;
    availableNodes?: NodeData[];
    edges?: Edge[];
    onClose: () => void;
    onNodeUpdate: (id: string, data: Partial<NodeData>) => void;
    onDeleteNode?: (id: string) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ node, availableNodes = [], edges = [], onClose, onNodeUpdate, onDeleteNode }) => {
    const [activeTab, setActiveTab] = useState('config');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [userPrompt, setUserPrompt] = useState('');
    const [jsonSchema, setJsonSchema] = useState('');
    const [model, setModel] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [recency, setRecency] = useState<'month' | 'week' | 'day' | 'hour'>('month');
    const [citations, setCitations] = useState(false);
    const [outputMode, setOutputMode] = useState<'structured' | 'free'>('structured');
    const [isTesting, setIsTesting] = useState(false);
    const [testOutput, setTestOutput] = useState('');
    const [isAiVarModalOpen, setIsAiVarModalOpen] = useState(false);
    const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
    const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

    // Tests state
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [newTestName, setNewTestName] = useState('');
    const [newTestVariableValues, setNewTestVariableValues] = useState<Record<string, string>>({});
    const [isAddingTest, setIsAddingTest] = useState(false);
    const [runningAllTests, setRunningAllTests] = useState(false);

    const variants = node?.variants || [];
    const activeVariantId = node?.activeVariantId || 'master';
    const selectedVariantId = node?.selectedVariantId;

    // Determine node category
    const isLLMNode = ['LLM', 'PERPLEXITY'].includes(node?.type || '');
    const isDataNode = ['JSON', 'JSON_BUILDER', 'CSV_INPUT', 'CSV_OUTPUT'].includes(node?.type || '');
    const isLeadNode = ['LEAD_INPUT', 'LEAD_OUTPUT'].includes(node?.type || '');
    const isFilterNode = node?.type === 'FILTER';
    const isAnymailfinderNode = node?.type === 'ANYMAILFINDER';

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
            setSystemPrompt(activeData.systemPrompt || '');
            setUserPrompt(activeData.userPrompt || '');
            setModel(activeData.model || (node?.type === 'PERPLEXITY' ? 'sonar' : 'gemini-3-pro-preview'));
            setTemperature(activeData.temperature ?? 0.7);
            setRecency(activeData.recency || 'month');
            setCitations(activeData.citations || false);
            setOutputMode(activeData.outputMode || 'structured');

            if (activeVariantId !== 'master') {
                const v = variants.find(v => v.id === activeVariantId);
                if (v?.output) setTestOutput(JSON.stringify(v.output, null, 2));
                else setTestOutput('');
            } else {
                setTestOutput(node?.outputData ? JSON.stringify(node.outputData, null, 2) : '');
            }
        }
    }, [node?.id, node?.schema, activeVariantId, variants, activeData]);

    useEffect(() => {
        if (node?.testCases) {
            setTestCases(node.testCases);
        } else {
            setTestCases([]);
        }
    }, [node?.id, node?.testCases]);

    const saveTestCases = (cases: TestCase[]) => {
        setTestCases(cases);
        onNodeUpdate(node!.id, { testCases: cases });
    };

    const handleAddTest = () => {
        if (!newTestName.trim()) return;
        const newTest: TestCase = {
            id: `test_${Date.now()}`,
            name: newTestName.trim(),
            inputContext: { ...newTestVariableValues },
            status: 'pending'
        };
        saveTestCases([...testCases, newTest]);
        setIsAddingTest(false);
        setNewTestName('');
        setNewTestVariableValues({});
    };

    const handleDeleteTest = (testId: string) => {
        saveTestCases(testCases.filter(t => t.id !== testId));
    };

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
            systemPrompt: systemPrompt,
            userPrompt: userPrompt,
            temperature: temperature
        };
        onNodeUpdate(node.id, {
            variants: [...variants, newVariant],
            activeVariantId: newVariant.id
        });
    };

    const handleDeleteVariant = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newVariants = variants.filter(v => v.id !== id);
        const updates: any = { variants: newVariants, activeVariantId: 'master' };
        if (selectedVariantId === id) {
            updates.selectedVariantId = undefined;
        }
        onNodeUpdate(node.id, updates);
    };

    const handleSelectWinner = () => {
        onNodeUpdate(node.id, { selectedVariantId: activeVariantId });
    };

    const isWinner = selectedVariantId === activeVariantId;

    const handleLabelChange = (value: string) => {
        onNodeUpdate(node.id, { label: value });
    };

    // Tabs based on node type
    const getTabs = () => {
        const tabs = [{ id: 'config', label: 'Config' }];
        if (isLLMNode) {
            tabs.push({ id: 'prompt', label: 'Prompt' });
            tabs.push({ id: 'tests', label: 'Tests' });
        }
        if (isDataNode || node?.outputData) {
            tabs.push({ id: 'output', label: 'Output' });
        }
        return tabs;
    };

    const tabs = getTabs();

    // Ancestor nodes for variables
    const ancestorNodes = useMemo(() => {
        if (!node || !edges.length) return [];
        const ancestors = new Set<string>();
        const queue = [node.id];
        const visited = new Set<string>();
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            if (visited.has(currentId)) continue;
            visited.add(currentId);
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

    const handleAddVariable = (variable: string) => {
        const newValue = userPrompt + ` {{${variable}}}`;
        setUserPrompt(newValue);
        updateActiveData({ userPrompt: newValue });
    };

    // Node Version Management
    const handleCreateVersion = (name: string, description?: string) => {
        const newVersion: NodeVersion = {
            id: `version_${Date.now()}`,
            name,
            description,
            timestamp: new Date().toISOString(),
            label: node.label,
            type: node.type,
            model: node.model,
            systemPrompt: node.systemPrompt,
            userPrompt: node.userPrompt,
            temperature: node.temperature,
            recency: node.recency,
            citations: node.citations,
            schema: node.schema,
            outputMode: node.outputMode,
            json: node.json,
            csv: node.csv,
            csvMappings: node.csvMappings,
            filterCondition: node.filterCondition,
            apiKey: node.apiKey,
            statusFilter: node.statusFilter,
            limit: node.limit,
            updateField: node.updateField,
            customField: node.customField,
            markAsSent: node.markAsSent
        };

        const currentVersions = node.nodeVersions || [];
        onNodeUpdate(node.id, { nodeVersions: [...currentVersions, newVersion] });
    };

    const handleRestoreVersion = (version: NodeVersion) => {
        if (!confirm(`¿Restaurar la versión "${version.name}"? Esto sobrescribirá la configuración actual.`)) {
            return;
        }

        onNodeUpdate(node.id, {
            label: version.label,
            model: version.model,
            systemPrompt: version.systemPrompt,
            userPrompt: version.userPrompt,
            temperature: version.temperature,
            recency: version.recency,
            citations: version.citations,
            schema: version.schema,
            outputMode: version.outputMode,
            json: version.json,
            csv: version.csv,
            csvMappings: version.csvMappings,
            filterCondition: version.filterCondition,
            apiKey: version.apiKey,
            statusFilter: version.statusFilter,
            limit: version.limit,
            updateField: version.updateField,
            customField: version.customField,
            markAsSent: version.markAsSent
        });

        setIsVersionModalOpen(false);
    };

    const handleDeleteVersion = (versionId: string) => {
        const currentVersions = node.nodeVersions || [];
        const updatedVersions = currentVersions.filter(v => v.id !== versionId);
        onNodeUpdate(node.id, { nodeVersions: updatedVersions });
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
                    <button
                        onClick={() => setIsVersionModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs transition-colors"
                        title="Gestionar versiones"
                    >
                        <History size={12} />
                        {(node.nodeVersions?.length || 0) > 0 && (
                            <span className="px-1 text-[10px] bg-blue-500/20 rounded">{node.nodeVersions?.length}</span>
                        )}
                    </button>
                    {isLLMNode && variants.length > 0 && (
                        <button
                            onClick={() => setIsAiVarModalOpen(true)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs transition-colors"
                        >
                            <Sparkles size={12} /> AI Gen
                        </button>
                    )}
                    {isWinner ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                            <CheckCircle2 size={12} /> Winner
                        </div>
                    ) : (
                        <button
                            onClick={handleSelectWinner}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-green-400 text-xs transition-colors"
                        >
                            <CheckCircle2 size={12} /> Select Winner
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Variant Tabs (only for LLM nodes) */}
            {isLLMNode && (
                <div className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] border-b border-border overflow-x-auto">
                    <button
                        onClick={() => onNodeUpdate(node.id, { activeVariantId: 'master' })}
                        className={`flex items-center gap-1 px-3 py-1 rounded-t text-xs font-medium transition-colors border-b-2 ${activeVariantId === 'master'
                            ? 'text-white border-accent bg-white/5'
                            : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                    >
                        <Shield size={10} /> Master
                    </button>
                    {variants.map(v => (
                        <div
                            key={v.id}
                            className={`group relative flex items-center gap-1 px-3 py-1 rounded-t text-xs font-medium transition-colors border-b-2 cursor-pointer ${activeVariantId === v.id
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
                    >
                        <Copy size={12} />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-border bg-surface/50 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[60px] py-2 text-[10px] font-medium uppercase tracking-wider transition-colors relative ${activeTab === tab.id ? 'text-accent' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* CONFIG TAB - Universal */}
                {activeTab === 'config' && (
                    <div className="space-y-4">
                        {/* ANYMAILFINDER Config */}
                        {isAnymailfinderNode && (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-xs text-blue-400 font-semibold">AnymailFinder Configuration</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Verifica emails usando la API de AnymailFinder.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">API Key</label>
                                    <input
                                        type="password"
                                        value={node.apiKey || ''}
                                        onChange={(e) => onNodeUpdate(node.id, { apiKey: e.target.value })}
                                        placeholder="Enter your AnymailFinder API key"
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* LEAD_INPUT Config */}
                        {node.type === 'LEAD_INPUT' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="text-xs text-blue-400 font-semibold">Lead Input Configuration</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Obtiene leads de la base de datos según el estado.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Status Filter</label>
                                    <select
                                        value={node.statusFilter || 'pending_verification'}
                                        onChange={(e) => onNodeUpdate(node.id, { statusFilter: e.target.value as any })}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    >
                                        <option value="pending_verification">Pendientes de Verificación</option>
                                        <option value="pending_compscrap">Pendientes de CompScrap</option>
                                        <option value="pending_box1">Pendientes de Box1</option>
                                        <option value="pending_instantly">Pendientes de Instantly</option>
                                        <option value="all">Todos los leads</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Límite de leads</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={node.limit || 100}
                                        onChange={(e) => onNodeUpdate(node.id, { limit: parseInt(e.target.value) })}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* LEAD_OUTPUT Config */}
                        {node.type === 'LEAD_OUTPUT' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-xs text-green-400 font-semibold">Lead Output Configuration</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Guarda los resultados del procesamiento.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Campo a actualizar</label>
                                    <select
                                        value={node.updateField || ''}
                                        onChange={(e) => onNodeUpdate(node.id, { updateField: e.target.value })}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    >
                                        <option value="">-- Seleccionar campo --</option>
                                        <option value="verification_result">Resultado de verificación</option>
                                        <option value="compscrap_result">Resultado de CompScrap</option>
                                        <option value="box1_result">Resultado de Box1</option>
                                        <option value="custom">Campo personalizado</option>
                                    </select>
                                </div>
                                {node.updateField === 'custom' && (
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Nombre del campo</label>
                                        <input
                                            type="text"
                                            value={node.customField || ''}
                                            onChange={(e) => onNodeUpdate(node.id, { customField: e.target.value })}
                                            placeholder="e.g., email_validation, comp_url"
                                            className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        checked={node.markAsSent || false}
                                        onChange={(e) => onNodeUpdate(node.id, { markAsSent: e.target.checked })}
                                        className="rounded border-white/10 bg-white/5 checked:bg-accent focus:ring-accent"
                                    />
                                    <label className="text-xs text-gray-300">Marcar como enviado al siguiente paso</label>
                                </div>
                            </div>
                        )}

                        {/* JSON Config */}
                        {(node.type === 'JSON' || node.type === 'JSON_BUILDER') && (
                            <div className="space-y-4">
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <span className="text-xs text-yellow-400 font-semibold">JSON Configuration</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Define datos estáticos o plantillas con variables.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">JSON Content</label>
                                    <textarea
                                        className="w-full h-48 bg-[#0d0d0d] border border-border rounded p-3 text-green-400 text-xs font-mono"
                                        value={node.json || ''}
                                        onChange={(e) => onNodeUpdate(node.id, { json: e.target.value })}
                                        placeholder='{"key": "value"}'
                                    />
                                </div>
                            </div>
                        )}

                        {/* CSV Input Config */}
                        {node.type === 'CSV_INPUT' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-emerald-400 font-semibold">CSV Input Configuration</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Carga datos desde un archivo CSV.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">CSV Content</label>
                                    <textarea
                                        className="w-full h-48 bg-[#0d0d0d] border border-border rounded p-3 text-emerald-400 text-xs font-mono"
                                        value={node.csv || ''}
                                        onChange={(e) => onNodeUpdate(node.id, { csv: e.target.value })}
                                        placeholder="column1,column2,column3&#10;value1,value2,value3"
                                    />
                                </div>
                            </div>
                        )}

                        {/* FILTER Config */}
                        {isFilterNode && (
                            <div className="space-y-4">
                                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <span className="text-xs text-orange-400 font-semibold">Filter Configuration</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500">
                                        Bifurca el flujo según condiciones.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Campo a filtrar</label>
                                    <input
                                        type="text"
                                        value={node.filterField || ''}
                                        onChange={(e) => onNodeUpdate(node.id, { filterField: e.target.value })}
                                        placeholder="e.g., nodeId.result.status"
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Condición</label>
                                    <select
                                        value={node.filterCondition?.operator || 'equals'}
                                        onChange={(e) => onNodeUpdate(node.id, { filterCondition: { field: node.filterCondition?.field || '', operator: e.target.value as any, value: node.filterCondition?.value || '' } })}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    >
                                        <option value="equals">Igual a</option>
                                        <option value="not_equals">Diferente de</option>
                                        <option value="contains">Contiene</option>
                                        <option value="greater_than">Mayor que</option>
                                        <option value="less_than">Menor que</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Valor</label>
                                    <input
                                        type="text"
                                        value={node.filterCondition?.value || ''}
                                        onChange={(e) => onNodeUpdate(node.id, { filterCondition: { field: node.filterCondition?.field || '', operator: node.filterCondition?.operator || 'equals', value: e.target.value } })}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* LLM Config (only for LLM nodes when not in variant) */}
                        {isLLMNode && activeVariantId === 'master' && (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Model</label>
                                    <select
                                        value={model}
                                        onChange={(e) => {
                                            setModel(e.target.value);
                                            onNodeUpdate(node.id, { model: e.target.value });
                                        }}
                                        className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                    >
                                        {node.type === 'PERPLEXITY' ? (
                                            <>
                                                <option value="sonar-pro">sonar-pro</option>
                                                <option value="sonar">sonar</option>
                                                <option value="sonar-reasoning">sonar-reasoning</option>
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
                                            <label className="text-xs text-gray-500">Recency</label>
                                            <select
                                                value={recency}
                                                onChange={(e) => {
                                                    setRecency(e.target.value as any);
                                                    onNodeUpdate(node.id, { recency: e.target.value });
                                                }}
                                                className="w-full bg-background border border-border rounded p-2 text-xs text-white"
                                            >
                                                <option value="month">Last Month</option>
                                                <option value="week">Last Week</option>
                                                <option value="day">Last 24 Hours</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={citations}
                                                onChange={(e) => {
                                                    setCitations(e.target.checked);
                                                    onNodeUpdate(node.id, { citations: e.target.checked });
                                                }}
                                                className="rounded border-white/10 bg-white/5 checked:bg-accent"
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
                                            onChange={(e) => {
                                                const temp = parseFloat(e.target.value);
                                                setTemperature(temp);
                                                onNodeUpdate(node.id, { temperature: temp });
                                            }}
                                            className="flex-1 accent-accent h-1 bg-white/10 rounded"
                                        />
                                        <span className="text-xs w-8 text-right font-mono">{temperature}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 flex items-center gap-2">
                                        <Code size={12} /> Output Mode
                                    </label>
                                    <div className="flex bg-black/20 p-1 rounded border border-white/10">
                                        <button
                                            onClick={() => {
                                                setOutputMode('structured');
                                                onNodeUpdate(node.id, { outputMode: 'structured' });
                                            }}
                                            className={`flex-1 py-1.5 rounded text-xs ${outputMode === 'structured' ? 'bg-accent/20 text-accent' : 'text-gray-500'}`}
                                        >
                                            Structured
                                        </button>
                                        <button
                                            onClick={() => {
                                                setOutputMode('free');
                                                onNodeUpdate(node.id, { outputMode: 'free' });
                                            }}
                                            className={`flex-1 py-1.5 rounded text-xs ${outputMode === 'free' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500'}`}
                                        >
                                            Free
                                        </button>
                                    </div>
                                </div>

                                {outputMode === 'structured' && (
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500">Schema (JSON)</label>
                                        <textarea
                                            className="w-full h-32 bg-[#0d0d0d] border border-border rounded p-3 text-green-400 text-xs font-mono"
                                            value={jsonSchema}
                                            onChange={(e) => {
                                                setJsonSchema(e.target.value);
                                                onNodeUpdate(node.id, { schema: e.target.value });
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

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

                {/* PROMPT TAB - Only for LLM nodes */}
                {activeTab === 'prompt' && isLLMNode && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-gray-500 font-semibold">SYSTEM PROMPT</label>
                                <button
                                    onClick={() => setIsPromptEditorOpen(true)}
                                    className="flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded"
                                >
                                    <Maximize2 size={10} /> Expand
                                </button>
                            </div>
                            <div className="h-32 border border-border rounded bg-background">
                                <VariableHighlighter
                                    className="w-full h-full"
                                    value={systemPrompt}
                                    onChange={(e) => {
                                        setSystemPrompt(e.target.value);
                                        updateActiveData({ systemPrompt: e.target.value });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-semibold">USER PROMPT</label>
                            <div className="h-32 border border-border rounded bg-background">
                                <VariableHighlighter
                                    className="w-full h-full"
                                    placeholder="Enter user prompt..."
                                    value={userPrompt}
                                    onChange={(e) => {
                                        setUserPrompt(e.target.value);
                                        updateActiveData({ userPrompt: e.target.value });
                                    }}
                                />
                            </div>
                        </div>

                        {/* Available Variables */}
                        <div className="border border-white/10 rounded bg-white/5 p-3">
                            <div className="text-xs font-semibold text-gray-400 mb-2">Insert Output from Upstream</div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {ancestorNodes.length > 0 ? (
                                    ancestorNodes.map(n => (
                                        <div key={n.id} className="mb-2">
                                            <div className="text-[10px] text-gray-500 mb-1">{n.label}</div>
                                            <div className="flex flex-wrap gap-1">
                                                {getNodeFields(n).map(output => (
                                                    <button
                                                        key={output}
                                                        onClick={() => handleAddVariable(`${n.id}.${output}`)}
                                                        className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-blue-400 hover:bg-blue-500/10"
                                                    >
                                                        <Plus size={8} /> {output}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[10px] text-gray-600 italic">No upstream nodes connected</div>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                setIsTesting(true);
                                try {
                                    const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/run-node', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            node: { ...node, model, systemPrompt, userPrompt, temperature, schema: outputMode === 'structured' ? jsonSchema : undefined, outputMode },
                                            context: {}
                                        })
                                    });
                                    const data = await response.json();
                                    if (data.success) {
                                        setTestOutput(data.output);
                                        setActiveTab('output');
                                    } else {
                                        setTestOutput(`Error: ${data.error}`);
                                    }
                                } catch (error) {
                                    setTestOutput(`Error: ${error}`);
                                } finally {
                                    setIsTesting(false);
                                }
                            }}
                            disabled={isTesting}
                            className={`w-full flex items-center justify-center gap-2 py-2 rounded ${isTesting ? 'bg-white/10 text-gray-500' : 'bg-accent/20 text-accent hover:bg-accent/30'} transition-colors`}
                        >
                            {isTesting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                            {isTesting ? 'Running...' : 'Test Prompt'}
                        </button>
                    </div>
                )}

                {/* TESTS TAB - Only for LLM nodes */}
                {activeTab === 'tests' && isLLMNode && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                                <FlaskConical size={12} /> Test Cases
                                {testCases.length > 0 && (
                                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                                        {testCases.filter(t => t.status === 'passed').length}/{testCases.length}
                                    </span>
                                )}
                            </h4>
                            <button
                                onClick={() => setIsAddingTest(true)}
                                className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded"
                            >
                                <Plus size={10} /> Add
                            </button>
                        </div>

                        {isAddingTest && (
                            <div className="p-3 border border-accent/30 bg-accent/5 rounded space-y-3">
                                <input
                                    type="text"
                                    value={newTestName}
                                    onChange={(e) => setNewTestName(e.target.value)}
                                    placeholder="Test name"
                                    className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAddingTest(false)} className="text-[10px] text-gray-400 px-3 py-1">Cancel</button>
                                    <button onClick={handleAddTest} disabled={!newTestName.trim()} className="text-[10px] bg-accent text-white px-3 py-1 rounded disabled:opacity-50">Create</button>
                                </div>
                            </div>
                        )}

                        {testCases.map((test) => (
                            <div key={test.id} className={`p-2 border rounded ${test.status === 'passed' ? 'border-green-500/30 bg-green-500/10' : test.status === 'failed' ? 'border-red-500/30 bg-red-500/10' : 'border-white/10'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-200 font-medium">{test.name}</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleDeleteTest(test.id)} className="p-1 text-gray-500 hover:text-red-400">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">
                                    {test.status === 'passed' && <span className="text-green-400">✓ Passed</span>}
                                    {test.status === 'failed' && <span className="text-red-400">✗ Failed: {test.lastError}</span>}
                                    {test.status === 'pending' && <span className="text-gray-500">Pending</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* OUTPUT TAB */}
                {activeTab === 'output' && (
                    <div className="h-full flex flex-col min-h-[300px]">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>Output</span>
                        </div>
                        <div className="flex-1 bg-black border border-border rounded p-3 font-mono text-[10px] text-gray-400 overflow-auto whitespace-pre-wrap">
                            {testOutput || node.outputData || 'No output yet'}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-surfaceHighlight flex justify-between items-center">
                <span className="text-xs text-gray-500">{node.type}</span>
                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors">
                    <Save size={12} /> Save
                </button>
            </div>

            <VariationGeneratorModal
                isOpen={isAiVarModalOpen}
                onClose={() => setIsAiVarModalOpen(false)}
                onGenerate={(instructions) => {
                    // Generate variations logic
                }}
            />

            <MutationModal
                isOpen={isMutationModalOpen}
                onClose={() => setIsMutationModalOpen(false)}
                nodes={node ? [node] : []}
                onUpdateNode={(nodeId, newVariants) => onNodeUpdate(nodeId, { variants: newVariants })}
            />

            <PromptEditorModal
                isOpen={isPromptEditorOpen}
                onClose={() => setIsPromptEditorOpen(false)}
                onSave={(sys, user) => {
                    setSystemPrompt(sys);
                    setUserPrompt(user);
                    updateActiveData({ systemPrompt: sys, userPrompt: user });
                }}
                initialSystemPrompt={systemPrompt}
                initialUserPrompt={userPrompt}
                nodeLabel={node.label}
                availableVariables={[]}
            />

            <NodeVersionModal
                isOpen={isVersionModalOpen}
                onClose={() => setIsVersionModalOpen(false)}
                node={node}
                onCreateVersion={handleCreateVersion}
                onRestoreVersion={handleRestoreVersion}
                onDeleteVersion={handleDeleteVersion}
            />
        </div>
    );
};

export default Inspector;
