import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, Plus, Wand2, Layers, Trash2, GripVertical, ChevronDown, ChevronRight, Copy, FileJson, Link, Unlink } from 'lucide-react';

interface AvailableVariable {
    nodeId: string;
    nodeLabel: string;
    nodeType?: string;
    fields: string[];
}

interface FieldSource {
    id: string;
    nodeId: string;
    field: string;
}

interface FieldMapping {
    id: string;
    jsonKey: string;
    sources: FieldSource[]; // Multiple sources for concatenation
    separator: string;
}

interface JsonEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (json: string) => void;
    initialValue: string;
    nodeLabel: string;
    availableVariables?: AvailableVariable[];
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({ isOpen, onClose, onSave, initialValue, nodeLabel, availableVariables = [] }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'editor' | 'builder'>('editor');
    const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue || '{\n  \n}');
            setError(null);
            setExpandedNodes(new Set(availableVariables.map(v => v.nodeId)));
        }
    }, [isOpen, initialValue, availableVariables]);

    const handleSave = () => {
        try {
            const testValue = value.replace(/\{\{[^}]+\}\}/g, '"__VAR__"');
            JSON.parse(testValue);
            onSave(value);
            onClose();
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const handleInsertVariable = (variable: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);
        const insertion = `"{{${variable}}}"`;

        setValue(before + insertion + after);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertion.length, start + insertion.length);
        }, 0);
    };

    const handleInsertAsKey = (variable: string, fieldName: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(start, text.length);
        const insertion = `"${fieldName}": "{{${variable}}}"`;

        setValue(before + insertion + after);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + insertion.length, start + insertion.length);
        }, 0);
    };

    // Builder functions
    const addFieldMapping = () => {
        setFieldMappings([...fieldMappings, {
            id: `field_${Date.now()}`,
            jsonKey: '',
            sources: [{ id: `src_${Date.now()}`, nodeId: '', field: '' }],
            separator: '\\n\\n'
        }]);
    };

    const updateFieldMapping = (id: string, updates: Partial<FieldMapping>) => {
        setFieldMappings(fieldMappings.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const addSourceToField = (mappingId: string) => {
        setFieldMappings(fieldMappings.map(m => {
            if (m.id === mappingId) {
                return {
                    ...m,
                    sources: [...m.sources, { id: `src_${Date.now()}`, nodeId: '', field: '' }]
                };
            }
            return m;
        }));
    };

    const updateSource = (mappingId: string, sourceId: string, updates: Partial<FieldSource>) => {
        setFieldMappings(fieldMappings.map(m => {
            if (m.id === mappingId) {
                return {
                    ...m,
                    sources: m.sources.map(s => s.id === sourceId ? { ...s, ...updates } : s)
                };
            }
            return m;
        }));
    };

    const removeSource = (mappingId: string, sourceId: string) => {
        setFieldMappings(fieldMappings.map(m => {
            if (m.id === mappingId && m.sources.length > 1) {
                return {
                    ...m,
                    sources: m.sources.filter(s => s.id !== sourceId)
                };
            }
            return m;
        }));
    };

    const removeFieldMapping = (id: string) => {
        setFieldMappings(fieldMappings.filter(m => m.id !== id));
    };

    const generateJsonFromMappings = () => {
        const jsonObj: Record<string, string> = {};
        fieldMappings.forEach(m => {
            if (m.jsonKey && m.sources.some(s => s.nodeId && s.field)) {
                const validSources = m.sources.filter(s => s.nodeId && s.field);
                if (validSources.length === 1) {
                    jsonObj[m.jsonKey] = `{{${validSources[0].nodeId}.${validSources[0].field}}}`;
                } else {
                    // Concatenate multiple sources
                    const separator = m.separator.replace(/\\n/g, '\n');
                    jsonObj[m.jsonKey] = validSources.map(s => `{{${s.nodeId}.${s.field}}}`).join(separator);
                }
            }
        });
        const generated = JSON.stringify(jsonObj, null, 2);
        setValue(generated);
        setMode('editor');
    };

    const addQuickConcatField = (fieldName: string) => {
        // Find all nodes that have a field with this name and create a concat mapping
        const sourcesWithField = availableVariables
            .filter(node => node.fields.includes(fieldName))
            .map(node => ({
                id: `src_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                nodeId: node.nodeId,
                field: fieldName
            }));

        if (sourcesWithField.length > 0) {
            setFieldMappings([...fieldMappings, {
                id: `field_${Date.now()}`,
                jsonKey: fieldName,
                sources: sourcesWithField,
                separator: '\\n\\n'
            }]);
        }
    };

    // Find common fields across nodes for quick concatenation
    const getCommonFields = () => {
        if (availableVariables.length < 2) return [];

        const fieldCounts: Record<string, number> = {};
        availableVariables.forEach(node => {
            node.fields.forEach(field => {
                fieldCounts[field] = (fieldCounts[field] || 0) + 1;
            });
        });

        return Object.entries(fieldCounts)
            .filter(([_, count]) => count >= 2)
            .map(([field]) => field);
    };

    const toggleNodeExpanded = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const getNodeTypeBadge = (nodeType?: string) => {
        if (nodeType === 'CSV_INPUT') return <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded">CSV</span>;
        if (nodeType === 'JSON' || nodeType === 'JSON_BUILDER') return <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-1 rounded">JSON</span>;
        return <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1 rounded">Schema</span>;
    };

    const getFieldColor = (nodeType?: string) => {
        if (nodeType === 'CSV_INPUT') return 'text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10';
        if (nodeType === 'JSON' || nodeType === 'JSON_BUILDER') return 'text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-500/10';
        return 'text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10';
    };

    const getPreviewValue = (mapping: FieldMapping): string => {
        const validSources = mapping.sources.filter(s => s.nodeId && s.field);
        if (validSources.length === 0) return '—';
        if (validSources.length === 1) {
            return `{{${validSources[0].nodeId}.${validSources[0].field}}}`;
        }
        const sep = mapping.separator.replace(/\\n/g, '↵');
        return validSources.map(s => `{{${s.nodeId}.${s.field}}}`).join(sep);
    };

    if (!isOpen) return null;

    const commonFields = getCommonFields();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-[1100px] h-[750px] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-surface">
                    <div className="flex items-center gap-3">
                        <FileJson size={18} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-white">{nodeLabel}</span>
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded">JSON Builder</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-white/5 rounded-lg p-0.5 mr-2">
                            <button
                                onClick={() => setMode('editor')}
                                className={`px-3 py-1.5 rounded text-xs transition-colors ${mode === 'editor' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setMode('builder')}
                                className={`px-3 py-1.5 rounded text-xs transition-colors ${mode === 'builder' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <span className="flex items-center gap-1">
                                    <Wand2 size={12} /> Builder
                                </span>
                            </button>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 flex overflow-hidden">
                    {mode === 'editor' ? (
                        <>
                            {/* Editor */}
                            <div className="flex-1 relative flex flex-col">
                                <textarea
                                    ref={textareaRef}
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                        setError(null);
                                    }}
                                    className="flex-1 w-full bg-[#0D0D0D] text-green-400 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed"
                                    spellCheck={false}
                                    placeholder='{\n  "field": "{{nodeId.field}}"\n}'
                                />
                                {error && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded flex items-center gap-2 pointer-events-none">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            {availableVariables.length > 0 && (
                                <div className="w-[280px] border-l border-white/5 bg-surface/50 flex flex-col">
                                    <div className="p-3 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Variables
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {availableVariables.map(node => (
                                            <div key={node.nodeId} className="border-b border-white/5">
                                                <button
                                                    onClick={() => toggleNodeExpanded(node.nodeId)}
                                                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {expandedNodes.has(node.nodeId) ? <ChevronDown size={12} className="text-gray-500" /> : <ChevronRight size={12} className="text-gray-500" />}
                                                        <span className="text-xs text-gray-300 font-medium truncate max-w-[140px]">{node.nodeLabel}</span>
                                                    </div>
                                                    {getNodeTypeBadge(node.nodeType)}
                                                </button>
                                                {expandedNodes.has(node.nodeId) && (
                                                    <div className="px-3 pb-3 space-y-1">
                                                        {node.fields.map(field => (
                                                            <div key={field} className="flex gap-1">
                                                                <button
                                                                    onClick={() => handleInsertVariable(`${node.nodeId}.${field}`)}
                                                                    className={`flex-1 text-left px-2 py-1.5 rounded bg-black/40 border border-white/5 text-[10px] transition-all flex items-center gap-1 group truncate ${getFieldColor(node.nodeType)}`}
                                                                    title={`Insert "{{${node.nodeId}.${field}}}"`}
                                                                >
                                                                    <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                                    <span className="truncate">{field}</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleInsertAsKey(`${node.nodeId}.${field}`, field)}
                                                                    className="px-1.5 rounded bg-black/40 border border-white/5 text-[10px] text-gray-500 hover:text-white hover:border-white/20 transition-all"
                                                                    title="Insert as key-value"
                                                                >
                                                                    <Copy size={10} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Builder Mode */
                        <div className="flex-1 flex flex-col p-4 overflow-hidden">
                            {/* Quick Actions */}
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <button
                                    onClick={addFieldMapping}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs transition-colors"
                                >
                                    <Plus size={12} /> Add Field
                                </button>

                                {/* Quick concat buttons for common fields */}
                                {commonFields.length > 0 && (
                                    <>
                                        <div className="w-px h-6 bg-white/10 mx-1" />
                                        <span className="text-[10px] text-gray-500">Quick concat:</span>
                                        {commonFields.slice(0, 5).map(field => (
                                            <button
                                                key={field}
                                                onClick={() => addQuickConcatField(field)}
                                                className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-[10px] transition-colors"
                                                title={`Concatenate all "${field}" fields`}
                                            >
                                                <Link size={10} /> {field}
                                            </button>
                                        ))}
                                    </>
                                )}

                                <div className="flex-1" />
                                <button
                                    onClick={generateJsonFromMappings}
                                    disabled={fieldMappings.length === 0}
                                    className="flex items-center gap-1 px-4 py-1.5 rounded bg-green-500 hover:bg-green-600 text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Wand2 size={12} /> Generate JSON
                                </button>
                            </div>

                            {/* Field Mappings */}
                            <div className="flex-1 overflow-auto space-y-3">
                                {fieldMappings.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 border border-white/10 border-dashed rounded-lg">
                                        <Layers size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm mb-2">No fields configured</p>
                                        <p className="text-xs text-gray-600 text-center max-w-md mb-4">
                                            Create a field and add multiple sources to concatenate them.
                                            <br />
                                            Example: Combine hook + bridge + body + CTA into one "email_body" field.
                                        </p>
                                        {commonFields.length > 0 && (
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                <span className="text-[10px] text-gray-500">Quick start - concat common fields:</span>
                                                {commonFields.map(field => (
                                                    <button
                                                        key={field}
                                                        onClick={() => addQuickConcatField(field)}
                                                        className="px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs transition-colors"
                                                    >
                                                        <Link size={10} className="inline mr-1" /> Concat all "{field}"
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    fieldMappings.map((mapping) => (
                                        <div key={mapping.id} className="border border-white/10 rounded-lg bg-black/20 overflow-hidden">
                                            {/* Field Header */}
                                            <div className="flex items-center gap-3 p-3 bg-white/5 border-b border-white/10">
                                                <GripVertical size={14} className="text-gray-600 cursor-grab" />
                                                <div className="flex-1 flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-500 uppercase">JSON Key:</span>
                                                    <input
                                                        type="text"
                                                        value={mapping.jsonKey}
                                                        onChange={(e) => updateFieldMapping(mapping.id, { jsonKey: e.target.value })}
                                                        className="flex-1 max-w-[200px] bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                                        placeholder="email_body"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-gray-500">Separator:</span>
                                                    <select
                                                        value={mapping.separator}
                                                        onChange={(e) => updateFieldMapping(mapping.id, { separator: e.target.value })}
                                                        className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
                                                    >
                                                        <option value="\\n\\n">Double newline</option>
                                                        <option value="\\n">Single newline</option>
                                                        <option value=" ">Space</option>
                                                        <option value="">None</option>
                                                        <option value="\\n---\\n">--- divider</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => removeFieldMapping(mapping.id)}
                                                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            {/* Sources */}
                                            <div className="p-3 space-y-2">
                                                <div className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-2">
                                                    <Link size={10} />
                                                    Sources to concatenate ({mapping.sources.length})
                                                </div>
                                                {mapping.sources.map((source, idx) => {
                                                    const selectedNode = availableVariables.find(n => n.nodeId === source.nodeId);
                                                    const availableFields = selectedNode?.fields || [];

                                                    return (
                                                        <div key={source.id} className="flex items-center gap-2">
                                                            <span className="text-[10px] text-gray-600 w-4">{idx + 1}.</span>
                                                            <select
                                                                value={source.nodeId}
                                                                onChange={(e) => updateSource(mapping.id, source.id, { nodeId: e.target.value, field: '' })}
                                                                className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                                                            >
                                                                <option value="">Select node...</option>
                                                                {availableVariables.map(node => (
                                                                    <option key={node.nodeId} value={node.nodeId}>{node.nodeLabel}</option>
                                                                ))}
                                                            </select>
                                                            <select
                                                                value={source.field}
                                                                onChange={(e) => updateSource(mapping.id, source.id, { field: e.target.value })}
                                                                disabled={!source.nodeId}
                                                                className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50 appearance-none disabled:opacity-50"
                                                            >
                                                                <option value="">Select field...</option>
                                                                {availableFields.map(field => (
                                                                    <option key={field} value={field}>{field}</option>
                                                                ))}
                                                            </select>
                                                            {source.nodeId && source.field && (
                                                                <code className="text-[9px] text-green-400 font-mono bg-black/40 px-1.5 py-1 rounded truncate max-w-[150px]">
                                                                    {`{{${source.nodeId}.${source.field}}}`}
                                                                </code>
                                                            )}
                                                            {mapping.sources.length > 1 && (
                                                                <button
                                                                    onClick={() => removeSource(mapping.id, source.id)}
                                                                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Unlink size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => addSourceToField(mapping.id)}
                                                    className="w-full mt-2 py-1.5 border border-dashed border-white/10 rounded text-[10px] text-gray-500 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Plus size={10} /> Add another source to concatenate
                                                </button>
                                            </div>

                                            {/* Preview */}
                                            {mapping.sources.some(s => s.nodeId && s.field) && (
                                                <div className="px-3 pb-3">
                                                    <div className="text-[10px] text-gray-500 mb-1">Preview:</div>
                                                    <code className="block text-[10px] text-green-400 font-mono bg-black/40 p-2 rounded break-all">
                                                        "{mapping.jsonKey || 'field'}": "{getPreviewValue(mapping)}"
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Final Preview */}
                            {fieldMappings.length > 0 && fieldMappings.some(m => m.sources.some(s => s.nodeId && s.field)) && (
                                <div className="mt-4 p-3 bg-black/30 border border-white/10 rounded-lg flex-shrink-0">
                                    <div className="text-[10px] text-gray-500 uppercase mb-2">Final JSON Preview</div>
                                    <pre className="text-xs text-green-400 font-mono overflow-auto max-h-24">
                                        {JSON.stringify(
                                            fieldMappings.reduce((acc, m) => {
                                                if (m.jsonKey && m.sources.some(s => s.nodeId && s.field)) {
                                                    const validSources = m.sources.filter(s => s.nodeId && s.field);
                                                    if (validSources.length === 1) {
                                                        acc[m.jsonKey] = `{{${validSources[0].nodeId}.${validSources[0].field}}}`;
                                                    } else {
                                                        const separator = m.separator.replace(/\\n/g, '\n');
                                                        acc[m.jsonKey] = validSources.map(s => `{{${s.nodeId}.${s.field}}}`).join(separator);
                                                    }
                                                }
                                                return acc;
                                            }, {} as Record<string, string>),
                                            null,
                                            2
                                        )}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-surface flex justify-between items-center z-10">
                    <div className="text-xs text-gray-500">
                        {mode === 'editor' && 'Use {{nodeId.field}} syntax for variables'}
                        {mode === 'builder' && `${fieldMappings.length} field${fieldMappings.length !== 1 ? 's' : ''} with ${fieldMappings.reduce((sum, m) => sum + m.sources.length, 0)} total sources`}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded border border-white/10 text-xs font-medium text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-xs font-medium text-white transition-colors flex items-center gap-2"
                        >
                            <Save size={14} />
                            Save JSON
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
