import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from 'reactflow';
import { NodeGraph } from './NodeGraph';
import { NodeData, NodeStatus } from '../types';
import { Inspector } from './Inspector';
import { AddNodeModal } from './AddNodeModal';
import { AgentPopup } from './AgentPopup';
import { Play, GitBranch, Search, Maximize2, Send, Download, Copy, ExternalLink, ChevronUp, ChevronDown, GitCompare, Plus, Save, Bot, Upload, History, Snowflake } from 'lucide-react';
import { VersionHistoryModal } from './VersionHistoryModal';
import { useChristmas } from '../context/ChristmasContext';

const API_URL = 'https://backendaos-production.up.railway.app/api/workflows/crafter';

// Mock Data (Fallback)
const INITIAL_NODES: Node[] = [];

const INITIAL_EDGES: Edge[] = [];

export const CrafterPanel: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<string | null>(null);
  const { isChristmasMode, toggleChristmasMode } = useChristmas();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
      const scenario = { nodes, edges };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenario, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "crafter_scenario.json");
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
                  console.log('Scenario imported successfully.');
              } else {
                  console.error('Invalid scenario file format.');
              }
          } catch (error) {
              console.error("Error importing file:", error);
          }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset
  };

  // ... (existing code)

  const handleValidate = async () => {
      setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: NodeStatus.IDLE } })));
      setExecutionResults({});
      const start = new Date().toISOString();
      setStartTime(start);

      const incomingEdges: Record<string, number> = {};
      const outgoingEdges: Record<string, string[]> = {};
      
      nodes.forEach(n => { incomingEdges[n.id] = 0; outgoingEdges[n.id] = []; });
      edges.forEach(e => {
          if (incomingEdges[e.target] !== undefined) incomingEdges[e.target]++;
          if (outgoingEdges[e.source]) outgoingEdges[e.source].push(e.target);
      });

      const queue = nodes.filter(n => incomingEdges[n.id] === 0).map(n => n.id);
      const results: Record<string, string> = {};
      let hasError = false;

      while (queue.length > 0) {
          const nodeId = queue.shift()!;
          const node = nodes.find(n => n.id === nodeId);
          if (!node) continue;

          setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.RUNNING } } : n));

          try {
              const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/run-node', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      node: {
                          ...node,
                          systemPrompt: node.data.systemPrompt,
                          userPrompt: node.data.userPrompt,
                          temperature: node.data.temperature,
                          schema: node.data.schema
                      },
                      context: results 
                  })
              });
              
              const data = await response.json();

              if (data.success) {
                  // Store both input and output for comprehensive run tracking
                  results[nodeId] = {
                      input: data.input || {},
                      output: data.output
                  };
                  setExecutionResults(prev => ({ ...prev, [nodeId]: data.output }));
                  setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.SUCCESS, outputData: data.output } } : n));

                  outgoingEdges[nodeId].forEach(targetId => {
                      incomingEdges[targetId]--;
                      if (incomingEdges[targetId] === 0) queue.push(targetId);
                  });
              } else {
                  throw new Error(data.error);
              }
          } catch (error) {
              console.error(`Error executing node ${nodeId}:`, error);
              setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: NodeStatus.ERROR } } : n));
              hasError = true;
              break;
          }
      }

      // Save Run
      try {
          await fetch('https://backendaos-production.up.railway.app/api/workflows/crafter/runs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  status: hasError ? 'failed' : 'success',
                  startTime: start,
                  endTime: new Date().toISOString(),
                  results: results,
                  version: 0 
              })
          });
      } catch (e) { console.error('Failed to save run', e); }
  };
  // Load workflow from backend on mount
  useEffect(() => {
    const fetchWorkflow = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                if (data.nodes) {
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
  }, []);

  const confirmAddNode = (sourceId: string, targetId: string, label: string) => {
    const newNodeId = `c-node_${Date.now()}`;
    let position = { x: 100, y: 100 };
    
    // Logic to calculate position based on selection
    if (sourceId && targetId) {
        // Inserting between two nodes
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        if (sourceNode && targetNode) {
            position = {
                x: sourceNode.position.x, 
                y: (sourceNode.position.y + targetNode.position.y) / 2
            };
            
            setEdges(eds => eds.filter(e => !(e.source === sourceId && e.target === targetId)));
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

    const newNode: Node = {
        id: newNodeId,
        type: 'custom',
        position,
        data: { 
            label: label || 'New Processor', 
            type: 'LLM', 
            status: NodeStatus.IDLE, 
            inputs: ['input'], 
            outputs: ['output'] 
        }
    };
    
    setNodes((nds) => [...nds, newNode]);
    setSelectedNodeId(newNodeId);
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

  const handleNodeUpdate = (id: string, data: Partial<NodeData>) => {
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
              const realId = `c-node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

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
                <span className="font-semibold text-white">Crafter</span>
                <div className="flex items-center bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[10px] text-green-400 font-mono cursor-pointer hover:bg-green-500/20">
                    v7.0
                </div>
                {isSaving ? (
                    <span className="text-[10px] text-yellow-500 ml-2 animate-pulse">Saving...</span>
                ) : (
                    lastSaved && <span className="text-[10px] text-gray-500 ml-2">Saved {lastSaved}</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setIsAgentOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 text-purple-400 hover:text-purple-300 transition-colors"
                    title="AI Agent"
                >
                    <Bot size={14} />
                    <span className="text-xs">Agent</span>
                </button>

                <button
                    onClick={toggleChristmasMode}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-white/10 transition-colors ${isChristmasMode ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'}`}
                    title="va toca para alegrarte"
                >
                    <Snowflake size={14} />
                    <span className="text-xs">Navidad</span>
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
                    onClick={handleValidate}
                    className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                    title="Validate"
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
            />

            {selectedNodeId && (
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
                    type="crafter"
                    onRestore={(restoredNodes, restoredEdges) => {
                        setNodes(restoredNodes);
                        setEdges(restoredEdges);
                    }}
                />
            )}
        </div>
        
        {/* Enhanced Output Preview */}
        {!selectedNodeId && (
             <div 
                className={`absolute bottom-4 right-4 bg-surface border border-border rounded-lg shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${
                    isOutputExpanded ? 'w-[400px] h-[500px]' : 'w-72 h-auto'
                }`}
             >
                {/* Header */}
                <div 
                    className="flex justify-between items-center p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
                    onClick={() => setIsOutputExpanded(!isOutputExpanded)}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-gray-200">Final Output</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        {isOutputExpanded ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
                    </div>
                </div>

                {/* Content */}
                {isOutputExpanded ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 p-2 bg-black/20 text-[10px] text-gray-400">
                             <span className="px-2 py-0.5 rounded bg-white/5">email_html</span>
                             <span className="px-2 py-0.5 rounded bg-white/5">12kb</span>
                        </div>
                        <div className="flex-1 bg-[#111] p-4 overflow-auto font-mono text-xs text-gray-300">
                            <p className="text-gray-500 italic mb-2">&lt;!-- Preview of generated email --&gt;</p>
                            <p>Subject: Optimizing your cloud spend</p>
                            <br/>
                            <p>Hi [Name],</p>
                            <p>We noticed your team is scaling...</p>
                        </div>
                        
                        {/* Actions Footer */}
                        <div className="p-3 border-t border-white/5 flex items-center justify-between bg-surfaceHighlight rounded-b-lg">
                             <div className="flex gap-2">
                                 <button className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 transition-colors">
                                     <Copy size={12} /> Copy
                                 </button>
                                 <button className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-gray-300 transition-colors">
                                     <GitCompare size={12} /> Diff
                                 </button>
                             </div>
                             <button className="flex items-center gap-1 px-3 py-1.5 rounded bg-accent/20 hover:bg-accent/30 text-accent text-xs font-medium transition-colors">
                                 <Download size={12} /> Export
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 text-[10px] text-gray-500 italic flex justify-between items-center">
                        <span>Ready to export</span>
                        <span className="text-xs text-gray-400">2 files generated</span>
                    </div>
                )}
             </div>
        )}
    </div>
  );
};