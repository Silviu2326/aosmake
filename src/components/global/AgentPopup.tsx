import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Code2, ChevronUp, ChevronDown, CheckSquare, Square, Hammer, Check, HelpCircle, Edit } from 'lucide-react';
import { Node, Edge } from 'reactflow';

export interface AgentAction {
    type: 'createNode' | 'updateNode' | 'deleteNode' | 'createEdge';
    payload: any;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    actions?: AgentAction[]; // Store actions with the message for history
}

interface AgentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    edges: Edge[];
    onApplyActions?: (actions: AgentAction[]) => void;
}

export const AgentPopup: React.FC<AgentPopupProps> = ({ isOpen, onClose, nodes, edges, onApplyActions }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'I am your Workflow Agent. I can analyze your graph structure. What do you need?', timestamp: Date.now() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [mode, setMode] = useState<'question' | 'action' | 'edit-node'>('question');
    const [pendingActions, setPendingActions] = useState<AgentAction[] | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, pendingActions]);

    const toggleNodeSelection = (id: string) => {
        setSelectedNodeIds(prev =>
            prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
        );
    };

    const handleAcceptActions = () => {
        if (pendingActions && onApplyActions) {
            onApplyActions(pendingActions);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Changes have been applied successfully.',
                timestamp: Date.now()
            }]);
            setPendingActions(null);
        }
    };

    const handleRejectActions = () => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Changes were rejected.',
            timestamp: Date.now()
        }]);
        setPendingActions(null);
    };

    const getModeColor = (m: typeof mode) => {
        switch (m) {
            case 'action': return 'text-orange-400 bg-orange-500/10';
            case 'edit-node': return 'text-blue-400 bg-blue-500/10';
            default: return 'text-purple-400 bg-purple-500/10';
        }
    };

    const getModeBorderColor = (m: typeof mode) => {
        switch (m) {
            case 'action': return 'border-orange-500/30 focus:border-orange-500';
            case 'edit-node': return 'border-blue-500/30 focus:border-blue-500';
            default: return 'border-white/10 focus:border-purple-500/50';
        }
    };

    const getModeBtnColor = (m: typeof mode) => {
        switch (m) {
            case 'action': return 'bg-orange-500 hover:bg-orange-600';
            case 'edit-node': return 'bg-blue-500 hover:bg-blue-600';
            default: return 'bg-purple-600 hover:bg-purple-500';
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // Construct context with current graph state
        const graphContext = JSON.stringify({
            nodes: nodes.map(n => ({ id: n.id, label: n.data.label, type: n.data.type, ...n.data })),
            edges: edges.map(e => ({ source: e.source, target: e.target })),
            focusedNodeIds: selectedNodeIds
        }, null, 2);

        let systemInstruction = "";
        if (mode === 'action') {
            systemInstruction = `
You are in ACTION MODE. You can modify the graph structure.
If the user asks for changes, output a STRICT JSON block inside \`\`\`json ... \`\`\` with the following structure:
{
  "actions": [
    { 
      "type": "createNode", 
      "payload": { 
        "id": "new_node_1",
        "label": "Name", 
        "type": "LLM", 
        "x": 100, 
        "y": 100,
        "systemPrompt": "You are...",
        "userPrompt": "Task..." 
      } 
    },
    { "type": "updateNode", "payload": { "id": "node_id", "data": { "label": "New Name" } } },
    { "type": "deleteNode", "payload": { "id": "node_id" } },
    { "type": "createEdge", "payload": { "source": "source_id", "target": "new_node_1" } }
  ]
}
IMPORTANT:
1. When creating a node, ALWAYS populate 'systemPrompt' and 'userPrompt' in the payload based on the user's intent.
2. If the new node logically follows an existing node, YOU MUST ALSO generate a 'createEdge' action to connect them.
3. Assign a temporary \`id\` (e.g., 'new_node_1') to new nodes and use it in \`createEdge\` to link them.
4. Do not include the JSON block if no changes are needed. Just reply normally.
`;
        } else if (mode === 'edit-node') {
            systemInstruction = `
You are in NODE EDITOR MODE. Your ONLY job is to UPDATE existing nodes based on the user's request.
You CANNOT create or delete nodes, or modify edges.
Output a STRICT JSON block inside \`\`\`json ... \`\`\` with the following structure:
{
  "actions": [
    { "type": "updateNode", "payload": { "id": "node_id", "data": { "label": "New Name", "userPrompt": "...", "systemPrompt": "...", "schema": {...} } } }
  ]
}
IMPORTANT:
1. Only generate 'updateNode' actions.
2. You can update 'label', 'userPrompt', 'systemPrompt', 'schema' (for structured output) or other data fields inside 'data'.
3. The 'schema' field should be a JSON object (not a string) that defines the structured output format.
4. Focus on the nodes specified in the user request or the focused nodes.
5. Do not include the JSON block if no changes are needed.
`;
        }

        const fullContent = `${systemInstruction}\nCurrent Graph Structure:\n${graphContext}\n\nUser Request: ${inputValue}`;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('https://backendaos-production.up.railway.app/api/workflows/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: fullContent })
            });

            const data = await response.json();

            if (data.success) {
                let output = data.output;
                let extractedActions: AgentAction[] | null = null;

                // Extract JSON block
                const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[1]);
                        if (parsed.actions && Array.isArray(parsed.actions)) {
                            extractedActions = parsed.actions;
                            // Remove the JSON block from the display message to keep it clean
                            output = output.replace(/```json\n[\s\S]*?\n```/, '(Proposed changes below...)').trim();
                        }
                    } catch (e) {
                        console.error("Failed to parse agent actions", e);
                    }
                }

                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: output,
                    timestamp: Date.now(),
                    actions: extractedActions || undefined
                };
                setMessages(prev => [...prev, aiMsg]);

                if (extractedActions) {
                    setPendingActions(extractedActions);
                }

            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-[600px] h-[600px] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="h-14 border-b border-white/5 bg-surface flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${getModeColor(mode)}`}>
                            <Bot size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">Graph Agent</div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMode('question')}
                                    className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${mode === 'question' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <HelpCircle size={10} /> Q&A
                                </button>
                                <div className="w-px h-3 bg-white/10" />
                                <button
                                    onClick={() => setMode('edit-node')}
                                    className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${mode === 'edit-node' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <Edit size={10} /> Edit Node
                                </button>
                                <div className="w-px h-3 bg-white/10" />
                                <button
                                    onClick={() => setMode('action')}
                                    className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${mode === 'action' ? 'bg-orange-500/20 text-orange-300' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <Hammer size={10} /> Doer
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0D0D0D]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? getModeColor(mode) : 'bg-white/10 text-gray-300'}`}>
                                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className={`p-3 rounded-lg text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-surface border border-white/5 text-gray-300' : 'bg-purple-600/20 border border-purple-500/20 text-purple-100'} whitespace-pre-wrap`}>
                                    {msg.content}
                                </div>
                            </div>

                            {/* Action Proposal Preview in History (Optional, or just show pending) */}
                            {msg.actions && (
                                <div className="ml-11 bg-orange-500/5 border border-orange-500/20 rounded p-2 text-[10px] text-orange-300 w-fit">
                                    <div className="font-semibold mb-1 flex items-center gap-1"><Hammer size={10} /> Proposed Actions:</div>
                                    <ul className="list-disc list-inside opacity-80">
                                        {msg.actions.map((act, i) => (
                                            <li key={i}>{act.type}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${getModeColor(mode)}`}>
                                <Bot size={16} />
                            </div>
                            <div className="bg-surface border border-white/5 px-4 py-3 rounded-lg flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Pending Action Confirmation Overlay */}
                {pendingActions && (
                    <div className="absolute bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-orange-500/30 p-4 z-30 flex flex-col gap-3 animate-[slideInUp_0.2s_ease-out]">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-orange-400 flex items-center gap-2">
                                <Hammer size={14} />
                                Review Proposed Changes ({pendingActions.length})
                            </div>
                        </div>
                        <div className="max-h-[100px] overflow-y-auto bg-black/20 rounded p-2 border border-white/5">
                            {pendingActions.map((action, i) => (
                                <div key={i} className="text-[10px] text-gray-300 font-mono mb-1 last:mb-0">
                                    <span className="text-blue-400">{action.type}</span>: {JSON.stringify(action.payload)}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRejectActions}
                                className="flex-1 py-2 rounded border border-white/10 text-gray-400 hover:bg-white/5 text-xs font-medium transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleAcceptActions}
                                className="flex-1 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Check size={14} /> Accept & Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* Node Selector (Dropdown) */}
                {isDropdownOpen && !pendingActions && (
                    <div className="absolute bottom-[72px] left-0 right-0 bg-[#1A1A1A] border-t border-white/20 max-h-[150px] overflow-y-auto p-3 shadow-2xl z-40 animate-[slideInUp_0.1s_ease-out]">
                        <div className="text-[11px] text-gray-400 font-semibold mb-3 px-2">SELECT NODES TO FOCUS</div>
                        <div className="grid grid-cols-2 gap-2">
                            {nodes.map(node => (
                                <button
                                    key={node.id}
                                    onClick={() => toggleNodeSelection(node.id)}
                                    className={`flex items-center gap-2 p-2.5 rounded text-left text-xs transition-colors ${selectedNodeIds.includes(node.id)
                                        ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50 font-medium'
                                        : 'bg-[#0D0D0D] text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {selectedNodeIds.includes(node.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                                    <span className="truncate">{node.data.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                {!pendingActions && (
                    <div className="bg-surface border-t border-white/5 flex flex-col relative z-20">
                        <div className="p-4 relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={mode === 'action' ? "Describe changes to make..." : (mode === 'edit-node' ? "How should I update the nodes?" : "Ask about your workflow...")}
                                className={`w-full bg-[#0D0D0D] border rounded-full py-3 pl-12 pr-12 text-sm text-white focus:outline-none placeholder-gray-600 transition-colors ${getModeBorderColor(mode)}`}
                            />
                            {/* Node Selector Button */}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${selectedNodeIds.length > 0
                                    ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                    : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                                    }`}
                                title={selectedNodeIds.length > 0 ? `${selectedNodeIds.length} nodes focused` : "Select nodes for context"}
                            >
                                {isDropdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            {/* Send Button */}
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ${getModeBtnColor(mode)}`}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
