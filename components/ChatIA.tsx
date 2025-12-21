import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, CheckSquare, Square, Database } from 'lucide-react';
import { useConsole } from '../context/ConsoleContext';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatIAProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChatIA: React.FC<ChatIAProps> = ({ isOpen, onClose }) => {
    const { executionContext = [] } = useConsole();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you with your workflow today?', timestamp: Date.now() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedContextIds, setSelectedContextIds] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const toggleContext = (id: string) => {
        setSelectedContextIds(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        // Build context string
        let contextString = '';
        if (selectedContextIds.length > 0) {
            const contextData = executionContext
                .filter(item => selectedContextIds.includes(item.id))
                .map(item => {
                    let text = `=== NODE: ${item.label} ===\n`;
                    if (item.inputs) {
                        text += `[INPUTS]\nSystem Prompt: ${item.inputs.systemPrompt || '(none)'}\nUser Prompt: ${item.inputs.userPrompt || '(none)'}\n`;
                    }
                    text += `[OUTPUT]\n${typeof item.data === 'string' ? item.data : JSON.stringify(item.data, null, 2)}`;
                    return text;
                })
                .join('\n\n');
            if (contextData) {
                contextString = `--- CONTEXT ---\n${contextData}\n---------------\n\n`;
            }
        }

        const fullContent = contextString + inputValue;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: fullContent,
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
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.output,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
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

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'success': return 'bg-green-500';
            case 'running': return 'bg-blue-500 animate-pulse';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-600';
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
        <div className="fixed inset-0 z-[60] flex items-end justify-end pointer-events-none p-6">
            <div className="w-[400px] h-[600px] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden pointer-events-auto animate-[slideInUp_0.3s_ease-out]">
                {/* Header */}
                <div className="h-14 border-b border-white/5 bg-surface flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Bot size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">Assistant</div>
                            <div className="text-[10px] text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
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
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-accent/10 text-accent' : 'bg-white/10 text-gray-300'}`}>
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>
                            <div className={`max-w-[80%] p-3 rounded-lg text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-surface border border-white/5 text-gray-300' : 'bg-accent text-white'} whitespace-pre-wrap`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                         <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center text-accent">
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

                {/* Context Selector & Input */}
                <div className="bg-surface border-t border-white/5 flex flex-col">
                    {/* Context Toggles */}
                    {executionContext.length > 0 && (
                        <div className="px-4 py-2 border-b border-white/5 flex flex-wrap gap-2 max-h-[100px] overflow-y-auto custom-scrollbar">
                            <div className="w-full text-[10px] text-gray-500 font-semibold mb-1 flex items-center gap-1">
                                <Database size={10} /> ATTACH CONTEXT
                            </div>
                            {executionContext.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => toggleContext(item.id)}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] transition-colors ${
                                        selectedContextIds.includes(item.id) 
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                        : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/30'
                                    }`}
                                >
                                    {selectedContextIds.includes(item.id) ? <CheckSquare size={10} /> : <Square size={10} />}
                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(item.status)}`} />
                                    <span className="truncate max-w-[100px]">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="p-4 relative">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..." 
                            className="w-full bg-[#0D0D0D] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:border-accent focus:outline-none placeholder-gray-600 transition-colors"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};