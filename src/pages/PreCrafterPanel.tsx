import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';
import { NodeGraph } from '../components/domain/NodeGraph';
import { NodeData, NodeStatus, NodeVariant, FilterCondition } from '../types';
import { Inspector } from '../components/domain/Inspector';
import { AddNodeModal } from '../components/ui/AddNodeModal';
import { useConsole } from '../context/ConsoleContext';
import { JsonEditorModal } from '../components/ui/JsonEditorModal';
import { CsvInputModal } from '../components/ui/CsvEditorModal';
import { CsvOutputModal } from '../components/ui/CsvOutputModal';
import { FilterConfigModal } from '../components/ui/FilterConfigModal';
import { MultiNodeTestModal } from '../components/ui/MultiNodeTestModal';
import { ApiConfigModal } from '../components/ui/ApiConfigModal';
import { getNodeFields, parseCsvHeaders } from '../utils/nodeUtils';
import { AgentPopup } from '../components/global/AgentPopup';
import { Play, Copy, GitBranch, Search, Maximize2, Plus, Save, RotateCcw, Bot, Upload, Download, Layout, History, BoxSelect, Snowflake, Gift, Bell, Star, PartyPopper, Music, Heart, Zap, Cloud, Moon, DollarSign, Coins, Wallet, TrendingUp, Diamond, Briefcase, Dna, Trash2, FlaskConical, Settings, Variable, BookOpen } from 'lucide-react';
import { VersionHistoryModal } from '../components/ui/VersionHistoryModal';
import dagre from 'dagre';
import { useOnSelectionChange } from 'reactflow';
import { MutationModal } from '../components/ui/MutationModal';
import { RunConfigModal } from '../components/ui/RunConfigModal';
import { WorkflowVariablesModal } from '../components/ui/WorkflowVariablesModal';
import { WorkflowInputModal } from '../components/ui/WorkflowInputModal';
import { DocumentationModal } from '../components/ui/DocumentationModal';

const API_URL = 'https://backendaos-production.up.railway.app/api/workflows/precrafter';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 150;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        if (node.type === 'group') return; // Skip groups in auto-layout for now or handle them specifically
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        if (node.type === 'group') return node;
        const nodeWithPosition = dagreGraph.node(node.id);

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        return {
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Initial Nodes mapped to React Flow format (Fallback)
const INITIAL_NODES: Node[] = [];

const INITIAL_EDGES: Edge[] = [];

export const PreCrafterPanel: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]); // Track multiple selection
    const [isChristmasMode, setIsChristmasMode] = useState(false);
    const [isMoneyMode, setIsMoneyMode] = useState(false);
    const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
    const [isCsvInputModalOpen, setIsCsvInputModalOpen] = useState(false);
    const [isCsvOutputModalOpen, setIsCsvOutputModalOpen] = useState(false);
    const [isFilterConfigOpen, setIsFilterConfigOpen] = useState(false);
    const [isMultiTestOpen, setIsMultiTestOpen] = useState(false);
    const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
    const [isAgentOpen, setIsAgentOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isRunConfigOpen, setIsRunConfigOpen] = useState(false);
    const [isWorkflowVariablesOpen, setIsWorkflowVariablesOpen] = useState(false);
    const [isWorkflowInputOpen, setIsWorkflowInputOpen] = useState(false);
    const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [executionResults, setExecutionResults] = useState<Record<string, any>>({});
    const [contextMenu, setContextMenu] = useState<{ id: string; top: number; left: number } | null>(null);
    const [workflowVariables, setWorkflowVariables] = useState<any[]>([]);
    const [agentInitialMessage, setAgentInitialMessage] = useState<string>('');

    // Search functionality
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);

    // Command Palette
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [filteredCommands, setFilteredCommands] = useState<any[]>([]);
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const commandInputRef = useRef<HTMLInputElement>(null);

    // Helper component to handle selection inside ReactFlow context
    const SelectionListener = ({ onChange }: { onChange: (ids: string[]) => void }) => {
        useOnSelectionChange({
            onChange: ({ nodes }) => {
                onChange(nodes.map(n => n.id));
            },
        });
        return null;
    };

    const handleGroupNodes = () => {
        if (selectedNodes.length < 2) return;

        const nodesToGroup = nodes.filter(n => selectedNodes.includes(n.id) && n.type !== 'group' && !n.parentNode);
        if (nodesToGroup.length === 0) return;

        // Calculate Bounding Box
        const padding = 40;
        const minX = Math.min(...nodesToGroup.map(n => n.position.x));
        const minY = Math.min(...nodesToGroup.map(n => n.position.y));
        const maxX = Math.max(...nodesToGroup.map(n => n.position.x + (n.width || 250)));
        const maxY = Math.max(...nodesToGroup.map(n => n.position.y + (n.height || 150)));

        const groupNodeId = `group_${Date.now()}`;

        const groupNode: Node = {
            id: groupNodeId,
            type: 'group',
            position: { x: minX - padding, y: minY - padding },
            style: { width: (maxX - minX) + padding * 2, height: (maxY - minY) + padding * 2 },
            data: { label: 'New Group' },
        };

        const updatedChildren = nodesToGroup.map(node => ({
            ...node,
            parentNode: groupNodeId,
            extent: 'parent', // Optional: keeps child inside group
            position: {
                x: node.position.x - (minX - padding),
                y: node.position.y - (minY - padding),
            }
        }));

        const otherNodes = nodes.filter(n => !selectedNodes.includes(n.id));

        // Add group node BEFORE children so it renders behind (or handle via z-index in node)
        setNodes([...otherNodes, groupNode, ...updatedChildren]);
        setSelectedNodes([]); // Clear selection
    };

    const onLayout = useCallback((direction: string) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        );

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
    }, [nodes, edges, setNodes, setEdges]);

    // Execution State
    const [isRunning, setIsRunning] = useState(false);
    const [waitingNodeId, setWaitingNodeId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [executionQueue, setExecutionQueue] = useState<string[]>([]);
    const dependencyState = useRef<{
        incomingEdges: Record<string, number>;
        outgoingEdges: Record<string, string[]>;
        results: Record<string, any>;
        csvRows?: any[];
        csvRowIndex?: number;
        isBatchMode?: boolean;
    }>({ incomingEdges: {}, outgoingEdges: {}, results: {} });

    const { addLog, clearLogs, setExecutionContext } = useConsole();

    // Ref to store the add node function to avoid infinite loops
    const addNodeFromFilterRef = useRef<(filterNodeId: string, outputType: 'true' | 'false') => void>(null!);

    // Function to add node from filter output
    addNodeFromFilterRef.current = (filterNodeId: string, outputType: 'true' | 'false') => {
        const filterNode = nodes.find(n => n.id === filterNodeId);
        if (!filterNode) return;

        const newNodeId = `node_${Date.now()}`;
        const offsetY = outputType === 'true' ? -60 : 60;

        const newNode: Node = {
            id: newNodeId,
            type: 'custom',
            position: {
                x: filterNode.position.x + 280,
                y: filterNode.position.y + offsetY
            },
            data: {
                label: outputType === 'true' ? 'Si cumple' : 'Si no cumple',
                type: 'LLM',
                status: NodeStatus.IDLE,
                inputs: ['input'],
                outputs: ['output'],
                isChristmas: isChristmasMode,
                isMoney: isMoneyMode
            }
        };

        const newEdge: Edge = {
            id: `e-${filterNodeId}-${outputType}-${newNodeId}`,
            source: filterNodeId,
            sourceHandle: outputType,
            target: newNodeId,
            animated: true,
            style: { stroke: outputType === 'true' ? '#22c55e' : '#ef4444' }
        };

        setNodes(nds => [...nds, newNode]);
        setEdges(eds => [...eds, newEdge]);
        setSelectedNodeId(newNodeId);
    };

    // Stable callback that uses the ref
    const handleAddNodeFromFilter = useCallback((filterNodeId: string, outputType: 'true' | 'false') => {
        addNodeFromFilterRef.current?.(filterNodeId, outputType);
    }, []);

    // Theme Mode Propagator
    useEffect(() => {
        setNodes((nds) => nds.map((n) => ({
            ...n,
            data: {
                ...n.data,
                isChristmas: isChristmasMode,
                isMoney: isMoneyMode
            }
        })));
    }, [isChristmasMode, isMoneyMode, setNodes]);

    // Compute nodes with filter connection data and search highlights for rendering
    const nodesWithFilterData = useMemo(() => {
        return nodes.map((n) => {
            const isSearchResult = searchResults.includes(n.id);
            const isCurrentSearchResult = searchResults[currentSearchIndex] === n.id;

            // Base node with search highlighting
            const nodeWithSearch = {
                ...n,
                data: {
                    ...n.data,
                    isSearchResult,
                    isCurrentSearchResult
                },
                // Add visual emphasis for search results
                style: {
                    ...n.style,
                    ...(isCurrentSearchResult && {
                        boxShadow: '0 0 0 2px #a855f7, 0 0 20px rgba(168, 85, 247, 0.3)',
                    }),
                    ...(isSearchResult && !isCurrentSearchResult && {
                        boxShadow: '0 0 0 1px #a855f7',
                    })
                }
            };

            // Add filter-specific data
            if (n.data.type === 'FILTER') {
                const hasTrueConnection = edges.some(e => e.source === n.id && e.sourceHandle === 'true');
                const hasFalseConnection = edges.some(e => e.source === n.id && e.sourceHandle === 'false');

                return {
                    ...nodeWithSearch,
                    data: {
                        ...nodeWithSearch.data,
                        hasTrueConnection,
                        hasFalseConnection,
                        onAddNode: handleAddNodeFromFilter
                    }
                };
            }

            return nodeWithSearch;
        });
    }, [nodes, edges, handleAddNodeFromFilter, searchResults, currentSearchIndex]);

    const handleExport = () => {
        const scenario = { nodes, edges };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenario, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "precrafter_scenario.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                if (data.nodes && Array.isArray(data.nodes)) {
                    setNodes(data.nodes);
                    setEdges(data.edges || []);
                    addLog({ nodeId: 'system', nodeLabel: 'System', status: 'success', message: 'Scenario imported successfully.' });
                } else {
                    addLog({ nodeId: 'system', nodeLabel: 'System', status: 'error', message: 'Invalid scenario file format.' });
                }
            } catch (error) {
                console.error("Error importing file:", error);
                addLog({ nodeId: 'system', nodeLabel: 'System', status: 'error', message: 'Failed to parse JSON file.' });
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset
    };

    // Sync execution results to ConsoleContext for ChatIA
    useEffect(() => {
        if (!setExecutionContext) return;

        const contextItems = nodes
            .map(n => ({
                id: n.id,
                label: n.data.label,
                data: executionResults[n.id],
                fields: getNodeFields({ id: n.id, ...n.data } as NodeData),
                status: n.data.status,
                inputs: {
                    systemPrompt: n.data.systemPrompt,
                    userPrompt: n.data.userPrompt
                }
            }));
        setExecutionContext(contextItems);
    }, [executionResults, nodes, setExecutionContext]);

    // Update edges with data flow for DataPeek
    useEffect(() => {
        if (Object.keys(executionResults).length === 0) return;

        setEdges((currentEdges) =>
            currentEdges.map((edge) => {
                const sourceResult = executionResults[edge.source];
                // Extract output from result (support both old and new format)
                const sourceOutput = sourceResult?.output || sourceResult;
                // Update edge data if source has output and it's different/new
                if (sourceOutput !== undefined && edge.data?.output !== sourceOutput) {
                    return {
                        ...edge,
                        data: { ...edge.data, output: sourceOutput }
                    };
                }
                return edge;
            })
        );
    }, [executionResults, setEdges]);

    // Search functionality - Filter nodes based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            setCurrentSearchIndex(0);
            return;
        }

        const query = searchQuery.toLowerCase();
        const matchingNodes = nodes
            .filter(n => {
                const label = (n.data.label || '').toLowerCase();
                const type = (n.data.type || '').toLowerCase();
                const id = n.id.toLowerCase();
                return label.includes(query) || type.includes(query) || id.includes(query);
            })
            .map(n => n.id);

        setSearchResults(matchingNodes);
        setShowSearchDropdown(matchingNodes.length > 0);
        setCurrentSearchIndex(0);

        // Highlight first result
        if (matchingNodes.length > 0) {
            setSelectedNodeId(matchingNodes[0]);
        }
    }, [searchQuery, nodes]);

    // Navigate through search results
    const navigateSearchResults = useCallback((direction: 'next' | 'prev') => {
        if (searchResults.length === 0) return;

        let newIndex = currentSearchIndex;
        if (direction === 'next') {
            newIndex = (currentSearchIndex + 1) % searchResults.length;
        } else {
            newIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
        }

        setCurrentSearchIndex(newIndex);
        setSelectedNodeId(searchResults[newIndex]);
    }, [searchResults, currentSearchIndex]);

    // Keyboard shortcut for search (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
            }

            // Enter to navigate to next result when search is focused
            if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
                e.preventDefault();
                navigateSearchResults(e.shiftKey ? 'prev' : 'next');
            }

            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigateSearchResults]);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
                setShowSearchDropdown(false);
            }
        };

        if (showSearchDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSearchDropdown]);

    // Command Palette - Define available commands
    const commands = useMemo(() => [
        { id: 'add-llm', label: 'Add LLM Node', icon: Plus, action: () => { setIsAddModalOpen(true); setIsCommandPaletteOpen(false); }, category: 'Nodes' },
        { id: 'add-filter', label: 'Add Filter Node', icon: GitBranch, action: () => { confirmAddNode('', '', 'Filter', 'FILTER'); setIsCommandPaletteOpen(false); }, category: 'Nodes' },
        { id: 'add-json', label: 'Add JSON Node', icon: Plus, action: () => { confirmAddNode('', '', 'JSON', 'JSON'); setIsCommandPaletteOpen(false); }, category: 'Nodes' },
        { id: 'add-csv-input', label: 'Add CSV Input Node', icon: Plus, action: () => { confirmAddNode('', '', 'CSV Input', 'CSV_INPUT'); setIsCommandPaletteOpen(false); }, category: 'Nodes' },
        { id: 'run-workflow', label: 'Run Workflow', icon: Play, action: () => { setIsRunConfigOpen(true); setIsCommandPaletteOpen(false); }, category: 'Actions', shortcut: 'Cmd+Enter' },
        { id: 'test-nodes', label: 'Test Nodes', icon: FlaskConical, action: () => { setIsMultiTestOpen(true); setIsCommandPaletteOpen(false); }, category: 'Actions' },
        { id: 'save-workflow', label: 'Save Workflow', icon: Save, action: () => { saveWorkflow(); setIsCommandPaletteOpen(false); }, category: 'Actions', shortcut: 'Cmd+S' },
        { id: 'workflow-documentation', label: 'Document Workflow', icon: BookOpen, action: () => { setIsDocumentationOpen(true); setIsCommandPaletteOpen(false); }, category: 'Tools' },
        { id: 'workflow-variables', label: 'Configure Workflow Variables', icon: Variable, action: () => { setIsWorkflowVariablesOpen(true); setIsCommandPaletteOpen(false); }, category: 'Tools' },
        { id: 'export-json', label: 'Export to JSON', icon: Download, action: () => { handleExport(); setIsCommandPaletteOpen(false); }, category: 'File' },
        { id: 'import-json', label: 'Import from JSON', icon: Upload, action: () => { fileInputRef.current?.click(); setIsCommandPaletteOpen(false); }, category: 'File' },
        { id: 'layout-horizontal', label: 'Auto Layout (Horizontal)', icon: Layout, action: () => { onLayout('LR'); setIsCommandPaletteOpen(false); }, category: 'Layout' },
        { id: 'layout-vertical', label: 'Auto Layout (Vertical)', icon: Layout, action: () => { onLayout('TB'); setIsCommandPaletteOpen(false); }, category: 'Layout' },
        { id: 'group-nodes', label: 'Group Selected Nodes', icon: BoxSelect, action: () => { handleGroupNodes(); setIsCommandPaletteOpen(false); }, category: 'Layout' },
        { id: 'open-agent', label: 'Open AI Agent', icon: Bot, action: () => { setIsAgentOpen(true); setIsCommandPaletteOpen(false); }, category: 'Tools' },
        { id: 'open-history', label: 'Version History', icon: History, action: () => { setIsHistoryOpen(true); setIsCommandPaletteOpen(false); }, category: 'Tools' },
        { id: 'clone-workflow', label: 'Clone Workflow', icon: GitBranch, action: () => { handleClone(); setIsCommandPaletteOpen(false); }, category: 'Tools' },
        { id: 'api-config', label: 'API Configuration', icon: Settings, action: () => { setIsApiConfigOpen(true); setIsCommandPaletteOpen(false); }, category: 'Settings' },
    ], []);

    // Filter commands based on query
    useEffect(() => {
        if (!commandQuery.trim()) {
            setFilteredCommands(commands);
            setSelectedCommandIndex(0);
            return;
        }

        const query = commandQuery.toLowerCase();
        const matches = commands.filter(cmd => {
            const labelMatch = cmd.label.toLowerCase().includes(query);
            const categoryMatch = cmd.category.toLowerCase().includes(query);
            return labelMatch || categoryMatch;
        });

        setFilteredCommands(matches);
        setSelectedCommandIndex(0);
    }, [commandQuery, commands]);

    // Command Palette keyboard shortcuts
    useEffect(() => {
        const handleCommandPaletteKeys = (e: KeyboardEvent) => {
            // Cmd+Shift+P or Cmd+P to open command palette
            if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || (e.shiftKey && e.key === 'P'))) {
                e.preventDefault();
                setIsCommandPaletteOpen(true);
                setCommandQuery('');
                setTimeout(() => commandInputRef.current?.focus(), 100);
            }

            if (!isCommandPaletteOpen) return;

            // Navigate commands
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedCommandIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedCommandIndex(prev => prev === 0 ? filteredCommands.length - 1 : prev - 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedCommandIndex]) {
                    filteredCommands[selectedCommandIndex].action();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsCommandPaletteOpen(false);
                setCommandQuery('');
            }
        };

        window.addEventListener('keydown', handleCommandPaletteKeys);
        return () => window.removeEventListener('keydown', handleCommandPaletteKeys);
    }, [isCommandPaletteOpen, filteredCommands, selectedCommandIndex]);

    // Global keyboard shortcuts for node operations
    useEffect(() => {
        const handleGlobalShortcuts = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Cmd+D to duplicate selected node
            if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedNodeId) {
                e.preventDefault();
                handleDuplicateNode(selectedNodeId);
            }

            // Delete or Backspace to delete selected node
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
                e.preventDefault();
                handleDeleteNode(selectedNodeId);
            }

            // Cmd+S to save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveWorkflow();
            }

            // Cmd+Enter to run workflow
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!isRunning) {
                    setIsRunConfigOpen(true);
                }
            }
        };

        window.addEventListener('keydown', handleGlobalShortcuts);
        return () => window.removeEventListener('keydown', handleGlobalShortcuts);
    }, [selectedNodeId, isRunning]);

    // Helper for frontend substitution for logs
    const replaceVariables = (text: string, ctx: Record<string, string>) => {
        if (!text) return '';
        return text.replace(/{{([\w\.-]+)}}/g, (match, variable) => {
            const parts = variable.split('.');
            const nodeId = parts[0];
            const property = parts.slice(1).join('.');

            if (ctx && ctx[nodeId]) {
                const nodeOutput = ctx[nodeId];
                if (property) {
                    try {
                        const parsed = JSON.parse(nodeOutput);
                        const val = property.split('.').reduce((o, i) => (o ? o[i] : undefined), parsed);

                        if (val !== undefined) {
                            return typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
                        }
                        return match;
                    } catch (e) {
                        if (property === 'output') return nodeOutput;
                        return match;
                    }
                }
                return nodeOutput;
            }
            return match;
        });
    };

    const executeNode = async (node: any, context: Record<string, string>, logDescription?: string) => {
        // Check which variant to run (selected or master/default)
        let targetData = node;
        if (node.selectedVariantId && node.variants) {
            const v = node.variants.find(v => v.id === node.selectedVariantId);
            if (v) targetData = { ...node, ...v };
        }

        const logSystemPrompt = replaceVariables(targetData.systemPrompt || '', context);
        const logUserPrompt = replaceVariables(targetData.userPrompt || '', context);

        const msg = logDescription || `Executing ${node.selectedVariantId ? 'Variant: ' + node.selectedVariantId : 'Master'}...`;

        addLog({
            nodeId: node.id,
            nodeLabel: node.label,
            status: 'running',
            message: msg,
            input: `System: ${logSystemPrompt}\n\nUser: ${logUserPrompt}`
        });

        // Handle AnymailFinder nodes
        if (targetData.type === 'ANYMAILFINDER') {
            const domain = replaceVariables(targetData.systemPrompt || '', context);
            const company = replaceVariables(targetData.userPrompt || '', context);
            
            const response = await fetch('https://backendaos-production.up.railway.app/api/anymailfinder/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: domain || undefined,
                    company: company || undefined
                })
            });
            return await response.json();
        }

        const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/run-node', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                node: {
                    ...targetData,
                    systemPrompt: targetData.systemPrompt,
                    userPrompt: targetData.userPrompt,
                    temperature: targetData.temperature,
                    schema: targetData.schema
                },
                context
            })
        });
        return await response.json();
    };

    const processQueue = async () => {
        if (executionQueue.length === 0) {
            setIsRunning(false);
            addLog({ nodeId: 'system', nodeLabel: 'System', status: 'info', message: 'Workflow execution finished.' });

            // Save Run
            try {
                await fetch('https://backendaos-production.up.railway.app/api/workflows/precrafter/runs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'success',
                        startTime: startTime,
                        endTime: new Date().toISOString(),
                        results: executionResults,
                        version: 0 // Ideally we get this from loaded version
                    })
                });
            } catch (e) { console.error('Failed to save run', e); }

            return;
        }

        const nodeId = executionQueue[0];
        const node = nodes.find(n => n.id === nodeId);

        if (!node) {
            setExecutionQueue(prev => prev.slice(1));
            return;
        }

        // 1. CHECK FOR VARIANTS & PAUSE CONDITION
        const hasVariants = node.data.variants && node.data.variants.length > 0;
        if (hasVariants && !node.data.selectedVariantId) {
            // Determine which variants to run (all of them)
            // We pause here.
            setIsRunning(false);
            setWaitingNodeId(nodeId);
            setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.WAITING } } : n));

            addLog({
                nodeId: node.id,
                nodeLabel: node.data.label,
                status: 'waiting',
                message: 'Multiple variants detected. Running Master + Variants. Please compare outputs and select a winner.',
                variants: node.data.variants
            });

            const updateVariantResult = (variantId: string, result: any, status: 'success' | 'error') => {
                const normalizedStatus = status === 'success' ? NodeStatus.SUCCESS : NodeStatus.ERROR;
                setNodes(nds => nds.map(n => {
                    if (n.id === nodeId) {
                        if (variantId === 'master') {
                            return { ...n, data: { ...n.data, outputData: result, status: NodeStatus.WAITING } };
                        } else {
                            const updatedVariants = n.data.variants?.map((v: NodeVariant) =>
                                v.id === variantId ? { ...v, output: result, status: normalizedStatus } : v
                            );
                            return { ...n, data: { ...n.data, variants: updatedVariants } };
                        }
                    }
                    return n;
                }));
            };

            const variants = node.data.variants || [];

            // 1. Execute Master
            const { status: _status, ...nodeDataWithoutStatus } = node.data as any;
            const masterData = { ...nodeDataWithoutStatus, id: node.id, status: NodeStatus.IDLE } as any;
            const masterPromise = executeNode(masterData, dependencyState.current.results, "Executing Master Configuration...")
                .then(res => {
                    updateVariantResult('master', res.output, res.success ? ('success' as any) : ('error' as any));
                    return res;
                })
                .catch(() => updateVariantResult('master', null, 'error' as any));

            // 2. Execute Variants
            const { status: _status2, ...nodeDataWithoutStatus2 } = node.data as any;
            const variantPromises = variants.map(v =>
                executeNode({ ...nodeDataWithoutStatus2, ...v, id: node.id, status: NodeStatus.IDLE } as any, dependencyState.current.results, `Executing ${v.label}...`)
                    .then(res => {
                        updateVariantResult(v.id, res.output, res.success ? ('success' as any) : ('error' as any));
                        return res;
                    })
                    .catch(() => updateVariantResult(v.id, null, 'error' as any))
            );

            Promise.all([masterPromise, ...variantPromises]).then(() => {
                addLog({ nodeId: node.id, nodeLabel: node.data.label, status: 'info', message: 'All variants executed. Please select a winner in the Inspector.' });
            });

            setExecutionQueue(prev => prev.slice(1));
            return;
        }

        // 2. STANDARD EXECUTION (No variants or Winner selected)
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.RUNNING } } : n));

        try {
            const { status, ...nodeDataForExec } = node.data as any;
            const data = await executeNode({ ...nodeDataForExec, status: NodeStatus.IDLE } as any, dependencyState.current.results);

            if (data.success) {
                // Store both input and output for comprehensive run tracking
                const resultData = {
                    input: data.input || {},
                    output: data.output
                };
                dependencyState.current.results[nodeId] = resultData;
                setExecutionResults(prev => ({ ...prev, [nodeId]: resultData }));
                setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.SUCCESS, outputData: data.output } } : n));
                addLog({ nodeId: node.id, nodeLabel: node.data.label, status: 'success', message: 'Completed successfully.', output: data.output });

                // Add neighbors
                const nextNodes: string[] = [];
                dependencyState.current.outgoingEdges[nodeId].forEach(targetId => {
                    dependencyState.current.incomingEdges[targetId]--;
                    if (dependencyState.current.incomingEdges[targetId] === 0) {
                        nextNodes.push(targetId);
                    }
                });
                setExecutionQueue(prev => [...prev.slice(1), ...nextNodes]); // Shift current, append next
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error(`Error executing node ${nodeId}:`, error);
            setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.ERROR } } : n));
            addLog({ nodeId: node.id, nodeLabel: node.data.label, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
            setIsRunning(false); // Stop on error
        }
    };

    // Effect loop for execution
    useEffect(() => {
        if (isRunning && !waitingNodeId) {
            processQueue();
        }
    }, [isRunning, executionQueue, waitingNodeId]);


    // Helper to parse CSV content into rows
    const parseCsvRows = (csvContent: string): any[] => {
        if (!csvContent || !csvContent.trim()) return [];
        
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return [];
        
        const headers = parseCsvHeaders(csvContent);
        const rows: any[] = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const row: any = {};
            let currentCell = '';
            let inQuotes = false;
            let colIndex = 0;
            
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                const nextChar = line[j + 1];
                
                if (inQuotes) {
                    if (char === '"') {
                        if (nextChar === '"') {
                            currentCell += '"';
                            j++;
                        } else {
                            inQuotes = false;
                        }
                    } else {
                        currentCell += char;
                    }
                } else {
                    if (char === '"') {
                        inQuotes = true;
                    } else if (char === ',') {
                        row[headers[colIndex] || `col_${colIndex}`] = currentCell.trim();
                        currentCell = '';
                        colIndex++;
                    } else {
                        currentCell += char;
                    }
                }
            }
            // Don't forget the last cell
            row[headers[colIndex] || `col_${colIndex}`] = currentCell.trim();
            rows.push(row);
        }
        
        return rows;
    };

    const startExecutionWithVariables = async (variableValues: Record<string, string> = {}) => {
        clearLogs();

        // Add workflow variables to the dependency context
        dependencyState.current.results = { ...variableValues };

        // 1. Reset Status
        setNodes((nds) => nds.map(n => ({
            ...n,
            data: { ...n.data, status: NodeStatus.IDLE, selectedVariantId: undefined }
        })));
        setExecutionResults({});
        setWaitingNodeId(null);

        // 2. Find CSV Input node and parse rows
        const csvInputNode = nodes.find(n => n.data.type === 'CSV_INPUT');
        let csvRows: any[] = [];
        let csvRowIndex = 0;
        
        if (csvInputNode && csvInputNode.data.csv) {
            csvRows = parseCsvRows(csvInputNode.data.csv);
            addLog({ 
                nodeId: 'system', 
                nodeLabel: 'System', 
                status: 'info', 
                message: `CSV Input detected: ${csvRows.length} rows found. Will process each row individually.` 
            });
        }

        // 3. Build Dependency Graph
        const incoming: Record<string, number> = {};
        const outgoing: Record<string, string[]> = {};

        nodes.forEach(n => {
            incoming[n.id] = 0;
            outgoing[n.id] = [];
        });

        edges.forEach(e => {
            if (incoming[e.target] !== undefined) incoming[e.target]++;
            if (outgoing[e.source]) outgoing[e.source].push(e.target);
        });

        dependencyState.current = {
            incomingEdges: incoming,
            outgoingEdges: outgoing,
            results: {},
            csvRows,
            csvRowIndex: 0,
            isBatchMode: csvRows.length > 0
        };

        // 4. Find Start Nodes
        const initialQueue = nodes.filter(n => incoming[n.id] === 0).map(n => n.id);

        if (initialQueue.length === 0 && nodes.length > 0) {
            addLog({ nodeId: 'system', nodeLabel: 'System', status: 'error', message: 'Cycle detected or no start node found.' });
            return;
        }

        setExecutionQueue(initialQueue);
        setIsRunning(true);
        setStartTime(new Date().toISOString());
    };

    const startExecution = () => {
        // If workflow variables are defined, open input modal first
        if (workflowVariables.length > 0) {
            setIsWorkflowInputOpen(true);
        } else {
            // Execute directly without variables
            startExecutionWithVariables({});
        }
    };

    // Load workflow from backend on mount
    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                const response = await fetch(API_URL);
                if (response.ok) {
                    const data = await response.json();
                    if (data.nodes) { // Accept empty array
                        setNodes(data.nodes);
                        setEdges(data.edges || []);
                    }
                }
            } catch (error) {
                console.error('Failed to load workflow:', error);
            } finally {
                setIsLoaded(true);
            }
        };
        fetchWorkflow();
    }, [setNodes, setEdges]);

    const saveWorkflow = async (label?: string) => {
        setIsSaving(true);
        try {
            const body: any = { nodes, edges };
            if (label) body.label = label;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setLastSaved(new Date().toLocaleTimeString());
                addLog({ nodeId: 'system', nodeLabel: 'System', status: 'success', message: label ? `Version cloned: ${label}` : 'Workflow saved.' });
            }
        } catch (error) {
            console.error('Failed to save workflow:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClone = () => {
        const label = prompt("Enter a name for this cloned version:");
        if (label) {
            saveWorkflow(label);
        }
    };

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setContextMenu(null); // Close context menu on click
        setSelectedNodeId(node.id);
        if (node.data.type === 'JSON' || node.data.type === 'JSON_BUILDER') {
            setIsJsonModalOpen(true);
        } else if (node.data.type === 'CSV_INPUT') {
            setIsCsvInputModalOpen(true);
        } else if (node.data.type === 'CSV_OUTPUT') {
            setIsCsvOutputModalOpen(true);
        } else if (node.data.type === 'FILTER') {
            setIsFilterConfigOpen(true);
        }
    }, []);

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
        event.preventDefault();
        setContextMenu({
            id: node.id,
            top: event.clientY,
            left: event.clientX,
        });
    }, []);

    const closeContextMenu = useCallback(() => setContextMenu(null), []);

    const confirmAddNode = (sourceId: string, targetId: string, label: string, type: string) => {
        const newNodeId = `node_${Date.now()}`;
        let position = { x: 100, y: 100 };

        // Logic to calculate position based on selection
        if (sourceId && targetId) {
            // Inserting between two nodes
            const sourceNode = nodes.find(n => n.id === sourceId);
            const targetNode = nodes.find(n => n.id === targetId);
            if (sourceNode && targetNode) {
                position = {
                    x: sourceNode.position.x, // Keep vertical alignment usually
                    y: (sourceNode.position.y + targetNode.position.y) / 2
                };

                // Remove direct edge between source and target if it exists
                setEdges(eds => eds.filter(e => !(e.source === sourceId && e.target === targetId)));

                // Add new edges
                setEdges(eds => [
                    ...eds,
                    { id: `e-${sourceId}-${newNodeId}`, source: sourceId, target: newNodeId, animated: true, style: { stroke: '#06b6d4' } },
                    { id: `e-${newNodeId}-${targetId}`, source: newNodeId, target: targetId, animated: true, style: { stroke: '#06b6d4' } }
                ]);
            }
        } else if (sourceId) {
            // Appending after source
            const sourceNode = nodes.find(n => n.id === sourceId);
            if (sourceNode) {
                position = { x: sourceNode.position.x, y: sourceNode.position.y + 170 };
                setEdges(eds => [...eds, { id: `e-${sourceId}-${newNodeId}`, source: sourceId, target: newNodeId, animated: true, style: { stroke: '#06b6d4' } }]);
            }
        } else if (targetId) {
            // Placing before target
            const targetNode = nodes.find(n => n.id === targetId);
            if (targetNode) {
                position = { x: targetNode.position.x, y: targetNode.position.y - 170 };
                setEdges(eds => [...eds, { id: `e-${newNodeId}-${targetId}`, source: newNodeId, target: targetId, animated: true, style: { stroke: '#06b6d4' } }]);
            }
        }

        const defaultJson = type === 'JSON_BUILDER'
            ? '{\n  "newField": "{{previousNode.field}}"\n}'
            : '{\n  "key": "value"\n}';

        const defaultCsv = 'name,email,age\nJohn Doe,john@example.com,30\nJane Smith,jane@example.com,25';

        const newNode: Node = {
            id: newNodeId,
            type: type === 'FILTER' ? 'filter' : 'custom',
            position,
            data: {
                label: label || 'New Processor',
                type: type || 'LLM',
                status: NodeStatus.IDLE,
                inputs: ['input'],
                outputs: type === 'FILTER' ? ['true', 'false'] : ['output'],
                json: (type === 'JSON' || type === 'JSON_BUILDER') ? defaultJson : undefined,
                csv: type === 'CSV_INPUT' ? defaultCsv : undefined,
                csvMappings: type === 'CSV_OUTPUT' ? [] : undefined,
                filterCondition: type === 'FILTER' ? undefined : undefined
            }
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedNodeId(newNodeId);
        if (type === 'JSON' || type === 'JSON_BUILDER') {
            setIsJsonModalOpen(true);
        } else if (type === 'CSV_INPUT') {
            setIsCsvInputModalOpen(true);
        } else if (type === 'CSV_OUTPUT') {
            setIsCsvOutputModalOpen(true);
        } else if (type === 'FILTER') {
            setIsFilterConfigOpen(true);
        }
    };

    const getSelectedNodeData = (): NodeData | undefined => {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (!node) return undefined;
        return {
            id: node.id,
            x: node.position.x,
            y: node.position.y,
            ...node.data
        } as NodeData;
    };

    const getAllNodesData = (): NodeData[] => {
        return nodes.map(node => ({
            id: node.id,
            x: node.position.x,
            y: node.position.y,
            ...node.data
        } as NodeData));
    };

    const getAvailableVariables = () => {
        if (!selectedNodeId) return [];

        const ancestors = new Set<string>();
        const queue = [selectedNodeId];
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

        const ancestorNodes = nodes.filter(n => ancestors.has(n.id));

        return ancestorNodes.map(node => ({
            nodeId: node.id,
            nodeLabel: node.data.label,
            nodeType: node.data.type,
            fields: getNodeFields({ id: node.id, ...node.data } as NodeData)
        }));
    };

    const handleNodeUpdate = (id: string, data: Partial<NodeData>) => {
        // If waiting for this node and selection is made, resume
        if (id === waitingNodeId && data.selectedVariantId) {
            addLog({ nodeId: id, nodeLabel: 'System', status: 'info', message: 'Variant selected. Resuming...' });
            setWaitingNodeId(null);
            setExecutionQueue(prev => [id, ...prev]); // Put it back at the HEAD of queue to be processed again (now with selection)
            setIsRunning(true);
        }

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...data,
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleDuplicateNode = (id: string) => {
        const nodeToDuplicate = nodes.find(n => n.id === id);
        if (!nodeToDuplicate) return;

        const newNodeId = `node_${Date.now()}`;
        const newNode: Node = {
            ...nodeToDuplicate,
            id: newNodeId,
            position: {
                x: nodeToDuplicate.position.x + 30,
                y: nodeToDuplicate.position.y + 30
            },
            data: {
                ...nodeToDuplicate.data,
                label: `${nodeToDuplicate.data.label} (Copy)`,
                status: NodeStatus.IDLE,
                outputData: undefined,
                selectedVariantId: undefined
            }
        };

        setNodes(nds => [...nds, newNode]);
        setSelectedNodeId(newNodeId);
        setContextMenu(null);
        addLog({ nodeId: 'system', nodeLabel: 'System', status: 'info', message: `Node duplicated: ${nodeToDuplicate.data.label}` });
    };

    const handleDeleteNode = (id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        if (selectedNodeId === id) {
            setSelectedNodeId(undefined);
        }
        setContextMenu(null);
    };

    const handleSaveDocumentation = (nodeId: string, documentation: string) => {
        setNodes((nds) => nds.map(node => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        documentation
                    }
                };
            }
            return node;
        }));

        addLog({
            nodeId: 'system',
            nodeLabel: 'System',
            status: 'success',
            message: `Documentación actualizada para: ${nodes.find(n => n.id === nodeId)?.data.label}`
        });
    };

    const handleGenerateDocumentationWithAI = () => {
        setIsDocumentationOpen(false);

        const aiPrompt = `📚 GENERACIÓN AUTOMÁTICA DE DOCUMENTACIÓN

Por favor, analiza cada nodo del workflow y genera documentación clara y concisa para cada uno.

Para cada nodo, incluye:
1. **Propósito**: Qué hace este nodo en el contexto del workflow
2. **Input esperado**: Qué información recibe (variables, datos de nodos anteriores)
3. **Output generado**: Qué produce y cómo se usa en nodos posteriores
4. **Función en el flujo**: Cómo contribuye al objetivo general del workflow

IMPORTANTE:
- Genera documentación en español
- Sé conciso pero informativo (2-4 oraciones por nodo)
- Usa lenguaje claro y profesional
- Menciona las variables que usa el nodo si es relevante
- Describe el papel del nodo en el contexto del flujo completo

Actualiza el campo 'documentation' de cada nodo con la descripción generada.`;

        setAgentInitialMessage(aiPrompt);

        setTimeout(() => {
            setIsAgentOpen(true);
            addLog({
                nodeId: 'system',
                nodeLabel: 'System',
                status: 'info',
                message: 'Generando documentación automática con IA...'
            });
        }, 300);
    };

    const handleApplyActions = (actions: any[]) => {
        const tempIdMap: Record<string, string> = {};

        actions.forEach(action => {
            if (action.type === 'createNode') {
                const { id: tempId, label, type, x, y, systemPrompt, userPrompt, schema, ...otherData } = action.payload;
                const realId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

                if (tempId) {
                    tempIdMap[tempId] = realId;
                }

                // Normalize schema to string if it comes as object
                const normalizedSchema = schema && typeof schema === 'object'
                    ? JSON.stringify(schema)
                    : schema;

                const newNode: Node = {
                    id: realId,
                    type: 'custom',
                    position: { x: x || 100, y: y || 100 },
                    data: {
                        label: label || 'New Node',
                        type: type || 'LLM',
                        status: NodeStatus.IDLE,
                        inputs: ['input'],
                        outputs: ['output'],
                        systemPrompt,
                        userPrompt,
                        schema: normalizedSchema,
                        ...otherData
                    }
                };
                setNodes(nds => [...nds, newNode]);
            } else if (action.type === 'updateNode') {
                const { id, data } = action.payload;
                const realId = tempIdMap[id] || id;
                // Normalize schema to string if it comes as object
                const normalizedData = { ...data };
                if (normalizedData.schema && typeof normalizedData.schema === 'object') {
                    normalizedData.schema = JSON.stringify(normalizedData.schema);
                }
                setNodes(nds => nds.map(n => n.id === realId ? { ...n, data: { ...n.data, ...normalizedData } } : n));
            } else if (action.type === 'deleteNode') {
                const { id } = action.payload;
                const realId = tempIdMap[id] || id;
                setNodes(nds => nds.filter(n => n.id !== realId));
                setEdges(eds => eds.filter(e => e.source !== realId && e.target !== realId));
            } else if (action.type === 'createEdge') {
                const { source, target } = action.payload;
                const realSource = tempIdMap[source] || source;
                const realTarget = tempIdMap[target] || target;

                if (realSource && realTarget) {
                    setEdges(eds => addEdge({ source: realSource, target: realTarget, id: `e-${realSource}-${realTarget}` }, eds));
                }
            }
        });
    };

    const handleUpdateNode = (id: string, newVariants: NodeVariant[]) => {
        setNodes((nds) => nds.map((n) => {
            if (n.id === id) {
                // Automatically select the last generated variant (the most evolved one)
                const lastVariantId = newVariants.length > 0 ? newVariants[newVariants.length - 1].id : undefined;
                return {
                    ...n,
                    data: {
                        ...n.data,
                        variants: newVariants,
                        selectedVariantId: lastVariantId // Auto-switch to latest evolution
                    }
                };
            }
            return n;
        }));
        addLog({ nodeId: 'system', nodeLabel: 'Bio-Lab', status: 'success', message: 'Evolution sequence integration complete.' });
    };

    return (
        <div className="flex flex-col h-full bg-[#0D0D0D]">
            {/* Panel Header */}
            {/* Premium Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md sticky top-0 z-20 shadow-md">

                {/* Left: Brand & Status */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white tracking-tight text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Builder
                            </span>
                           
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            {isRunning ? (
                                <span className="flex items-center gap-1 text-green-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Running Workflow...
                                </span>
                            ) : waitingNodeId ? (
                                <span className="flex items-center gap-1 text-amber-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    Waiting for Input
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-yellow-500' : 'bg-gray-600'}`} />
                                    {isSaving ? 'Saving changes...' : lastSaved ? `Saved ${lastSaved}` : 'Ready'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Actions Toolbar - Reorganized */}
                <div className="flex items-center gap-2">

                    {/* ACTIONS GROUP - Primary operations */}
                    <div className="flex items-center p-1 bg-white/5 rounded-lg border border-white/5 shadow-sm">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-medium"
                            title="Add new node (Cmd+N)"
                        >
                            <Plus size={14} className="text-purple-400" />
                            Add Node
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button
                            onClick={() => setIsRunConfigOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-green-500/20 text-gray-300 hover:text-green-400 transition-all text-xs font-medium"
                            title="Run Workflow (Cmd+Enter)"
                            disabled={isRunning}
                        >
                            <Play size={14} className={isRunning ? "animate-pulse" : ""} />
                            Run
                        </button>
                        <button
                            onClick={() => setIsMultiTestOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-purple-500/20 text-gray-300 hover:text-purple-400 transition-all text-xs font-medium"
                            title="Test selected nodes"
                        >
                            <FlaskConical size={14} />
                            Test
                        </button>
                    </div>

                    {/* TOOLS GROUP - Workflow utilities */}
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                        <button
                            onClick={() => setIsDocumentationOpen(true)}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Documentar Workflow"
                        >
                            <BookOpen size={16} />
                        </button>
                        <button
                            onClick={() => setIsWorkflowVariablesOpen(true)}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors"
                            title="Configurar Variables del Workflow"
                        >
                            <Variable size={16} />
                        </button>
                        <button
                            onClick={() => setIsAgentOpen(true)}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-colors"
                            title="AI Agent Assistant"
                        >
                            <Bot size={16} />
                        </button>
                        <button
                            onClick={() => saveWorkflow()}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Save Workflow (Cmd+S)"
                        >
                            <Save size={16} />
                        </button>
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Version History"
                        >
                            <History size={16} />
                        </button>
                        <button
                            onClick={handleClone}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Clone Workflow"
                        >
                            <GitBranch size={16} />
                        </button>
                    </div>

                    {/* FILE GROUP - Import/Export */}
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                        <button
                            onClick={handleExport}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Export to JSON"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Import from JSON"
                        >
                            <Upload size={16} />
                        </button>
                    </div>

                    {/* SETTINGS GROUP - Configuration */}
                    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/5">
                        <button
                            onClick={() => setIsApiConfigOpen(true)}
                            className="p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="API Configuration"
                        >
                            <Settings size={16} />
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleImport}
                    />
                </div>
            </div>

            {/* Toolbar */}
            <div className="absolute top-16 left-4 right-4 z-10 flex justify-between pointer-events-none">
                {/* Enhanced Search with Results */}
                <div className="pointer-events-auto relative">
                    <div className="flex items-center bg-surface border border-white/10 rounded-md shadow-lg p-1.5 gap-1">
                        <Search size={14} className="text-gray-500 flex-shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search nodes (Cmd+K)"
                            className="bg-transparent border-none text-xs text-white placeholder-gray-600 focus:ring-0 focus:outline-none w-40"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-gray-500 hover:text-white transition-colors"
                                title="Clear search"
                            >
                                <RotateCcw size={12} />
                            </button>
                        )}
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 border-l border-white/10 pl-2">
                                <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                                <button
                                    onClick={() => navigateSearchResults('prev')}
                                    className="hover:text-white"
                                    title="Previous (Shift+Enter)"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => navigateSearchResults('next')}
                                    className="hover:text-white"
                                    title="Next (Enter)"
                                >
                                    ↓
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-64 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50">
                            {searchResults.map((nodeId, index) => {
                                const node = nodes.find(n => n.id === nodeId);
                                if (!node) return null;

                                return (
                                    <button
                                        key={nodeId}
                                        onClick={() => {
                                            setSelectedNodeId(nodeId);
                                            setCurrentSearchIndex(index);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors border-l-2 ${
                                            index === currentSearchIndex ? 'border-purple-400 bg-white/5' : 'border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white font-medium truncate">{node.data.label}</span>
                                            <span className="text-gray-500 text-[10px] ml-2 flex-shrink-0">{node.data.type}</span>
                                        </div>
                                        <div className="text-gray-600 text-[10px] truncate mt-0.5">{nodeId}</div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="pointer-events-auto flex gap-1 bg-surface border border-white/10 rounded-md shadow-lg p-1">
                    <button
                        className={`p-1 rounded transition-colors ${selectedNodes.length > 1 ? 'hover:bg-white/10 text-purple-400' : 'text-gray-600 cursor-not-allowed'}`}
                        title={selectedNodes.length > 1 ? "Group selected nodes together" : "Select 2+ nodes to group"}
                        onClick={handleGroupNodes}
                        disabled={selectedNodes.length < 2}
                    >
                        <BoxSelect size={14} />
                    </button>
                    <button
                        className="p-1 hover:bg-white/10 rounded"
                        title="Auto-layout graph (arranges nodes automatically)"
                        onClick={() => onLayout('LR')}
                    >
                        <Layout size={14} className="text-gray-400" />
                    </button>
                    <button
                        className="p-1 hover:bg-white/10 rounded"
                        title="Fit view to canvas (zoom to fit all nodes)"
                        onClick={() => {
                            // This would need ReactFlow's fitView function
                            // For now it's just a placeholder
                        }}
                    >
                        <Maximize2 size={14} className="text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative">
                <NodeGraph
                    nodes={nodesWithFilterData}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onNodeContextMenu={onNodeContextMenu}
                >
                    <SelectionListener onChange={setSelectedNodes} />
                </NodeGraph>

                {/* Enhanced Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed z-50 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl py-1.5 w-56 animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: contextMenu.top, left: contextMenu.left }}
                    >
                        {/* Edit Node */}
                        <button
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-white/5 text-xs flex items-center gap-2 transition-colors"
                            onClick={() => {
                                setSelectedNodeId(contextMenu.id);
                                setContextMenu(null);
                            }}
                        >
                            <Settings size={14} />
                            <span className="flex-1">Edit Node</span>
                        </button>

                        {/* Duplicate */}
                        <button
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-white/5 text-xs flex items-center gap-2 transition-colors"
                            onClick={() => handleDuplicateNode(contextMenu.id)}
                        >
                            <Copy size={14} />
                            <span className="flex-1">Duplicate</span>
                            <span className="text-gray-500 text-[10px]">⌘D</span>
                        </button>

                        {/* Add Node After */}
                        <button
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-white/5 text-xs flex items-center gap-2 transition-colors"
                            onClick={() => {
                                confirmAddNode(contextMenu.id, '', 'New Node', 'LLM');
                                setContextMenu(null);
                            }}
                        >
                            <Plus size={14} />
                            <span className="flex-1">Add Node After</span>
                        </button>

                        {/* Add Variant */}
                        <button
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-white/5 text-xs flex items-center gap-2 transition-colors"
                            onClick={() => {
                                setSelectedNodeId(contextMenu.id);
                                setIsMutationModalOpen(true);
                                setContextMenu(null);
                            }}
                        >
                            <Dna size={14} />
                            <span className="flex-1">Add Variant</span>
                        </button>

                        {/* Divider */}
                        <div className="h-px bg-white/10 my-1.5" />

                        {/* Delete */}
                        <button
                            className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-500/10 text-xs flex items-center gap-2 transition-colors"
                            onClick={() => handleDeleteNode(contextMenu.id)}
                        >
                            <Trash2 size={14} />
                            <span className="flex-1">Delete Node</span>
                            <span className="text-red-500/50 text-[10px]">Del</span>
                        </button>
                    </div>
                )}

                {/* Backdrop to close context menu */}
                {contextMenu && (
                    <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
                )}

                {/* Inspector Drawer */}
                {selectedNodeId && getSelectedNodeData()?.type !== 'JSON' && getSelectedNodeData()?.type !== 'JSON_BUILDER' && getSelectedNodeData()?.type !== 'CSV_INPUT' && getSelectedNodeData()?.type !== 'CSV_OUTPUT' && (
                    <div className="absolute top-0 right-0 bottom-0 w-[320px] bg-surface border-l border-border shadow-2xl z-20 flex flex-col animate-[slideIn_0.2s_ease-out]">
                        {(() => {
                            const nodeData = getSelectedNodeData();
                            // Only render Inspector if data exists, avoiding hook mismatch by mounting/unmounting
                            if (!nodeData) return null;

                            return (
                                <Inspector
                                    node={nodeData}
                                    availableNodes={getAllNodesData()}
                                    edges={edges}
                                    onClose={() => setSelectedNodeId(undefined)}
                                    onNodeUpdate={handleNodeUpdate}
                                    onDeleteNode={handleDeleteNode}
                                />
                            );
                        })()}
                    </div>
                )}

                <AddNodeModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onConfirm={confirmAddNode}
                    nodes={nodes}
                />

                {selectedNodeId && isJsonModalOpen && (
                    <JsonEditorModal
                        isOpen={isJsonModalOpen}
                        onClose={() => {
                            setIsJsonModalOpen(false);
                            setSelectedNodeId(undefined);
                        }}
                        onSave={(json) => {
                            handleNodeUpdate(selectedNodeId, { json });
                        }}
                        initialValue={getSelectedNodeData()?.json || ''}
                        nodeLabel={getSelectedNodeData()?.label || 'JSON Node'}
                        availableVariables={getAvailableVariables()}
                    />
                )}

                {selectedNodeId && isCsvInputModalOpen && (
                    <CsvInputModal
                        isOpen={isCsvInputModalOpen}
                        onClose={() => {
                            setIsCsvInputModalOpen(false);
                            setSelectedNodeId(undefined);
                        }}
                        onSave={(csv) => {
                            handleNodeUpdate(selectedNodeId, { csv });
                        }}
                        initialValue={getSelectedNodeData()?.csv || ''}
                        nodeLabel={getSelectedNodeData()?.label || 'CSV Input'}
                    />
                )}

                {selectedNodeId && isCsvOutputModalOpen && (
                    <CsvOutputModal
                        isOpen={isCsvOutputModalOpen}
                        onClose={() => {
                            setIsCsvOutputModalOpen(false);
                            setSelectedNodeId(undefined);
                        }}
                        onSave={(mappings) => {
                            handleNodeUpdate(selectedNodeId, { csvMappings: mappings });
                        }}
                        initialMappings={getSelectedNodeData()?.csvMappings || []}
                        nodeLabel={getSelectedNodeData()?.label || 'CSV Output'}
                        availableNodes={getAllNodesData()}
                        executionResults={executionResults}
                    />
                )}

                {selectedNodeId && isFilterConfigOpen && (
                    <FilterConfigModal
                        isOpen={isFilterConfigOpen}
                        onClose={() => {
                            setIsFilterConfigOpen(false);
                            setSelectedNodeId(undefined);
                        }}
                        onSave={(condition) => {
                            handleNodeUpdate(selectedNodeId, { filterCondition: condition });
                        }}
                        initialCondition={getSelectedNodeData()?.filterCondition}
                        nodeLabel={getSelectedNodeData()?.label || 'Filter'}
                        availableNodes={getAllNodesData()}
                        edges={edges}
                        currentNodeId={selectedNodeId}
                    />
                )}

                <MultiNodeTestModal
                    isOpen={isMultiTestOpen}
                    onClose={() => setIsMultiTestOpen(false)}
                    nodes={getAllNodesData()}
                    edges={edges}
                />

                <ApiConfigModal
                    isOpen={isApiConfigOpen}
                    onClose={() => setIsApiConfigOpen(false)}
                />

                <AgentPopup
                    isOpen={isAgentOpen}
                    onClose={() => {
                        setIsAgentOpen(false);
                        setAgentInitialMessage(''); // Clear initial message when closing
                    }}
                    nodes={nodes}
                    edges={edges}
                    onApplyActions={handleApplyActions}
                    initialMessage={agentInitialMessage}
                />

                {isHistoryOpen && (
                    <VersionHistoryModal
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                        type="precrafter"
                        onRestore={(restoredNodes, restoredEdges) => {
                            setNodes(restoredNodes);
                            setEdges(restoredEdges);
                            addLog({ nodeId: 'system', nodeLabel: 'System', status: 'info', message: 'Restored previous version.' });
                        }}
                    />
                )}

                <MutationModal
                    isOpen={isMutationModalOpen}
                    onClose={() => setIsMutationModalOpen(false)}
                    nodes={getAllNodesData()}
                    onUpdateNode={handleUpdateNode}
                />

                <RunConfigModal
                    isOpen={isRunConfigOpen}
                    onClose={() => setIsRunConfigOpen(false)}
                    onConfirm={(workers) => {
                        // TODO: Use workers count for parallel execution if needed
                        console.log('Running with workers:', workers);
                        setIsRunConfigOpen(false);
                        startExecution();
                    }}
                />

                <WorkflowVariablesModal
                    isOpen={isWorkflowVariablesOpen}
                    onClose={() => setIsWorkflowVariablesOpen(false)}
                    onSave={(variables, applyWithAI) => {
                        setWorkflowVariables(variables);
                        addLog({
                            nodeId: 'system',
                            nodeLabel: 'System',
                            status: 'success',
                            message: `Variables configuradas: ${variables.map(v => v.name).join(', ')}`
                        });

                        // If applyWithAI is true, generate the initial message and open agent
                        if (applyWithAI && variables.length > 0 && nodes.length > 0) {
                            // Generate the AI prompt
                            const variablesList = variables.map(v =>
                                `- {{${v.name}}}: ${v.label}${v.description ? ` - ${v.description}` : ''}`
                            ).join('\n');

                            const aiPrompt = `🎯 CONFIGURACIÓN DE VARIABLES DEL WORKFLOW

He definido las siguientes variables personalizadas para este workflow:

${variablesList}

📋 TU MISIÓN COMO MANUS:
Actúa como un asistente inteligente y modifica los prompts de los nodos del workflow para incorporar estas variables de forma estratégica y quirúrgica.

⚠️ REGLAS CRÍTICAS:
1. NO agregues variables a TODOS los nodos - solo a los que realmente las necesiten según su propósito
2. Mantén la función y estructura original de cada nodo intacta
3. Usa la sintaxis {{nombre_variable}} para referenciar las variables
4. Si un nodo tiene un propósito específico que no requiere estas variables, déjalo SIN MODIFICAR
5. Sé preciso: cambia ÚNICAMENTE lo necesario para integrar las variables

💡 CONTEXTO:
- El workflow tiene ${nodes.length} nodos en total
- Las variables representan información sobre leads/clientes que variará en cada ejecución
- El objetivo es personalizar los prompts para que usen esta información dinámica

🔧 ACCIÓN REQUERIDA:
Analiza cada nodo del workflow, identifica cuáles se beneficiarían de usar estas variables, y modifica solo sus prompts (systemPrompt y/o userPrompt) para incorporarlas de forma natural y efectiva.`;


                            setAgentInitialMessage(aiPrompt);

                            // Open agent after a short delay
                            setTimeout(() => {
                                setIsAgentOpen(true);
                                addLog({
                                    nodeId: 'system',
                                    nodeLabel: 'System',
                                    status: 'info',
                                    message: 'Abriendo AI Agent para adaptar los prompts de forma inteligente...'
                                });
                            }, 300);
                        }
                    }}
                    initialVariables={workflowVariables}
                    workflowVariables={workflowVariables}
                    hasNodes={nodes.length > 0}
                />

                <WorkflowInputModal
                    isOpen={isWorkflowInputOpen}
                    onClose={() => setIsWorkflowInputOpen(false)}
                    onSubmit={(values) => {
                        addLog({
                            nodeId: 'system',
                            nodeLabel: 'System',
                            status: 'info',
                            message: `Ejecutando con variables: ${Object.keys(values).join(', ')}`
                        });
                        startExecutionWithVariables(values);
                    }}
                    variables={workflowVariables}
                />

                <DocumentationModal
                    isOpen={isDocumentationOpen}
                    onClose={() => setIsDocumentationOpen(false)}
                    nodes={nodes}
                    onSaveDocumentation={handleSaveDocumentation}
                    onGenerateWithAI={handleGenerateDocumentationWithAI}
                />

                {/* Command Palette Modal */}
                {isCommandPaletteOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-150"
                            onClick={() => setIsCommandPaletteOpen(false)}
                        />

                        {/* Command Palette */}
                        <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] animate-in fade-in zoom-in-95 duration-150">
                            <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                                    <Search size={18} className="text-gray-500 flex-shrink-0" />
                                    <input
                                        ref={commandInputRef}
                                        type="text"
                                        value={commandQuery}
                                        onChange={(e) => setCommandQuery(e.target.value)}
                                        placeholder="Type a command or search..."
                                        className="flex-1 bg-transparent border-none text-sm text-white placeholder-gray-600 focus:ring-0 focus:outline-none"
                                        autoFocus
                                    />
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">⌘</kbd>
                                        <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">P</kbd>
                                    </div>
                                </div>

                                {/* Commands List */}
                                <div className="max-h-[400px] overflow-y-auto">
                                    {filteredCommands.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                            No commands found
                                        </div>
                                    ) : (
                                        <>
                                            {/* Group commands by category */}
                                            {Array.from(new Set(filteredCommands.map(cmd => cmd.category))).map((category) => {
                                                const categoryCommands = filteredCommands.filter(cmd => cmd.category === category);

                                                return (
                                                    <div key={category}>
                                                        <div className="px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-white/5">
                                                            {category}
                                                        </div>
                                                        {categoryCommands.map((command, index) => {
                                                            const globalIndex = filteredCommands.indexOf(command);
                                                            const Icon = command.icon;

                                                            return (
                                                                <button
                                                                    key={command.id}
                                                                    onClick={() => command.action()}
                                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-all ${
                                                                        globalIndex === selectedCommandIndex
                                                                            ? 'bg-purple-500/20 text-white border-l-2 border-purple-400'
                                                                            : 'text-gray-300 hover:bg-white/5 border-l-2 border-transparent'
                                                                    }`}
                                                                    onMouseEnter={() => setSelectedCommandIndex(globalIndex)}
                                                                >
                                                                    <Icon size={16} className="flex-shrink-0" />
                                                                    <span className="flex-1">{command.label}</span>
                                                                    {command.shortcut && (
                                                                        <span className="text-[10px] text-gray-500">{command.shortcut}</span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>

                                {/* Footer with hints */}
                                <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-500">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 bg-white/5 rounded">↑↓</kbd>
                                            Navigate
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 bg-white/5 rounded">↵</kbd>
                                            Execute
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <kbd className="px-1 py-0.5 bg-white/5 rounded">Esc</kbd>
                                            Close
                                        </span>
                                    </div>
                                    <span>{filteredCommands.length} commands</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {isChristmasMode && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden font-sans">
                    {/* 0. ATMOSPHERE OVERLAY (Warm Christmas Night) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B1026]/40 via-transparent to-[#2F0B0B]/30 mix-blend-overlay z-0" />

                    {/* 1. STRING LIGHTS (Guirnalda de Luces) */}
                    <div className="absolute top-0 left-0 right-0 h-8 z-50 flex justify-between items-start px-2 overflow-hidden">
                        <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-600/50 -z-10 blur-[1px]"></div> {/* Cable */}
                        {[...Array(30)].map((_, i) => {
                            const colors = ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500'];
                            const color = colors[i % 4];
                            return (
                                <div
                                    key={`light-${i}`}
                                    className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_2px_currentColor]`}
                                    style={{
                                        animation: `blink 1s infinite alternate`,
                                        animationDelay: `${i * 0.1}s`,
                                        marginTop: i % 2 === 0 ? '0px' : '8px'
                                    }}
                                />
                            )
                        })}
                    </div>

                    {/* 2. THE MOON & CLOUDS */}
                    <div className="absolute top-10 right-20 text-yellow-100/20 animate-pulse">
                        <Moon size={80} fill="currentColor" />
                    </div>
                    <div className="absolute top-20 right-40 text-white/5 animate-[float_20s_linear_infinite]">
                        <Cloud size={120} fill="currentColor" />
                    </div>

                    {/* 3. SANTA'S SLEIGH (Crossing the screen) */}
                    <div className="absolute top-24 -left-40 z-10" style={{ animation: 'sleigh-ride 20s linear infinite' }}>
                        <div className="flex items-end gap-2 text-red-500/80 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                            {/* Reindeers */}
                            <div className="mb-2 flex gap-1">
                                <Zap size={16} className="text-yellow-400 rotate-90" />
                                <Star size={20} className="text-yellow-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <Star size={20} className="text-yellow-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                <Star size={20} className="text-yellow-600 animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                            {/* Sleigh */}
                            <div className="relative">
                                <Gift size={32} />
                                <div className="absolute -top-3 -right-2"><Heart size={12} fill="red" /></div>
                            </div>
                            <div className="text-[10px] font-bold text-white whitespace-nowrap ml-2 opacity-50">Ho ho ho!</div>
                        </div>
                    </div>

                    {/* 4. ULTIMATE SNOW STORM (3 Layers of Depth) */}
                    {/* Layer Back (Slow, Small) */}
                    {[...Array(50)].map((_, i) => (
                        <div key={`snow-back-${i}`} className="absolute text-white/20" style={{
                            left: `${Math.random() * 100}%`, top: -20,
                            animation: `fall ${Math.random() * 10 + 10}s linear infinite`,
                        }}><Snowflake size={Math.random() * 5 + 2} /></div>
                    ))}
                    {/* Layer Mid (Normal) */}
                    {[...Array(40)].map((_, i) => (
                        <div key={`snow-mid-${i}`} className="absolute text-cyan-100/40" style={{
                            left: `${Math.random() * 100}%`, top: -20,
                            animation: `fall ${Math.random() * 5 + 5}s linear infinite, sway 3s ease-in-out infinite alternate`,
                            animationDelay: `${Math.random() * 5}s`
                        }}><Snowflake size={Math.random() * 10 + 5} /></div>
                    ))}
                    {/* Layer Front (Fast, Blur) */}
                    {[...Array(10)].map((_, i) => (
                        <div key={`snow-front-${i}`} className="absolute text-white/60 blur-[1px]" style={{
                            left: `${Math.random() * 100}%`, top: -20,
                            animation: `fall ${Math.random() * 3 + 2}s linear infinite`,
                            zIndex: 100
                        }}><Snowflake size={Math.random() * 20 + 10} /></div>
                    ))}

                    {/* 5. EXPLOSION OF CHRISTMAS JOY (Icons) */}
                    {[...Array(25)].map((_, i) => {
                        const Icon = [Gift, Bell, Star, PartyPopper, Music, Heart][Math.floor(Math.random() * 6)];
                        const colorClass = ['text-red-500', 'text-green-500', 'text-yellow-400', 'text-pink-500', 'text-purple-400'][Math.floor(Math.random() * 5)];
                        return (
                            <div key={`joy-${i}`} className={`absolute ${colorClass} opacity-80`} style={{
                                left: `${Math.random() * 90 + 5}%`,
                                top: `${Math.random() * 90 + 5}%`,
                                animation: `float ${Math.random() * 4 + 2}s ease-in-out infinite, tumble ${Math.random() * 5 + 3}s linear infinite`,
                                filter: 'drop-shadow(0 0 8px currentColor)'
                            }}>
                                <Icon size={Math.random() * 30 + 15} />
                            </div>
                        );
                    })}

                    {/* 6. FROSTED VIGNETTE BOTTOM */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent blur-xl pointer-events-none" />

                    <style>{`
                    @keyframes blink { 0% { opacity: 0.4; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
                    @keyframes fall { 0% { transform: translateY(-30px); } 100% { transform: translateY(110vh); } }
                    @keyframes sway { 0% { margin-left: -15px; } 100% { margin-left: 15px; } }
                    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                    @keyframes tumble { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes sleigh-ride { 
                        0% { transform: translateX(-10vw) translateY(0) rotate(5deg); } 
                        25% { transform: translateX(25vw) translateY(20px) rotate(0deg); }
                        50% { transform: translateX(50vw) translateY(-10px) rotate(-5deg); }
                        75% { transform: translateX(75vw) translateY(10px) rotate(0deg); }
                        100% { transform: translateX(110vw) translateY(0) rotate(5deg); } 
                    }
                `}</style>
                </div>
            )}
            {/* --- MONEY MODE OVERLAY --- */}
            {isMoneyMode && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden font-sans">
                    {/* 0. WEALTH ATMOSPHERE */}
                    <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-transparent to-black/40 mix-blend-overlay z-0" />

                    {/* 1. RAINING MONEY (Bills) */}
                    {[...Array(40)].map((_, i) => (
                        <div key={`bill-${i}`} className="absolute text-green-400/60" style={{
                            left: `${Math.random() * 100}%`, top: -50,
                            fontSize: `${Math.random() * 20 + 20}px`,
                            animation: `fall ${Math.random() * 4 + 3}s linear infinite, sway ${Math.random() * 3 + 2}s ease-in-out infinite alternate`,
                            animationDelay: `${Math.random() * 5}s`,
                            filter: 'drop-shadow(0 0 5px rgba(0,255,0,0.2))'
                        }}>
                            {['💵', '💸', '💲'][Math.floor(Math.random() * 3)]}
                        </div>
                    ))}

                    {/* 2. FLOATING ASSETS (Coins, Diamonds, Bags) */}
                    {[...Array(20)].map((_, i) => {
                        const Icon = [Coins, Diamond, Briefcase, TrendingUp, Wallet][Math.floor(Math.random() * 5)];
                        const color = ['text-yellow-400', 'text-green-400', 'text-blue-300'][Math.floor(Math.random() * 3)];
                        return (
                            <div key={`asset-${i}`} className={`absolute ${color} opacity-80`} style={{
                                left: `${Math.random() * 90 + 5}%`,
                                top: `${Math.random() * 90 + 5}%`,
                                animation: `float ${Math.random() * 5 + 3}s ease-in-out infinite, spin3d ${Math.random() * 8 + 5}s linear infinite`,
                                filter: 'drop-shadow(0 0 10px currentColor)'
                            }}>
                                <Icon size={Math.random() * 40 + 20} strokeWidth={1.5} />
                            </div>
                        );
                    })}

                    {/* 3. FLYING STOCKS */}
                    <div className="absolute top-20 right-10 flex gap-4 opacity-50 font-mono text-green-500 font-bold text-xs animate-pulse">
                        <span>BTC +5.2% 🚀</span>
                        <span>NVDA +2.1% 📈</span>
                        <span>ETH +3.8% 💎</span>
                    </div>

                    <style>{`
                    @keyframes spin3d {
                        0% { transform: rotateY(0deg); }
                        100% { transform: rotateY(360deg); }
                    }
                `}</style>
                </div>
            )}
        </div>
    );
};