import React, { useState, useEffect, useMemo } from 'react';
import { X, FileOutput, Plus, Trash2, Download, ArrowRight, GripVertical } from 'lucide-react';
import { NodeData } from '../../types';

interface FieldMapping {
    id: string;
    csvColumn: string;
    sourceNodeId: string;
    sourceField: string;
}

interface CsvOutputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mappings: FieldMapping[]) => void;
    initialMappings: FieldMapping[];
    nodeLabel: string;
    availableNodes: NodeData[];
    executionResults: Record<string, any>;
}

export const CsvOutputModal: React.FC<CsvOutputModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialMappings,
    nodeLabel,
    availableNodes,
    executionResults
}) => {
    const [mappings, setMappings] = useState<FieldMapping[]>(initialMappings.length > 0 ? initialMappings : [
        { id: `map_${Date.now()}`, csvColumn: 'column1', sourceNodeId: '', sourceField: '' }
    ]);

    useEffect(() => {
        if (initialMappings.length > 0) {
            setMappings(initialMappings);
        }
    }, [initialMappings]);

    // Extract available fields from each node based on its schema or output
    const getNodeFields = (node: NodeData): string[] => {
        const fields: string[] = ['output']; // Always include raw output

        // Try to get fields from schema
        if (node.schema) {
            try {
                const schema = typeof node.schema === 'string' ? JSON.parse(node.schema) : node.schema;
                if (schema.properties) {
                    fields.push(...Object.keys(schema.properties));
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Try to get fields from execution results
        const result = executionResults[node.id];
        if (result) {
            const output = result.output || result;
            if (typeof output === 'object' && output !== null) {
                fields.push(...Object.keys(output).filter(k => !fields.includes(k)));
            }
        }

        return [...new Set(fields)];
    };

    const addMapping = () => {
        setMappings([...mappings, {
            id: `map_${Date.now()}`,
            csvColumn: `column${mappings.length + 1}`,
            sourceNodeId: '',
            sourceField: ''
        }]);
    };

    const removeMapping = (id: string) => {
        if (mappings.length > 1) {
            setMappings(mappings.filter(m => m.id !== id));
        }
    };

    const updateMapping = (id: string, field: keyof FieldMapping, value: string) => {
        setMappings(mappings.map(m => {
            if (m.id === id) {
                const updated = { ...m, [field]: value };
                // Reset sourceField when changing sourceNodeId
                if (field === 'sourceNodeId') {
                    updated.sourceField = '';
                }
                return updated;
            }
            return m;
        }));
    };

    const generatePreview = useMemo(() => {
        if (mappings.length === 0 || !mappings.some(m => m.sourceNodeId && m.sourceField)) {
            return null;
        }

        const headers = mappings.map(m => m.csvColumn);
        const rows: string[][] = [];

        // Try to generate a sample row from execution results
        const sampleRow = mappings.map(m => {
            if (!m.sourceNodeId || !m.sourceField) return '';
            const result = executionResults[m.sourceNodeId];
            if (!result) return '[no data]';

            const output = result.output || result;
            if (m.sourceField === 'output') {
                return typeof output === 'object' ? JSON.stringify(output) : String(output);
            }

            if (typeof output === 'object' && output !== null) {
                const value = output[m.sourceField];
                return value !== undefined ? String(value) : '[undefined]';
            }
            return '[no data]';
        });

        if (sampleRow.some(v => v !== '' && v !== '[no data]' && v !== '[undefined]')) {
            rows.push(sampleRow);
        }

        return { headers, rows };
    }, [mappings, executionResults]);

    const handleExport = () => {
        if (!generatePreview) return;

        const { headers, rows } = generatePreview;
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nodeLabel.replace(/\s+/g, '_')}_output.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSave = () => {
        onSave(mappings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[700px] max-h-[85vh] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <FileOutput size={18} className="text-orange-400" />
                        <span className="text-white font-semibold">{nodeLabel}</span>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">CSV Output Mapping</span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {/* Mapping Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-300">Field Mappings</h3>
                            <button
                                onClick={addMapping}
                                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-2 py-1 rounded transition-colors"
                            >
                                <Plus size={12} /> Add Column
                            </button>
                        </div>

                        <div className="space-y-2">
                            {/* Header Row */}
                            <div className="grid grid-cols-[auto_1fr_auto_1fr_1fr_auto] gap-2 text-[10px] text-gray-500 uppercase font-semibold px-2">
                                <div className="w-4"></div>
                                <div>CSV Column</div>
                                <div></div>
                                <div>Source Node</div>
                                <div>Field</div>
                                <div className="w-8"></div>
                            </div>

                            {/* Mapping Rows */}
                            {mappings.map((mapping, index) => {
                                const selectedNode = availableNodes.find(n => n.id === mapping.sourceNodeId);
                                const availableFields = selectedNode ? getNodeFields(selectedNode) : [];

                                return (
                                    <div
                                        key={mapping.id}
                                        className="grid grid-cols-[auto_1fr_auto_1fr_1fr_auto] gap-2 items-center bg-white/5 rounded-lg p-2 border border-white/5 hover:border-white/10 transition-colors"
                                    >
                                        <GripVertical size={14} className="text-gray-600 cursor-grab" />

                                        <input
                                            type="text"
                                            value={mapping.csvColumn}
                                            onChange={(e) => updateMapping(mapping.id, 'csvColumn', e.target.value)}
                                            className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50"
                                            placeholder="Column name"
                                        />

                                        <ArrowRight size={14} className="text-gray-600" />

                                        <select
                                            value={mapping.sourceNodeId}
                                            onChange={(e) => updateMapping(mapping.id, 'sourceNodeId', e.target.value)}
                                            className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50 appearance-none"
                                        >
                                            <option value="">Select node...</option>
                                            {availableNodes.map(node => (
                                                <option key={node.id} value={node.id}>{node.label}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={mapping.sourceField}
                                            onChange={(e) => updateMapping(mapping.id, 'sourceField', e.target.value)}
                                            disabled={!mapping.sourceNodeId}
                                            className="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50 appearance-none disabled:opacity-50"
                                        >
                                            <option value="">Select field...</option>
                                            {availableFields.map(field => (
                                                <option key={field} value={field}>{field}</option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => removeMapping(mapping.id)}
                                            disabled={mappings.length <= 1}
                                            className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preview Section */}
                    {generatePreview && generatePreview.rows.length > 0 && (
                        <div className="space-y-2 pt-4 border-t border-white/10">
                            <h3 className="text-sm font-medium text-gray-300">Preview</h3>
                            <div className="overflow-auto max-h-[200px] rounded border border-white/10">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-white/5">
                                            {generatePreview.headers.map((header, i) => (
                                                <th key={i} className="border border-white/10 px-3 py-2 text-left text-orange-400 font-medium">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {generatePreview.rows.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, colIndex) => (
                                                    <td key={colIndex} className="border border-white/10 px-3 py-2 text-gray-300 truncate max-w-[200px]">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-[10px] text-gray-500">
                                Preview shows data from the last workflow execution. Run the workflow to see actual values.
                            </p>
                        </div>
                    )}

                    {(!generatePreview || generatePreview.rows.length === 0) && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            <FileOutput size={32} className="mx-auto mb-2 opacity-30" />
                            <p>Configure mappings and run the workflow to preview output</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
                    <div className="text-xs text-gray-500">
                        {mappings.length} column{mappings.length !== 1 ? 's' : ''} configured
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExport}
                            disabled={!generatePreview || generatePreview.rows.length === 0}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={12} /> Export CSV
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                        >
                            Save Mapping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
