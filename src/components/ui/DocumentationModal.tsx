import React, { useState } from 'react';
import { X, BookOpen, Search, Download, FileText, Edit2, Check, Sparkles, CheckCircle, ChevronDown, ChevronRight, Target, GitBranch, Unlock, Lock, StickyNote, AlertTriangle, Lightbulb } from 'lucide-react';
import { Node } from 'reactflow';

// ── Structured Documentation ──────────────────────────────────────────

interface StructuredDoc {
    purpose: string;
    interactions: string;
    canChange: string;
    cannotChange: string;
    notes: string;
}

const EMPTY_DOC: StructuredDoc = {
    purpose: '',
    interactions: '',
    canChange: '',
    cannotChange: '',
    notes: ''
};

const DOC_FIELDS: { key: keyof StructuredDoc; label: string; placeholder: string; icon: React.ReactNode; color: string; rows: number }[] = [
    {
        key: 'purpose',
        label: 'Para qué sirve',
        placeholder: 'Este nodo se encarga de generar el asunto del email en base al perfil del lead y la propuesta de valor de la empresa...',
        icon: <Target size={13} />,
        color: 'text-blue-400',
        rows: 3
    },
    {
        key: 'interactions',
        label: 'Cómo interactúa con otros nodos',
        placeholder: 'Recibe el output del nodo "Investigar Lead" como contexto. Su salida alimenta al nodo "Componer Email" como asunto...',
        icon: <GitBranch size={13} />,
        color: 'text-emerald-400',
        rows: 3
    },
    {
        key: 'canChange',
        label: 'Qué se puede modificar',
        placeholder: 'El tono del asunto, la longitud máxima, las variables {{empresa_nombre}} y {{propuesta_valor}}, el idioma de salida...',
        icon: <Unlock size={13} />,
        color: 'text-amber-400',
        rows: 2
    },
    {
        key: 'cannotChange',
        label: 'Qué NO se debe modificar',
        placeholder: 'No cambiar el formato de salida (debe ser texto plano, sin HTML). No eliminar la referencia a {{lead_nombre}} porque el nodo siguiente lo espera...',
        icon: <Lock size={13} />,
        color: 'text-red-400',
        rows: 2
    },
    {
        key: 'notes',
        label: 'Notas adicionales',
        placeholder: 'Funciona mejor con GPT-4. Si el lead no tiene LinkedIn, el resultado puede ser genérico. Considerar añadir un fallback...',
        icon: <Lightbulb size={13} />,
        color: 'text-purple-400',
        rows: 2
    }
];

/** Parse stored documentation (handles legacy plain strings and structured JSON) */
function parseDoc(raw: string | undefined | null): StructuredDoc {
    if (!raw || !raw.trim()) return { ...EMPTY_DOC };

    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && ('purpose' in parsed || 'interactions' in parsed)) {
            return { ...EMPTY_DOC, ...parsed };
        }
    } catch {
        // Not JSON — legacy plain-text documentation
    }

    return { ...EMPTY_DOC, purpose: raw };
}

/** Serialize structured doc to a JSON string for storage */
function serializeDoc(doc: StructuredDoc): string {
    return JSON.stringify(doc);
}

/** Check if any field has content */
function hasContent(doc: StructuredDoc): boolean {
    return Object.values(doc).some(v => v.trim().length > 0);
}

/** Count filled fields */
function filledFieldCount(doc: StructuredDoc): number {
    return Object.values(doc).filter(v => v.trim().length > 0).length;
}

// ── Component ─────────────────────────────────────────────────────────

interface DocumentationModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodes: Node[];
    onSaveDocumentation: (nodeId: string, documentation: string) => void;
    onGenerateWithAI?: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
    isOpen,
    onClose,
    nodes,
    onSaveDocumentation,
    onGenerateWithAI
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editingDoc, setEditingDoc] = useState<StructuredDoc>({ ...EMPTY_DOC });
    const [savedNodeId, setSavedNodeId] = useState<string | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const filteredNodes = nodes.filter(node => {
        const label = (node.data.label || '').toLowerCase();
        const type = (node.data.type || '').toLowerCase();
        const doc = parseDoc(node.data.documentation);
        const allDocText = Object.values(doc).join(' ').toLowerCase();
        const query = searchQuery.toLowerCase();
        return label.includes(query) || type.includes(query) || allDocText.includes(query);
    });

    const handleStartEdit = (nodeId: string, rawDoc: string) => {
        setEditingNodeId(nodeId);
        setEditingDoc(parseDoc(rawDoc));
    };

    const handleSave = (nodeId: string) => {
        onSaveDocumentation(nodeId, serializeDoc(editingDoc));
        setEditingNodeId(null);
        setSavedNodeId(nodeId);
        setTimeout(() => setSavedNodeId(null), 2000);
    };

    const handleCancel = () => {
        setEditingNodeId(null);
        setEditingDoc({ ...EMPTY_DOC });
    };

    const updateField = (key: keyof StructuredDoc, value: string) => {
        setEditingDoc(prev => ({ ...prev, [key]: value }));
    };

    const toggleExpanded = (nodeId: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeId)) next.delete(nodeId);
            else next.add(nodeId);
            return next;
        });
    };

    const handleExportMarkdown = () => {
        let markdown = `# Documentación del Workflow\n\n`;
        markdown += `*Generado: ${new Date().toLocaleString()}*\n\n`;
        markdown += `---\n\n`;

        nodes.forEach((node, index) => {
            const doc = parseDoc(node.data.documentation);
            const documented = hasContent(doc);

            markdown += `## ${index + 1}. ${node.data.label}\n\n`;
            markdown += `**Tipo:** \`${node.data.type}\`  \n`;
            markdown += `**ID:** \`${node.id}\`\n\n`;

            if (documented) {
                if (doc.purpose) markdown += `### Para qué sirve\n\n${doc.purpose}\n\n`;
                if (doc.interactions) markdown += `### Interacciones con otros nodos\n\n${doc.interactions}\n\n`;
                if (doc.canChange) markdown += `### Qué se puede modificar\n\n${doc.canChange}\n\n`;
                if (doc.cannotChange) markdown += `### Qué NO se debe modificar\n\n${doc.cannotChange}\n\n`;
                if (doc.notes) markdown += `### Notas\n\n${doc.notes}\n\n`;
            } else {
                markdown += `*Sin documentación*\n\n`;
            }

            if (node.data.systemPrompt || node.data.userPrompt) {
                markdown += `### Configuración\n\n`;
                if (node.data.systemPrompt) {
                    markdown += `**System Prompt:**\n\`\`\`\n${node.data.systemPrompt}\n\`\`\`\n\n`;
                }
                if (node.data.userPrompt) {
                    markdown += `**User Prompt:**\n\`\`\`\n${node.data.userPrompt}\n\`\`\`\n\n`;
                }
            }

            markdown += `---\n\n`;
        });

        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-documentation-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getNodeTypeColor = (type: string) => {
        switch (type) {
            case 'LLM': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'FILTER': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
            case 'JSON': case 'JSON_BUILDER': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'CSV_INPUT': case 'CSV_OUTPUT': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
            case 'ANYMAILFINDER': return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getDocumentationProgress = () => {
        const documented = nodes.filter(n => hasContent(parseDoc(n.data.documentation))).length;
        const total = nodes.length;
        return { documented, total, percentage: total > 0 ? Math.round((documented / total) * 100) : 0 };
    };

    const progress = getDocumentationProgress();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">

                {/* ── Header ────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <BookOpen size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-white tracking-tight">Documentación del Workflow</h2>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                {progress.documented} de {progress.total} nodos documentados
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onGenerateWithAI && (
                            <button
                                onClick={onGenerateWithAI}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 rounded-lg text-white text-xs font-medium transition-all"
                            >
                                <Sparkles size={13} />
                                Generar con IA
                            </button>
                        )}
                        <button
                            onClick={handleExportMarkdown}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white text-xs font-medium transition-colors"
                        >
                            <Download size={13} />
                            Exportar
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-gray-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Progress + Search ──────────────────────────────── */}
                <div className="px-6 py-3 border-b border-white/[0.06] bg-white/[0.01] space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                        <span className="text-[11px] text-gray-500 tabular-nums shrink-0">{progress.percentage}%</span>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar nodos por nombre, tipo o documentación..."
                            className="w-full bg-black/30 border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                        />
                    </div>
                </div>

                {/* ── Nodes List ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredNodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                <FileText size={24} className="text-gray-600" />
                            </div>
                            <h3 className="text-sm text-gray-400 font-medium mb-1">No se encontraron nodos</h3>
                            <p className="text-[11px] text-gray-600">
                                {searchQuery ? 'Intenta con otro término de búsqueda' : 'Aún no hay nodos en el workflow'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredNodes.map((node, index) => {
                                const isEditing = editingNodeId === node.id;
                                const isSaved = savedNodeId === node.id;
                                const doc = parseDoc(node.data.documentation);
                                const documented = hasContent(doc);
                                const isExpanded = expandedNodes.has(node.id);
                                const fieldsFilled = filledFieldCount(doc);

                                return (
                                    <div
                                        key={node.id}
                                        className={`bg-white/[0.02] border rounded-xl transition-all ${
                                            isEditing ? 'border-purple-500/30 shadow-lg shadow-purple-500/5' :
                                            isSaved ? 'border-green-500/30' :
                                            'border-white/[0.06] hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        {/* ── Node Header ── */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                            onClick={() => !isEditing && toggleExpanded(node.id)}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {!isEditing && (
                                                    <span className="text-gray-600 shrink-0">
                                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </span>
                                                )}
                                                <span className="text-gray-600 text-[10px] font-mono shrink-0">#{index + 1}</span>
                                                <h3 className="text-sm font-medium text-white truncate">{node.data.label}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border shrink-0 ${getNodeTypeColor(node.data.type)}`}>
                                                    {node.data.type}
                                                </span>
                                                {documented && !isEditing && (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <CheckCircle size={12} className="text-green-400" />
                                                        <span className="text-[10px] text-gray-600">{fieldsFilled}/5</span>
                                                    </div>
                                                )}
                                                {isSaved && (
                                                    <span className="text-[10px] text-green-400 font-medium shrink-0">Guardado</span>
                                                )}
                                            </div>

                                            {!isEditing && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartEdit(node.id, node.data.documentation || '');
                                                        setExpandedNodes(prev => new Set(prev).add(node.id));
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.06] rounded-lg text-gray-400 hover:text-white text-[11px] transition-colors shrink-0"
                                                >
                                                    <Edit2 size={11} />
                                                    {documented ? 'Editar' : 'Documentar'}
                                                </button>
                                            )}
                                        </div>

                                        {/* ── Expanded Content ── */}
                                        {(isExpanded || isEditing) && (
                                            <div className="px-4 pb-4">
                                                {isEditing ? (
                                                    /* ── Edit Mode ── */
                                                    <div className="space-y-3">
                                                        {DOC_FIELDS.map(field => (
                                                            <div key={field.key} className="bg-black/20 border border-white/[0.04] rounded-lg p-3">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={field.color}>{field.icon}</span>
                                                                    <label className={`text-xs font-medium ${field.color}`}>
                                                                        {field.label}
                                                                    </label>
                                                                    {editingDoc[field.key].trim() && (
                                                                        <Check size={10} className="text-green-400" />
                                                                    )}
                                                                </div>
                                                                <textarea
                                                                    value={editingDoc[field.key]}
                                                                    onChange={(e) => updateField(field.key, e.target.value)}
                                                                    placeholder={field.placeholder}
                                                                    className="w-full bg-black/30 border border-white/[0.04] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500/40 focus:border-purple-500/20 resize-none transition-all"
                                                                    rows={field.rows}
                                                                />
                                                            </div>
                                                        ))}

                                                        {/* Save / Cancel */}
                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="text-[10px] text-gray-600">
                                                                {filledFieldCount(editingDoc)}/5 campos completados
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={handleCancel}
                                                                    className="px-3 py-1.5 text-gray-500 hover:text-white text-xs transition-colors"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSave(node.id)}
                                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-xs font-medium transition-colors"
                                                                >
                                                                    <Check size={12} />
                                                                    Guardar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* ── View Mode ── */
                                                    <div className="space-y-2">
                                                        {documented ? (
                                                            DOC_FIELDS.filter(f => doc[f.key].trim()).map(field => (
                                                                <div key={field.key} className="bg-black/20 border border-white/[0.04] rounded-lg p-3">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <span className={field.color}>{field.icon}</span>
                                                                        <span className={`text-[11px] font-medium ${field.color}`}>
                                                                            {field.label}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed pl-5">
                                                                        {doc[field.key]}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="bg-black/20 border border-white/[0.04] rounded-lg p-4 flex items-center gap-3">
                                                                <AlertTriangle size={14} className="text-gray-600 shrink-0" />
                                                                <p className="text-sm text-gray-600 italic">
                                                                    Este nodo aún no tiene documentación.
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Prompt preview */}
                                                        {(node.data.systemPrompt || node.data.userPrompt) && (
                                                            <details className="group">
                                                                <summary className="text-[11px] text-gray-600 cursor-pointer hover:text-gray-400 select-none py-1">
                                                                    Ver configuración del nodo
                                                                </summary>
                                                                <div className="mt-1 space-y-2">
                                                                    {node.data.systemPrompt && (
                                                                        <div className="bg-black/20 border border-white/[0.04] rounded-lg p-3">
                                                                            <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5 font-medium">System Prompt</p>
                                                                            <p className="text-xs text-gray-500 font-mono leading-relaxed">
                                                                                {node.data.systemPrompt.slice(0, 150)}
                                                                                {node.data.systemPrompt.length > 150 && '...'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                    {node.data.userPrompt && (
                                                                        <div className="bg-black/20 border border-white/[0.04] rounded-lg p-3">
                                                                            <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5 font-medium">User Prompt</p>
                                                                            <p className="text-xs text-gray-500 font-mono leading-relaxed">
                                                                                {node.data.userPrompt.slice(0, 150)}
                                                                                {node.data.userPrompt.length > 150 && '...'}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </details>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Footer ────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-white/[0.06] bg-white/[0.02]">
                    <div className="text-[11px] text-gray-500">
                        {filteredNodes.length} nodo{filteredNodes.length !== 1 ? 's' : ''}
                        {searchQuery && ' (filtrados)'}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white text-xs font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
