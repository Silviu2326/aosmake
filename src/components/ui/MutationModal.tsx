import React, { useState, useEffect, useRef } from 'react';
import { X, Dna, FlaskConical, Zap, Activity, Layers, Target, CheckSquare, Square, GitCommit, AlertCircle, Clock, Settings2, ChevronDown, ChevronRight, Microscope, RefreshCcw, ShieldCheck, Trophy, Plus, Trash2, Split, Scale } from 'lucide-react';
import { NodeData, NodeVariant } from '../../types';

interface MutationModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: NodeData[];
    onUpdateNode: (nodeId: string, variants: NodeVariant[]) => void;
}

// --- TIPOS DEL MOTOR GENÉTICO INDUSTRIAL (v5.0) ---

interface TestCase {
    id: string;
    input: string; // JSON
}

type MutationOperator = 'general' | 'add_examples' | 'compress' | 'anti_hallucination' | 'structural_fix';

interface EvolutionConfig {
    selected: boolean;
    objective: string; // Soft Constraints & Goal
    generations: number;
    variations: number;
    testSuite: TestCase[]; // Improvement #1: Suite instead of single input
    operator: MutationOperator; // Improvement #8: Explicit operator
    strategy: 'mutation' | 'crossover';
}

interface TestResult {
    caseId: string;
    passed: boolean;
    score: number; // 0-100
    reasoning: string;
}

interface ScoredVariant extends NodeVariant {
    fitness: {
        total: number;
        quality: number;
        hardPass: number; // 0 or 1 (Schema valid)
        cost: number;
    };
    testResults: TestResult[];
    generation: number;
    parentId?: string;
    status: 'generated' | 'repaired' | 'validated' | 'failed';
    tags?: string[]; // E.g. ["schema_ok", "fast"]
}

// Estructura de Auditoría Visual
interface AuditNode {
    id: string;
    label: string;
    generation: number;
    fitness?: number; // Total Score
    status: 'pending' | 'success' | 'failed' | 'repaired';
    reasoning?: string;
    metrics?: { q: number, c: number }; // Quality, Cost
    timestamp: string;
    children: AuditNode[];
}

interface NodeAuditHistory {
    nodeId: string;
    nodeLabel: string;
    root: AuditNode;
}

export const MutationModal: React.FC<MutationModalProps> = ({ isOpen, onClose, nodes, onUpdateNode }) => {

    // --- STATE ---
    const [configs, setConfigs] = useState<Record<string, EvolutionConfig>>({});
    const [activeTab, setActiveTab] = useState<'config' | 'suite' | 'audit'>('config');

    const [isEvolving, setIsEvolving] = useState(false);
    const [progress, setProgress] = useState(0);
    const [auditHistory, setAuditHistory] = useState<NodeAuditHistory[]>([]);
    const [expandedAuditNodes, setExpandedAuditNodes] = useState<Set<string>>(new Set());

    // --- INITIALIZATION ---
    useEffect(() => {
        if (isOpen) {
            setAuditHistory([]);
            setProgress(0);
            setIsEvolving(false);
            setExpandedAuditNodes(new Set());
            setActiveTab('config');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setConfigs(prev => {
                const newConfigs = { ...prev };
                let hasChanges = false;
                nodes.forEach(n => {
                    if (!newConfigs[n.id]) {
                        newConfigs[n.id] = {
                            selected: false,
                            objective: '',
                            generations: 2,
                            variations: 3,
                            testSuite: [{ id: 'case_1', input: '{\n  "example": "test"\n}' }], // Default suite
                            operator: 'general',
                            strategy: 'mutation'
                        };
                        hasChanges = true;
                    }
                });
                return hasChanges ? newConfigs : prev;
            });
        }
    }, [nodes, isOpen]);

    // --- DERIVED STATE ---
    const selectedIds = Object.keys(configs).filter(id => configs[id]?.selected);

    // --- HELPERS ---
    const updateConfig = (id: string, field: keyof EvolutionConfig, value: any) => {
        setConfigs(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    };

    const toggleSelection = (id: string) => {
        updateConfig(id, 'selected', !configs[id]?.selected);
    };

    const toggleAuditNode = (id: string) => {
        const newSet = new Set(expandedAuditNodes);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedAuditNodes(newSet);
    };

    // Suite Management
    const addTestCase = (nodeId: string) => {
        const currentSuite = configs[nodeId].testSuite;
        updateConfig(nodeId, 'testSuite', [...currentSuite, { id: `case_${currentSuite.length + 1}`, input: '{}' }]);
    };

    const removeTestCase = (nodeId: string, caseId: string) => {
        const currentSuite = configs[nodeId].testSuite;
        if (currentSuite.length <= 1) return; // Keep at least one
        updateConfig(nodeId, 'testSuite', currentSuite.filter(c => c.id !== caseId));
    };

    const updateTestCase = (nodeId: string, caseId: string, value: string) => {
        const currentSuite = configs[nodeId].testSuite;
        updateConfig(nodeId, 'testSuite', currentSuite.map(c => c.id === caseId ? { ...c, input: value } : c));
    };

    // --- API WRAPPERS ---
    const callLLM = async (prompt: string, model = 'gemini-3-pro-preview', temp = 0.7) => {
        const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/run-node', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                node: { type: 'LLM', model, systemPrompt: prompt, userPrompt: 'Process.', temperature: temp },
                context: {}
            })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        return data.output;
    };

    // --- GENETIC ENGINE CORE (v5.0 Industrial) ---

    const runEvolution = async () => {
        if (selectedIds.length === 0) return;

        setIsEvolving(true);
        setProgress(0);
        setActiveTab('audit'); // Auto switch to view progress
        // Init Audit Trees
        const initialHistory: NodeAuditHistory[] = selectedIds.map(nid => {
            const node = nodes.find(n => n.id === nid)!;
            return {
                nodeId: nid,
                nodeLabel: node.label,
                root: {
                    id: 'root', label: 'Master (Baseline)', generation: 0, status: 'success', timestamp: new Date().toLocaleTimeString(), children: [], fitness: 0
                }
            };
        });
        setAuditHistory(initialHistory);

        let totalOperations = 0;
        selectedIds.forEach(id => totalOperations += configs[id].generations * configs[id].variations);
        let completedOperations = 0;

        for (const nodeId of selectedIds) {
            const config = configs[nodeId];
            const targetNode = nodes.find(n => n.id === nodeId)!;

            // Initial Population
            let population: ScoredVariant[] = [{
                id: 'master',
                label: 'Master',
                systemPrompt: targetNode.systemPrompt || '',
                userPrompt: targetNode.userPrompt || '',
                temperature: 0.7,
                fitness: { total: 50, quality: 50, hardPass: 1, cost: 0 },
                testResults: [],
                generation: 0,
                status: 'validated'
            }];

            // GENETIC LOOP
            for (let g = 1; g <= config.generations; g++) {

                // 4) SELECTION: Tournament + Elitism
                // Sort by fitness descending
                population.sort((a, b) => b.fitness.total - a.fitness.total);

                // Elitism: Top 1 guarantees passing
                const elite = population[0];
                const pool = population; // Whole population is available for tournament

                const getParent = () => {
                    // Tournament selection: pick 3 random, choose best
                    const candidates = Array.from({ length: 3 }, () => pool[Math.floor(Math.random() * pool.length)]);
                    return candidates.reduce((best, curr) => (curr.fitness.total > best.fitness.total ? curr : best));
                };

                const newGeneration: ScoredVariant[] = [];

                // BREEDING LOOP
                for (let v = 1; v <= config.variations; v++) {
                    const tempId = `pending_${nodeId}_${g}_${v}`;

                    // Select Parents
                    const parentA = v === 1 ? elite : getParent(); // First child usually comes from elite
                    const parentB = getParent(); // Second parent for crossover

                    updateAuditTree(nodeId, parentA.id === 'master' ? 'root' : parentA.id, {
                        id: tempId, label: `Gen ${g} - Org ${v}`, generation: g, status: 'pending', timestamp: '...', children: []
                    });

                    try {
                        let candidate: ScoredVariant | null = null;

                        // 8) MUTATION OPERATORS
                        const operatorInstruction = {
                            'general': 'Improve the prompt generally to meet the goal.',
                            'add_examples': 'Add distinct few-shot examples to guide the model.',
                            'compress': 'Shorten the prompt while retaining all logic. Remove verbosity.',
                            'anti_hallucination': 'Add constraints to prevent fabrication. Demand evidence.',
                            'structural_fix': 'Focus purely on formatting and JSON structure compliance.'
                        }[config.operator];

                        // 1. BREEDING (Mutation or Crossover)
                        let breedingPrompt = '';

                        if (config.strategy === 'crossover') {
                            // 5) CROSSOVER BY BLOCKS
                            breedingPrompt = `
                            ROLE: Genetic Prompt Engineer.
                            TASK: Perform STRUCTURAL CROSSOVER.
                            
                            PARENT A (Structure/Constraints):
                            ${parentA.systemPrompt?.slice(0, 800)}...
                            
                            PARENT B (Tone/Examples):
                            ${parentB.systemPrompt?.slice(0, 800)}...

                            GOAL: ${config.objective}
                            
                            INSTRUCTION: Create a child prompt. Use A's Rules but B's Examples/Tone.
                            Output JSON: { "label", "systemPrompt", "userPrompt", "reasoning" }`;
                        } else {
                            // Mutation
                            breedingPrompt = `
                            ROLE: Genetic Prompt Engineer.
                            TASK: Apply Operator [${config.operator}] to Parent.
                            PARENT SYSTEM: ${parentA.systemPrompt}
                            PARENT USER: ${parentA.userPrompt}
                            
                            GOAL: ${config.objective}
                            OPERATOR INSTRUCTION: ${operatorInstruction}
                            
                            Output JSON: { "label", "systemPrompt", "userPrompt", "reasoning" }`;
                        }

                        let rawOutput = await callLLM(breedingPrompt, 'gemini-3-pro-preview', 0.9);
                        let parsedData;

                        // 6) HARD GATE & AUTO-REPAIR
                        try {
                            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
                            if (!jsonMatch) throw new Error("No JSON found");
                            parsedData = JSON.parse(jsonMatch[0]);
                        } catch (parseError) {
                            updateAuditTree(nodeId, tempId, { status: 'repaired', reasoning: 'JSON Broken. Auto-Repairing...' });
                            const repairPrompt = `Fix syntax only. Return valid JSON:\n\n${rawOutput}`;
                            const repairedOutput = await callLLM(repairPrompt, 'gemini-2.0-flash-exp', 0.1);
                            const repairMatch = repairedOutput.match(/\{[\s\S]*\}/);
                            if (!repairMatch) throw new Error("Repair Failed");
                            parsedData = JSON.parse(repairMatch[0]);
                        }

                        // Create Candidate
                        const variantId = `evo_g${g}_v${v}_${Date.now()}`;
                        candidate = {
                            id: variantId,
                            label: parsedData.label || `G${g}-V${v}`,
                            systemPrompt: parsedData.systemPrompt,
                            userPrompt: parsedData.userPrompt,
                            temperature: 0.7,
                            generation: g,
                            status: 'generated',
                            fitness: { total: 0, quality: 0, hardPass: 0, cost: 0 },
                            testResults: []
                        };

                        // 3) FITNESS FUNCTION (The Judge)
                        // Run against TEST SUITE (1..N cases)
                        let totalQuality = 0;
                        let allHardConstraintsMet = true;
                        let totalCost = 0;
                        const testResults: TestResult[] = [];

                        if (config.testSuite.length > 0) {
                            for (const testCase of config.testSuite) {
                                if (!testCase.input.trim()) continue;

                                // A. Execute
                                const executionPrompt = `
                                SYSTEM: ${candidate.systemPrompt}
                                USER: ${candidate.userPrompt}
                                DATA INPUT: ${testCase.input}
                                `;
                                const executionResult = await callLLM(executionPrompt, 'gemini-3-pro-preview', 0.1);
                                totalCost += executionResult.length; // Approximate cost

                                // B. Judge (7 - Auditable)
                                const judgePrompt = `
                                ACT AS: Impartial Judge.
                                GOAL: ${config.objective}
                                INPUT: ${testCase.input}
                                OUTPUT: ${executionResult}
                                
                                CHECKLIST:
                                1. Valid JSON/Format? (Hard Constraint)
                                2. Follows user goal? (Soft Quality)
                                
                                Return JSON: { "passed": boolean, "score": number (0-100), "reasoning": "short evidence" }
                                `;
                                const judgeRaw = await callLLM(judgePrompt, 'gemini-2.0-flash-exp', 0.1);
                                const judgeJson = JSON.parse(judgeRaw.match(/\{[\s\S]*\}/)?.[0] || '{}');

                                testResults.push({
                                    caseId: testCase.id,
                                    passed: judgeJson.passed,
                                    score: judgeJson.score,
                                    reasoning: judgeJson.reasoning
                                });

                                totalQuality += judgeJson.score;
                                if (!judgeJson.passed) allHardConstraintsMet = false;
                            }

                            // Calculate Averaged Fitness
                            // Formula: Quality*0.5 + HardPass*0.4 - Cost*0.1
                            const avgQuality = totalQuality / Math.max(1, testResults.length);
                            const hardMultiplier = allHardConstraintsMet ? 1 : 0.1; // Huge penalty for hard fail

                            // Normalization
                            candidate.fitness = {
                                quality: avgQuality,
                                hardPass: allHardConstraintsMet ? 1 : 0,
                                cost: totalCost,
                                total: (avgQuality * 0.6) + (allHardConstraintsMet ? 40 : 0) - (Math.min(totalCost / 1000, 10))
                            };
                            candidate.testResults = testResults;

                            parsedData.reasoning += ` | Avg Score: ${avgQuality.toFixed(1)} | Cases: ${testResults.filter(r => r.passed).length}/${testResults.length}`;
                        } else {
                            // Baseline for no tests
                            candidate.fitness.total = 50;
                            parsedData.reasoning += " (No test suite - Baseline)";
                        }

                        // Add to generation
                        newGeneration.push(candidate);

                        // Success Update
                        updateAuditTree(nodeId, tempId, {
                            id: variantId,
                            label: candidate.label,
                            status: allHardConstraintsMet ? 'success' : 'failed',
                            fitness: candidate.fitness.total,
                            reasoning: parsedData.reasoning,
                            metrics: { q: candidate.fitness.quality, c: candidate.fitness.cost },
                            timestamp: new Date().toLocaleTimeString()
                        }, true);

                    } catch (error) {
                        updateAuditTree(nodeId, tempId, { status: 'failed', reasoning: `${error}` }, true);
                    }

                    completedOperations++;
                    setProgress((completedOperations / totalOperations) * 100);
                }

                // Add successful children to population pool for next generation selection
                // Improvement: Only keep those that passed hard constraints
                population = [...population, ...newGeneration.filter(v => v.fitness.hardPass === 1)];
                // If everyone failed, keep parents + failed children (to avoid crash)
                if (population.length === 0) population = [...pool];
            }

            // Save all generated variants to the real node
            onUpdateNode(nodeId, population.filter(v => v.id !== 'master'));
        }

        setIsEvolving(false);
    };

    // --- TREE UTILS ---
    const updateAuditTree = (nodeId: string, targetId: string, data: Partial<AuditNode>, replace = false) => {
        setAuditHistory(prev => {
            const newHistory = [...prev];
            const nodeHist = newHistory.find(h => h.nodeId === nodeId);
            if (!nodeHist) return prev;

            const traverse = (node: AuditNode): AuditNode => {
                if (!replace && node.id === targetId && data.id) {
                    return { ...node, children: [...node.children, data as AuditNode] };
                }
                if (replace && node.id === targetId) {
                    return { ...node, ...data };
                }
                return { ...node, children: node.children.map(traverse) };
            };

            if (replace) {
                const deepUpdate = (n: AuditNode): AuditNode => {
                    if (n.id === targetId) return { ...n, ...data };
                    return { ...n, children: n.children.map(deepUpdate) };
                };
                nodeHist.root = deepUpdate(nodeHist.root);
            } else {
                nodeHist.root = traverse(nodeHist.root);
            }
            return newHistory;
        });
    };

    const TreeNodeRenderer = ({ node, depth = 0 }: { node: AuditNode, depth?: number }) => {
        const hasChildren = node.children.length > 0;
        const scoreColor = (node.fitness || 0) > 80 ? 'text-green-400' : (node.fitness || 0) > 50 ? 'text-yellow-400' : 'text-red-400';

        return (
            <div className="relative">
                {depth > 0 && <div className="absolute -left-4 top-3 w-4 h-px bg-white/10"></div>}
                {depth > 0 && <div className="absolute -left-4 -top-3 bottom-3 w-px bg-white/10"></div>}

                <div className={`mb-2 group`}>
                    <div
                        className={`flex items-start gap-2 p-2 rounded border transition-all cursor-pointer ${node.status === 'success' ? 'bg-green-900/10 border-green-500/30' :
                            node.status === 'failed' ? 'bg-red-900/10 border-red-500/30' :
                                node.status === 'repaired' ? 'bg-yellow-900/10 border-yellow-500/30' :
                                    node.status === 'pending' ? 'bg-blue-900/10 border-blue-500/30 animate-pulse' :
                                        'bg-white/5 border-white/10'
                            }`}
                        onClick={() => toggleAuditNode(node.id)}
                    >
                        <div className="mt-0.5">
                            {node.status === 'success' && <Trophy size={14} className={scoreColor} />}
                            {node.status === 'failed' && <AlertCircle size={14} className="text-red-400" />}
                            {node.status === 'repaired' && <RefreshCcw size={14} className="text-yellow-400" />}
                            {node.status === 'pending' && <Clock size={14} className="text-blue-400 animate-spin" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold text-gray-200">{node.label}</span>
                                {node.fitness !== undefined && (
                                    <span className={`text-[10px] font-bold font-mono ${scoreColor}`}>
                                        FIT: {node.fitness.toFixed(0)}
                                    </span>
                                )}
                            </div>

                            {/* Chips de Métricas (Improvement #9) */}
                            {node.metrics && (
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[9px] bg-white/10 px-1 rounded text-gray-400">Qual: {node.metrics.q}</span>
                                    <span className="text-[9px] bg-white/10 px-1 rounded text-gray-400">Cost: {node.metrics.c}</span>
                                </div>
                            )}

                            {node.reasoning && expandedAuditNodes.has(node.id) && (
                                <div className="mt-2 text-[10px] text-gray-400 italic border-l-2 border-white/10 pl-2 bg-black/20 p-1 rounded">
                                    "{node.reasoning}"
                                </div>
                            )}
                        </div>
                        {hasChildren && <ChevronRight size={14} className={`text-gray-600 ${expandedAuditNodes.has(node.id) ? 'rotate-90' : ''}`} />}
                    </div>
                    {hasChildren && (expandedAuditNodes.has(node.id) || depth < 1) && (
                        <div className="ml-4 pl-4 border-l border-white/5 mt-2">
                            {node.children.map(child => <TreeNodeRenderer key={child.id} node={child} depth={depth + 1} />)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    const selectedCount = Object.values(configs).filter(c => c?.selected).length;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#09090b] border border-green-500/30 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.15)] w-[1200px] h-[800px] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-14 flex items-center justify-between px-6 border-b border-green-500/20 bg-green-950/20">
                    <div className="flex items-center gap-3">
                        <Microscope size={20} className="text-green-400" />
                        <h3 className="font-bold text-white text-base tracking-widest">
                            BIO-LAB <span className="text-[10px] text-green-500 font-mono border border-green-500/30 px-1 rounded bg-green-500/10">v5.0 INDUSTRIAL</span>
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-green-500/50 hover:text-green-400"><X size={20} /></button>
                </div>

                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT: Config & Harness */}
                    <div className="w-[450px] flex flex-col border-r border-green-500/10 bg-[#0c0c0e]">
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('config')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'config' ? 'bg-white/5 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Settings2 size={12} className="inline mr-2" /> Subjects
                            </button>
                            <button
                                onClick={() => setActiveTab('suite')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'suite' ? 'bg-white/5 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-white'}`}
                            >
                                <ShieldCheck size={12} className="inline mr-2" /> Test Suite
                            </button>
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'audit' ? 'bg-white/5 text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Activity size={12} className="inline mr-2" /> Live
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {/* CONFIG TAB */}
                            {activeTab === 'config' && nodes.map(n => {
                                const cfg = configs[n.id];
                                if (!cfg) return null;

                                return (
                                    <div key={n.id} className={`border rounded-lg overflow-hidden transition-all ${cfg.selected ? 'bg-green-500/5 border-green-500/30' : 'bg-[#050505] border-white/10 opacity-70'}`}>
                                        <div onClick={() => toggleSelection(n.id)} className="flex items-center gap-3 p-3 cursor-pointer select-none">
                                            {cfg.selected ? <CheckSquare size={16} className="text-green-500" /> : <Square size={16} className="text-gray-600" />}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-gray-200 truncate">{n.label}</div>
                                                <div className="text-[10px] text-gray-600 font-mono">{n.type}</div>
                                            </div>
                                            {cfg.selected && <ChevronDown size={14} className="text-green-500/50" />}
                                        </div>

                                        {cfg.selected && (
                                            <div className="p-3 pt-0 space-y-3 border-t border-green-500/10">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] text-green-400 uppercase font-bold flex items-center gap-1">Objective (Soft Constraints)</label>
                                                    <textarea
                                                        value={cfg.objective} onChange={(e) => updateConfig(n.id, 'objective', e.target.value)}
                                                        placeholder="e.g. Be sarcastic but helpful..."
                                                        className="w-full h-16 bg-black/40 border border-green-500/20 rounded p-2 text-[10px] text-gray-300 focus:border-green-500 focus:outline-none resize-none"
                                                    />
                                                </div>

                                                {/* Mutation Operator (Improvement #8) */}
                                                <div>
                                                    <label className="text-[9px] text-green-400 uppercase font-bold">Operator</label>
                                                    <select
                                                        value={cfg.operator}
                                                        onChange={(e) => updateConfig(n.id, 'operator', e.target.value)}
                                                        className="w-full bg-black/40 border border-green-500/20 rounded p-1 text-xs text-white focus:outline-none"
                                                    >
                                                        <option value="general">General Optimization</option>
                                                        <option value="add_examples">Add Few-Shot Examples</option>
                                                        <option value="compress">Compress / Shorten</option>
                                                        <option value="anti_hallucination">Anti-Hallucination Guardrails</option>
                                                        <option value="structural_fix">Fix JSON/Structure Only</option>
                                                    </select>
                                                </div>

                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-green-400 uppercase font-bold">Gens</label>
                                                        <input type="number" min="1" max="5" value={cfg.generations} onChange={(e) => updateConfig(n.id, 'generations', parseInt(e.target.value))} className="w-full bg-black/40 border border-green-500/20 rounded p-1 text-center text-xs text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="text-[9px] text-green-400 uppercase font-bold">Vars</label>
                                                        <input type="number" min="1" max="5" value={cfg.variations} onChange={(e) => updateConfig(n.id, 'variations', parseInt(e.target.value))} className="w-full bg-black/40 border border-green-500/20 rounded p-1 text-center text-xs text-white" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] text-green-400 uppercase font-bold">Strategy</label>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <label className="flex items-center gap-1 text-[10px] text-gray-300">
                                                            <input type="radio" checked={cfg.strategy === 'mutation'} onChange={() => updateConfig(n.id, 'strategy', 'mutation')} className="accent-green-500" /> Mutation
                                                        </label>
                                                        <label className="flex items-center gap-1 text-[10px] text-gray-300">
                                                            <input type="radio" checked={cfg.strategy === 'crossover'} onChange={() => updateConfig(n.id, 'strategy', 'crossover')} className="accent-green-500" /> Crossover
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* TEST SUITE TAB (Improvement #1) */}
                            {activeTab === 'suite' && selectedIds.length > 0 && selectedIds.map(id => {
                                const n = nodes.find(x => x.id === id);
                                const cfg = configs[id];
                                if (!n || !cfg) return null;

                                return (
                                    <div key={id} className="border border-green-500/30 rounded-lg p-3 bg-green-500/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Target size={14} className="text-green-500" />
                                                <span className="text-xs font-bold text-white">{n.label} Suite</span>
                                            </div>
                                            <button onClick={() => addTestCase(id)} className="text-[10px] flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded text-green-400 hover:bg-green-500/30">
                                                <Plus size={10} /> Add Case
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-2">
                                            {cfg.testSuite.map((testCase, idx) => (
                                                <div key={testCase.id} className="relative group">
                                                    <textarea
                                                        value={testCase.input}
                                                        onChange={(e) => updateTestCase(id, testCase.id, e.target.value)}
                                                        className="w-full h-16 bg-black/50 border border-white/10 rounded p-2 text-[10px] font-mono text-green-200 focus:border-green-500 focus:outline-none"
                                                        placeholder={`Test Case ${idx + 1} JSON`}
                                                    />
                                                    {cfg.testSuite.length > 1 && (
                                                        <button
                                                            onClick={() => removeTestCase(id, testCase.id)}
                                                            className="absolute top-1 right-1 p-1 bg-red-500/20 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {activeTab === 'suite' && selectedIds.length === 0 && (
                                <div className="text-center text-gray-600 text-xs py-10">Select subjects in Config tab first.</div>
                            )}

                            {/* AUDIT TAB (Live view) */}
                            {activeTab === 'audit' && (
                                <div className="text-center text-gray-500 text-xs py-10">
                                    <div className="mb-2">Run evolution to see live audit tree here or check the right panel.</div>
                                </div>
                            )}
                        </div>

                        {/* Execute */}
                        <div className="p-4 border-t border-green-500/10 bg-green-950/10">
                            <button
                                onClick={runEvolution}
                                disabled={selectedIds.length === 0 || isEvolving}
                                className="w-full py-3 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isEvolving ? <><Clock size={14} className="animate-spin" /> Evolving...</> : <><Zap size={14} className="fill-white" /> Initiate Evolution</>}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Audit Tree */}
                    <div className="flex-1 bg-[#050505] flex flex-col min-w-0 relative">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                        <div className="h-10 flex items-center justify-between px-4 border-b border-white/10 bg-white/5 z-10">
                            <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                <Activity size={14} className={isEvolving ? "text-green-500 animate-pulse" : "text-gray-600"} />
                                <span>LIVE TELEMETRY</span>
                            </div>
                            <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-300 shadow-[0_0_10px_#22c55e]" style={{ width: `${progress}%` }} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar z-10">
                            {auditHistory.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                                    <Layers size={48} className="opacity-20" />
                                    <p className="text-xs font-mono text-gray-600">Genetic sequence ready...</p>
                                </div>
                            ) : (
                                auditHistory.map(history => (
                                    <div key={history.nodeId} className="animate-[slideUp_0.3s_ease-out]">
                                        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-white/10">
                                            <div className="bg-green-500/10 p-1.5 rounded text-green-500"><Dna size={16} /></div>
                                            <div>
                                                <div className="text-sm font-bold text-white tracking-wide">{history.nodeLabel}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">ID: {history.nodeId}</div>
                                            </div>
                                        </div>
                                        <div className="pl-4 border-l border-white/5 ml-2">
                                            <TreeNodeRenderer node={history.root} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};