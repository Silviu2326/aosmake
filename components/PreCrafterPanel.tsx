import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';
import { NodeGraph } from './NodeGraph';
import { NodeData, NodeStatus, NodeVariant } from '../types';
import { Inspector } from './Inspector';
import { AddNodeModal } from './AddNodeModal';
import { useConsole } from '../context/ConsoleContext';
import { JsonEditorModal } from './JsonEditorModal';
import { getNodeFields } from '../utils/nodeUtils';
import { AgentPopup } from './AgentPopup';
import { Play, Copy, GitBranch, Search, Maximize2, Plus, Save, RotateCcw, Bot, Upload, Download, Layout, History, BoxSelect } from 'lucide-react';
import { VersionHistoryModal } from './VersionHistoryModal';
import dagre from 'dagre';
import { useOnSelectionChange } from 'reactflow';

const API_URL = 'http://localhost:3001/api/workflows/precrafter';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      results: Record<string, string>;
  }>({ incomingEdges: {}, outgoingEdges: {}, results: {} });

  const { addLog, clearLogs, setExecutionContext } = useConsole();

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

  const executeNode = async (node: NodeData, context: Record<string, string>, logDescription?: string) => {
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

      const response = await fetch('http://localhost:3001/api/workflows/run-node', {
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
              await fetch('http://localhost:3001/api/workflows/precrafter/runs', {
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

          const updateVariantResult = (variantId: string, result: any, status: 'success'|'error') => {
              setNodes(nds => nds.map(n => {
                  if (n.id === nodeId) {
                      if (variantId === 'master') {
                          return { ...n, data: { ...n.data, outputData: result, status: NodeStatus.WAITING } };
                      } else {
                           const updatedVariants = n.data.variants?.map((v: NodeVariant) => 
                               v.id === variantId ? { ...v, output: result, status } : v
                           );
                           return { ...n, data: { ...n.data, variants: updatedVariants } };
                      }
                  }
                  return n;
              }));
          };

          const variants = node.data.variants || [];
          
          // 1. Execute Master
          const masterPromise = executeNode({ ...node.data, id: node.id }, dependencyState.current.results, "Executing Master Configuration...")
              .then(res => {
                  updateVariantResult('master', res.output, res.success ? 'success' : 'error');
                  return res;
              })
              .catch(() => updateVariantResult('master', null, 'error'));

          // 2. Execute Variants
          const variantPromises = variants.map(v => 
              executeNode({ ...node.data, ...v, id: node.id }, dependencyState.current.results, `Executing ${v.label}...`)
                  .then(res => {
                      updateVariantResult(v.id, res.output, res.success ? 'success' : 'error');
                      return res;
                  })
                  .catch(() => updateVariantResult(v.id, null, 'error'))
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
          const data = await executeNode(node.data, dependencyState.current.results);
          
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


  const startExecution = async () => {
      clearLogs();
      // 1. Reset Status
      setNodes((nds) => nds.map(n => ({ 
          ...n, 
          data: { ...n.data, status: NodeStatus.IDLE, selectedVariantId: undefined } 
      })));
      setExecutionResults({});
      setWaitingNodeId(null);

      // 2. Build Dependency Graph
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
          results: {}
      };

      // 3. Find Start Nodes
      const initialQueue = nodes.filter(n => incoming[n.id] === 0).map(n => n.id);

      if (initialQueue.length === 0 && nodes.length > 0) {
          addLog({ nodeId: 'system', nodeLabel: 'System', status: 'error', message: 'Cycle detected or no start node found.' });
          return;
      }

      setExecutionQueue(initialQueue);
      setIsRunning(true);
      setStartTime(new Date().toISOString());
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
    setSelectedNodeId(node.id);
    if (node.data.type === 'JSON' || node.data.type === 'JSON_BUILDER') {
        setIsJsonModalOpen(true);
    }
  }, []);

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

    const newNode: Node = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { 
            label: label || 'New Processor', 
            type: type || 'LLM', 
            status: NodeStatus.IDLE, 
            inputs: ['input'], 
            outputs: ['output'],
            json: (type === 'JSON' || type === 'JSON_BUILDER') ? defaultJson : undefined
        }
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newNodeId);
    if (type === 'JSON' || type === 'JSON_BUILDER') {
        setIsJsonModalOpen(true);
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

  const handleDeleteNode = (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
      if (selectedNodeId === id) {
          setSelectedNodeId(undefined);
      }
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

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
        {/* Panel Header */}
        <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-surface/50">
            <div className="flex items-center gap-3">
                <span className="font-semibold text-white">PreCrafter</span>
                <div className="flex items-center bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] text-blue-400 font-mono cursor-pointer hover:bg-blue-500/20">
                    v4.2
                </div>
                {isSaving ? (
                    <span className="text-[10px] text-yellow-500 ml-2 animate-pulse">Saving...</span>
                ) : (
                    lastSaved && <span className="text-[10px] text-gray-500 ml-2">Saved {lastSaved}</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                {isRunning && (
                    <>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-green-500 font-medium mr-2">Running</span>
                    </>
                )}
                {waitingNodeId && (
                     <>
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                        <span className="text-xs text-yellow-500 font-medium mr-2">Waiting for Decision</span>
                    </>
                )}
                
                <button 
                    onClick={() => setIsAgentOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-purple-400 hover:text-purple-300 transition-colors"
                    title="AI Agent"
                >
                    <Bot size={14} />
                    <span className="text-xs">Agent</span>
                </button>

                <button 
                    onClick={() => saveWorkflow()}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Save Workflow"
                >
                    <Save size={14} />
                    <span className="text-xs">Save</span>
                </button>

                <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Version History"
                >
                    <History size={14} />
                    <span className="text-xs">History</span>
                </button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button 
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Export JSON"
                >
                    <Download size={14} />
                    <span className="text-xs">Export</span>
                </button>

                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Import JSON"
                >
                    <Upload size={14} />
                    <span className="text-xs">Import</span>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept=".json" 
                    onChange={handleImport} 
                />

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                    <Plus size={14} />
                    <span className="text-xs">Add Node</span>
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                    onClick={startExecution}
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                    title="Run Workflow"
                >
                    <Play size={14} />
                </button>
                <button 
                    onClick={handleClone}
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                    title="Clone Version"
                >
                    <GitBranch size={14} />
                </button>
            </div>
        </div>

        {/* Toolbar */}
        <div className="absolute top-16 left-4 right-4 z-10 flex justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center bg-surface border border-white/10 rounded-md shadow-lg p-1">
                <Search size={14} className="ml-2 text-gray-500" />
                <input 
                    type="text" 
                    placeholder="Search node (Cmd+K)" 
                    className="bg-transparent border-none text-xs text-white placeholder-gray-600 focus:ring-0 w-32 ml-1"
                />
            </div>
            <div className="pointer-events-auto flex gap-1 bg-surface border border-white/10 rounded-md shadow-lg p-1">
                 <button 
                    className={`p-1 rounded transition-colors ${selectedNodes.length > 1 ? 'hover:bg-white/10 text-purple-400' : 'text-gray-600 cursor-not-allowed'}`} 
                    title="Group Selected Nodes"
                    onClick={handleGroupNodes}
                    disabled={selectedNodes.length < 2}
                 >
                    <BoxSelect size={14} />
                 </button>
                 <button 
                    className="p-1 hover:bg-white/10 rounded" 
                    title="Auto Layout"
                    onClick={() => onLayout('LR')}
                 >
                    <Layout size={14} className="text-gray-400" />
                 </button>
                 <button className="p-1 hover:bg-white/10 rounded"><Maximize2 size={14} className="text-gray-400" /></button>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
            <NodeGraph 
                nodes={nodes} 
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
            >
                <SelectionListener onChange={setSelectedNodes} />
            </NodeGraph>

            {/* Inspector Drawer */}
            {selectedNodeId && getSelectedNodeData()?.type !== 'JSON' && getSelectedNodeData()?.type !== 'JSON_BUILDER' && (
                <div className="absolute top-0 right-0 bottom-0 w-[320px] bg-surface border-l border-border shadow-2xl z-20 flex flex-col animate-[slideIn_0.2s_ease-out]">
                    <Inspector 
                        node={getSelectedNodeData()} 
                        availableNodes={getAllNodesData()}
                        edges={edges}
                        onClose={() => setSelectedNodeId(undefined)} 
                        onNodeUpdate={handleNodeUpdate}
                        onDeleteNode={handleDeleteNode}
                    />
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

            <AgentPopup 
                isOpen={isAgentOpen} 
                onClose={() => setIsAgentOpen(false)} 
                nodes={nodes} 
                edges={edges}
                onApplyActions={handleApplyActions}
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
        </div>
    </div>
  );
};