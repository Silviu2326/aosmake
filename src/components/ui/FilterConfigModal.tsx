import React, { useState, useEffect, useMemo } from 'react';
import { X, GitBranch, Check, AlertCircle } from 'lucide-react';
import { FilterCondition, NodeData } from '../../types';
import { getNodeFields } from '../../utils/nodeUtils';
import { Edge } from 'reactflow';

interface FilterConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (condition: FilterCondition) => void;
    initialCondition?: FilterCondition;
    nodeLabel: string;
    availableNodes: NodeData[];
    edges: Edge[];
    currentNodeId: string;
}

const OPERATORS = [
    { value: 'equals', label: '== (Igual a)', description: 'El valor es exactamente igual' },
    { value: 'not_equals', label: '!= (Diferente de)', description: 'El valor no es igual' },
    { value: 'contains', label: 'Contiene', description: 'El texto contiene el valor' },
    { value: 'not_contains', label: 'No contiene', description: 'El texto no contiene el valor' },
    { value: 'greater_than', label: '> (Mayor que)', description: 'El número es mayor' },
    { value: 'less_than', label: '< (Menor que)', description: 'El número es menor' },
    { value: 'is_empty', label: 'Está vacío', description: 'El campo está vacío o es null' },
    { value: 'is_not_empty', label: 'No está vacío', description: 'El campo tiene algún valor' },
];

export const FilterConfigModal: React.FC<FilterConfigModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialCondition,
    nodeLabel,
    availableNodes,
    edges,
    currentNodeId
}) => {
    const [field, setField] = useState(initialCondition?.field || '');
    const [operator, setOperator] = useState<FilterCondition['operator']>(initialCondition?.operator || 'equals');
    const [value, setValue] = useState(initialCondition?.value || '');

    useEffect(() => {
        if (initialCondition) {
            setField(initialCondition.field);
            setOperator(initialCondition.operator);
            setValue(initialCondition.value);
        } else {
            setField('');
            setOperator('equals');
            setValue('');
        }
    }, [initialCondition, isOpen]);

    // Get upstream nodes (ancestors)
    const ancestorNodes = useMemo(() => {
        if (!edges.length) return [];

        const ancestors = new Set<string>();
        const queue = [currentNodeId];
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
    }, [currentNodeId, edges, availableNodes]);

    // Get all available fields from upstream nodes
    const availableFields = useMemo(() => {
        const fields: Array<{ variable: string; displayName: string; nodeLabel: string }> = [];

        ancestorNodes.forEach(node => {
            const nodeFields = getNodeFields(node);
            nodeFields.forEach(f => {
                fields.push({
                    variable: `${node.id}.${f}`,
                    displayName: f,
                    nodeLabel: node.label
                });
            });
        });

        return fields;
    }, [ancestorNodes]);

    const handleSave = () => {
        if (!field) return;

        onSave({
            field,
            operator,
            value: operator === 'is_empty' || operator === 'is_not_empty' ? '' : value
        });
        onClose();
    };

    const needsValue = operator !== 'is_empty' && operator !== 'is_not_empty';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[500px] bg-[#111] border border-yellow-500/30 rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <GitBranch size={18} className="text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">{nodeLabel}</h3>
                            <p className="text-[10px] text-gray-500">Configurar condición de bifurcación</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Field Selection */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-medium">Campo a evaluar</label>
                        {availableFields.length > 0 ? (
                            <select
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                            >
                                <option value="">-- Seleccionar campo --</option>
                                {ancestorNodes.map(node => (
                                    <optgroup key={node.id} label={node.label}>
                                        {getNodeFields(node).map(f => (
                                            <option key={`${node.id}.${f}`} value={`${node.id}.${f}`}>
                                                {f}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400 flex items-center gap-2">
                                <AlertCircle size={14} />
                                No hay nodos conectados. Conecta un nodo upstream para seleccionar campos.
                            </div>
                        )}
                    </div>

                    {/* Operator Selection */}
                    <div className="space-y-2">
                        <label className="text-xs text-gray-400 font-medium">Operador</label>
                        <select
                            value={operator}
                            onChange={(e) => setOperator(e.target.value as FilterCondition['operator'])}
                            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                        >
                            {OPERATORS.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-gray-500">
                            {OPERATORS.find(op => op.value === operator)?.description}
                        </p>
                    </div>

                    {/* Value Input */}
                    {needsValue && (
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-medium">Valor a comparar</label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Introduce el valor..."
                                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Preview */}
                    {field && (
                        <div className="p-3 bg-black/30 rounded border border-white/5">
                            <p className="text-[10px] text-gray-500 mb-2">Vista previa de la condición:</p>
                            <div className="flex items-center gap-2 text-sm font-mono">
                                <span className="text-blue-400">
                                    {availableFields.find(f => f.variable === field)?.nodeLabel}.
                                    {availableFields.find(f => f.variable === field)?.displayName || field}
                                </span>
                                <span className="text-yellow-400">{OPERATORS.find(op => op.value === operator)?.label}</span>
                                {needsValue && <span className="text-green-400">"{value}"</span>}
                            </div>
                            <div className="flex gap-4 mt-3 text-[10px]">
                                <span className="text-green-500">✓ TRUE → Continúa por salida verde</span>
                                <span className="text-red-500">✗ FALSE → Continúa por salida roja</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!field}
                        className="flex items-center gap-2 px-4 py-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={14} />
                        Guardar Condición
                    </button>
                </div>
            </div>
        </div>
    );
};
