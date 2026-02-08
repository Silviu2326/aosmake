import React, { useState, useMemo } from 'react';
import { NodeData, NodeVersion } from '../../types';
import { X, Plus, History, RotateCcw, Trash2, Info, Clock, Tag, GitCompare, ArrowRight } from 'lucide-react';

interface NodeVersionModalProps {
    isOpen: boolean;
    onClose: () => void;
    node: NodeData;
    onCreateVersion: (name: string, description?: string) => void;
    onRestoreVersion: (version: NodeVersion) => void;
    onDeleteVersion: (versionId: string) => void;
}

type ViewMode = 'details' | 'compare';

export const NodeVersionModal: React.FC<NodeVersionModalProps> = ({
    isOpen,
    onClose,
    node,
    onCreateVersion,
    onRestoreVersion,
    onDeleteVersion
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [versionName, setVersionName] = useState('');
    const [versionDescription, setVersionDescription] = useState('');
    const [selectedVersion, setSelectedVersion] = useState<NodeVersion | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('details');
    const [compareVersionA, setCompareVersionA] = useState<NodeVersion | null>(null);
    const [compareVersionB, setCompareVersionB] = useState<NodeVersion | null>(null);

    // Get current node configuration as a "version" for comparison
    const currentVersion: NodeVersion = useMemo(() => ({
        id: 'current',
        name: 'Actual',
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
    }), [node.label, node.type, node.model, node.systemPrompt, node.userPrompt, node.temperature, node.recency, node.citations, node.schema, node.outputMode, node.json, node.csv, node.csvMappings, node.filterCondition, node.apiKey, node.statusFilter, node.limit, node.updateField, node.customField, node.markAsSent]);

    const versions = node.nodeVersions || [];

    // All versions including current
    const allVersions = useMemo(() => [currentVersion, ...versions], [currentVersion, versions]);

    // Detect differences between two versions
    const getDifferences = useMemo(() => (v1: NodeVersion | null, v2: NodeVersion | null) => {
        if (!v1 || !v2) return {};

        const fields = [
            'label', 'model', 'systemPrompt', 'userPrompt', 'temperature',
            'recency', 'citations', 'schema', 'outputMode', 'json', 'csv',
            'filterCondition', 'statusFilter', 'limit', 'updateField'
        ];

        const diffs: Record<string, boolean> = {};

        fields.forEach(field => {
            const val1 = (v1 as any)[field];
            const val2 = (v2 as any)[field];

            // Deep comparison for objects
            if (typeof val1 === 'object' && typeof val2 === 'object') {
                diffs[field] = JSON.stringify(val1) !== JSON.stringify(val2);
            } else {
                diffs[field] = val1 !== val2;
            }
        });

        return diffs;
    }, []);

    const differences = useMemo(() =>
        getDifferences(compareVersionA, compareVersionB),
        [getDifferences, compareVersionA, compareVersionB]
    );

    if (!isOpen) return null;

    const handleCreateVersion = () => {
        if (!versionName.trim()) return;
        onCreateVersion(versionName, versionDescription);
        setVersionName('');
        setVersionDescription('');
        setIsCreating(false);
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <History size={20} className="text-blue-400" />
                        <div>
                            <h2 className="text-lg font-semibold text-white">Versiones de Nodo</h2>
                            <p className="text-xs text-gray-500">{node.label}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex bg-black/20 p-1 rounded border border-white/10">
                            <button
                                onClick={() => {
                                    setViewMode('details');
                                    setCompareVersionA(null);
                                    setCompareVersionB(null);
                                }}
                                className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                                    viewMode === 'details'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                <Info size={12} />
                                Detalles
                            </button>
                            <button
                                onClick={() => setViewMode('compare')}
                                disabled={versions.length < 1}
                                className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                                    viewMode === 'compare'
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'text-gray-500 hover:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed'
                                }`}
                            >
                                <GitCompare size={12} />
                                Comparar
                            </button>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Versions List */}
                    {viewMode === 'details' && (
                        <div className="w-1/3 border-r border-border overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-semibold text-gray-400">
                                        Versiones ({versions.length})
                                    </span>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs transition-colors"
                                    >
                                        <Plus size={12} /> Nueva
                                    </button>
                                </div>

                            {/* Create Version Form */}
                            {isCreating && (
                                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg space-y-2">
                                    <input
                                        type="text"
                                        value={versionName}
                                        onChange={(e) => setVersionName(e.target.value)}
                                        placeholder="Nombre de versión (ej: v1.0, beta)"
                                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-white placeholder-gray-600"
                                        autoFocus
                                    />
                                    <textarea
                                        value={versionDescription}
                                        onChange={(e) => setVersionDescription(e.target.value)}
                                        placeholder="Descripción opcional..."
                                        rows={2}
                                        className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs text-white placeholder-gray-600 resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setIsCreating(false);
                                                setVersionName('');
                                                setVersionDescription('');
                                            }}
                                            className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleCreateVersion}
                                            disabled={!versionName.trim()}
                                            className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Crear
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Current Version Indicator */}
                            <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-semibold text-green-400">Versión Actual</span>
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    Configuración en edición
                                </div>
                            </div>

                            {/* Versions List */}
                            <div className="space-y-2">
                                {versions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-600 text-xs">
                                        <History size={32} className="mx-auto mb-2 opacity-30" />
                                        <p>No hay versiones guardadas</p>
                                        <p className="mt-1 text-[10px]">Crea una versión para guardar un snapshot</p>
                                    </div>
                                ) : (
                                    versions.map((version) => (
                                        <button
                                            key={version.id}
                                            onClick={() => setSelectedVersion(version)}
                                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                                                selectedVersion?.id === version.id
                                                    ? 'bg-blue-500/10 border-blue-500/30'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={12} className="text-blue-400 mt-0.5" />
                                                    <span className="text-sm font-semibold text-white">{version.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <Clock size={10} />
                                                {formatDate(version.timestamp)}
                                            </div>
                                            {version.description && (
                                                <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{version.description}</p>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Compare Mode - Version Selection */}
                    {viewMode === 'compare' && (
                        <div className="w-1/3 border-r border-border overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {/* Version A Selector */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 mb-2 block">
                                        Versión A (Base)
                                    </label>
                                    <div className="space-y-2">
                                        {allVersions.map((version) => (
                                            <button
                                                key={version.id}
                                                onClick={() => setCompareVersionA(version)}
                                                className={`w-full text-left p-2 rounded border transition-all ${
                                                    compareVersionA?.id === version.id
                                                        ? 'bg-blue-500/20 border-blue-500/50'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-white">{version.name}</span>
                                                    {version.id === 'current' && (
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    {formatDate(version.timestamp)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center text-gray-600">
                                    <ArrowRight size={16} />
                                </div>

                                {/* Version B Selector */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 mb-2 block">
                                        Versión B (Comparar)
                                    </label>
                                    <div className="space-y-2">
                                        {allVersions.map((version) => (
                                            <button
                                                key={version.id}
                                                onClick={() => setCompareVersionB(version)}
                                                className={`w-full text-left p-2 rounded border transition-all ${
                                                    compareVersionB?.id === version.id
                                                        ? 'bg-purple-500/20 border-purple-500/50'
                                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-white">{version.name}</span>
                                                    {version.id === 'current' && (
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    {formatDate(version.timestamp)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Version Details (Details Mode) */}
                    {viewMode === 'details' && (
                        <div className="flex-1 overflow-y-auto p-4">
                        {selectedVersion ? (
                            <div className="space-y-4">
                                {/* Version Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">{selectedVersion.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock size={12} />
                                            {formatDate(selectedVersion.timestamp)}
                                        </div>
                                        {selectedVersion.description && (
                                            <p className="text-sm text-gray-400 mt-2">{selectedVersion.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Version Details */}
                                <div className="space-y-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info size={14} className="text-blue-400" />
                                            <span className="text-xs font-semibold text-gray-400">Configuración</span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Tipo:</span>
                                                <span className="text-white font-mono">{selectedVersion.type}</span>
                                            </div>
                                            {selectedVersion.model && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Modelo:</span>
                                                    <span className="text-white font-mono">{selectedVersion.model}</span>
                                                </div>
                                            )}
                                            {selectedVersion.temperature !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Temperature:</span>
                                                    <span className="text-white font-mono">{selectedVersion.temperature}</span>
                                                </div>
                                            )}
                                            {selectedVersion.outputMode && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Output Mode:</span>
                                                    <span className="text-white font-mono">{selectedVersion.outputMode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* System Prompt */}
                                    {selectedVersion.systemPrompt && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400">System Prompt</label>
                                            <div className="bg-background border border-border rounded p-3 text-xs text-gray-300 font-mono max-h-32 overflow-y-auto">
                                                {selectedVersion.systemPrompt}
                                            </div>
                                        </div>
                                    )}

                                    {/* User Prompt */}
                                    {selectedVersion.userPrompt && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400">User Prompt</label>
                                            <div className="bg-background border border-border rounded p-3 text-xs text-gray-300 font-mono max-h-32 overflow-y-auto">
                                                {selectedVersion.userPrompt}
                                            </div>
                                        </div>
                                    )}

                                    {/* Schema */}
                                    {selectedVersion.schema && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400">Schema</label>
                                            <div className="bg-background border border-border rounded p-3 text-xs text-green-400 font-mono max-h-32 overflow-y-auto">
                                                {typeof selectedVersion.schema === 'string'
                                                    ? selectedVersion.schema
                                                    : JSON.stringify(selectedVersion.schema, null, 2)}
                                            </div>
                                        </div>
                                    )}

                                    {/* JSON */}
                                    {selectedVersion.json && (
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400">JSON Content</label>
                                            <div className="bg-background border border-border rounded p-3 text-xs text-green-400 font-mono max-h-32 overflow-y-auto">
                                                {selectedVersion.json}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-border">
                                    <button
                                        onClick={() => onRestoreVersion(selectedVersion)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                                    >
                                        <RotateCcw size={14} />
                                        Restaurar esta versión
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`¿Eliminar la versión "${selectedVersion.name}"?`)) {
                                                onDeleteVersion(selectedVersion.id);
                                                setSelectedVersion(null);
                                            }
                                        }}
                                        className="px-4 py-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-600">
                                <div className="text-center">
                                    <Tag size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Selecciona una versión para ver detalles</p>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {/* Comparison View (Compare Mode) */}
                    {viewMode === 'compare' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            {compareVersionA && compareVersionB ? (
                                <div className="space-y-4">
                                    {/* Comparison Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-border">
                                        <div className="flex items-center gap-2">
                                            <GitCompare size={18} className="text-purple-400" />
                                            <h3 className="text-sm font-semibold text-white">Comparación de Versiones</h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                {compareVersionA.name}
                                            </span>
                                            <ArrowRight size={12} className="text-gray-600" />
                                            <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                {compareVersionB.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comparison Grid */}
                                    <div className="space-y-3">
                                        {/* Basic Config */}
                                        <ComparisonField
                                            label="Label"
                                            valueA={compareVersionA.label}
                                            valueB={compareVersionB.label}
                                            changed={differences.label}
                                        />

                                        {(compareVersionA.model || compareVersionB.model) && (
                                            <ComparisonField
                                                label="Model"
                                                valueA={compareVersionA.model}
                                                valueB={compareVersionB.model}
                                                changed={differences.model}
                                            />
                                        )}

                                        {(compareVersionA.temperature !== undefined || compareVersionB.temperature !== undefined) && (
                                            <ComparisonField
                                                label="Temperature"
                                                valueA={compareVersionA.temperature?.toString()}
                                                valueB={compareVersionB.temperature?.toString()}
                                                changed={differences.temperature}
                                            />
                                        )}

                                        {(compareVersionA.outputMode || compareVersionB.outputMode) && (
                                            <ComparisonField
                                                label="Output Mode"
                                                valueA={compareVersionA.outputMode}
                                                valueB={compareVersionB.outputMode}
                                                changed={differences.outputMode}
                                            />
                                        )}

                                        {/* System Prompt */}
                                        {(compareVersionA.systemPrompt || compareVersionB.systemPrompt) && (
                                            <ComparisonTextArea
                                                label="System Prompt"
                                                valueA={compareVersionA.systemPrompt}
                                                valueB={compareVersionB.systemPrompt}
                                                changed={differences.systemPrompt}
                                            />
                                        )}

                                        {/* User Prompt */}
                                        {(compareVersionA.userPrompt || compareVersionB.userPrompt) && (
                                            <ComparisonTextArea
                                                label="User Prompt"
                                                valueA={compareVersionA.userPrompt}
                                                valueB={compareVersionB.userPrompt}
                                                changed={differences.userPrompt}
                                            />
                                        )}

                                        {/* Schema */}
                                        {(compareVersionA.schema || compareVersionB.schema) && (
                                            <ComparisonTextArea
                                                label="Schema"
                                                valueA={
                                                    typeof compareVersionA.schema === 'string'
                                                        ? compareVersionA.schema
                                                        : JSON.stringify(compareVersionA.schema, null, 2)
                                                }
                                                valueB={
                                                    typeof compareVersionB.schema === 'string'
                                                        ? compareVersionB.schema
                                                        : JSON.stringify(compareVersionB.schema, null, 2)
                                                }
                                                changed={differences.schema}
                                                mono
                                            />
                                        )}

                                        {/* JSON */}
                                        {(compareVersionA.json || compareVersionB.json) && (
                                            <ComparisonTextArea
                                                label="JSON Content"
                                                valueA={compareVersionA.json}
                                                valueB={compareVersionB.json}
                                                changed={differences.json}
                                                mono
                                            />
                                        )}

                                        {/* Recency */}
                                        {(compareVersionA.recency || compareVersionB.recency) && (
                                            <ComparisonField
                                                label="Recency"
                                                valueA={compareVersionA.recency}
                                                valueB={compareVersionB.recency}
                                                changed={differences.recency}
                                            />
                                        )}

                                        {/* Citations */}
                                        {(compareVersionA.citations !== undefined || compareVersionB.citations !== undefined) && (
                                            <ComparisonField
                                                label="Citations"
                                                valueA={compareVersionA.citations ? 'Enabled' : 'Disabled'}
                                                valueB={compareVersionB.citations ? 'Enabled' : 'Disabled'}
                                                changed={differences.citations}
                                            />
                                        )}
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info size={14} className="text-blue-400" />
                                            <span className="text-xs font-semibold text-gray-400">Resumen</span>
                                        </div>
                                        <div className="text-xs text-gray-300">
                                            {Object.values(differences).filter(Boolean).length > 0 ? (
                                                <span>
                                                    {Object.values(differences).filter(Boolean).length} campo(s) modificado(s)
                                                </span>
                                            ) : (
                                                <span className="text-green-400">✓ Las versiones son idénticas</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-600">
                                    <div className="text-center">
                                        <GitCompare size={48} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">Selecciona dos versiones para comparar</p>
                                        <p className="text-xs mt-1 text-gray-700">Elige una versión base (A) y una para comparar (B)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Components for Comparison
const ComparisonField: React.FC<{
    label: string;
    valueA?: string;
    valueB?: string;
    changed: boolean;
}> = ({ label, valueA, valueB, changed }) => (
    <div className={`p-3 rounded-lg border ${changed ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold text-gray-400">{label}</label>
            {changed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Modificado</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <div className="text-[10px] text-blue-400 font-semibold">Versión A</div>
                <div className={`text-xs p-2 rounded bg-background border ${changed ? 'border-blue-500/30' : 'border-white/10'} ${!valueA && 'text-gray-600 italic'}`}>
                    {valueA || 'No definido'}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-[10px] text-purple-400 font-semibold">Versión B</div>
                <div className={`text-xs p-2 rounded bg-background border ${changed ? 'border-purple-500/30' : 'border-white/10'} ${!valueB && 'text-gray-600 italic'}`}>
                    {valueB || 'No definido'}
                </div>
            </div>
        </div>
    </div>
);

const ComparisonTextArea: React.FC<{
    label: string;
    valueA?: string;
    valueB?: string;
    changed: boolean;
    mono?: boolean;
}> = ({ label, valueA, valueB, changed, mono = false }) => (
    <div className={`p-3 rounded-lg border ${changed ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-center gap-2 mb-2">
            <label className="text-xs font-semibold text-gray-400">{label}</label>
            {changed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Modificado</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <div className="text-[10px] text-blue-400 font-semibold">Versión A</div>
                <div className={`text-xs p-2 rounded bg-background border ${changed ? 'border-blue-500/30' : 'border-white/10'} max-h-48 overflow-y-auto ${mono ? 'font-mono text-green-400' : ''} ${!valueA && 'text-gray-600 italic'}`}>
                    {valueA || 'No definido'}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-[10px] text-purple-400 font-semibold">Versión B</div>
                <div className={`text-xs p-2 rounded bg-background border ${changed ? 'border-purple-500/30' : 'border-white/10'} max-h-48 overflow-y-auto ${mono ? 'font-mono text-green-400' : ''} ${!valueB && 'text-gray-600 italic'}`}>
                    {valueB || 'No definido'}
                </div>
            </div>
        </div>
    </div>
);
