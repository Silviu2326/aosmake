import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, GripVertical, Settings, RotateCcw, Plus, Edit3, Trash2, ArrowRight, Wand2, Shuffle, Copy, RefreshCw } from 'lucide-react';

export interface FieldConfig {
    id: string;
    label: string;
    visible: boolean;
    locked?: boolean; // Campos que no se pueden ocultar (ej: LeadNumber, checkbox)
    category?: 'personal' | 'company' | 'email' | 'status' | 'other';
    custom?: boolean; // Campo añadido manualmente por el usuario
    sourceField?: string; // Campo fuente del que obtener el valor (mapeo/transformación)
    transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'none'; // Transformación opcional
}

export interface DataTransformRule {
    id: string;
    sourceField: string; // Campo origen (de donde se copia)
    targetField: string; // Campo destino (a donde se copia/sustituye)
    action: 'copy' | 'replace'; // Copiar (mantener ambos) o Reemplazar (solo destino)
    transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'none';
    enabled: boolean;
    description?: string;
}

interface FieldConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fields: FieldConfig[], transformRules?: DataTransformRule[]) => void;
    initialFields: FieldConfig[];
    initialTransformRules?: DataTransformRule[];
}

const DEFAULT_FIELDS: FieldConfig[] = [
    { id: 'select', label: 'Selección', visible: true, locked: true, category: 'other' },
    { id: 'LeadNumber', label: 'Lead #', visible: true, locked: true, category: 'other' },
    { id: 'firstName', label: 'Nombre', visible: true, category: 'personal' },
    { id: 'lastName', label: 'Apellido', visible: true, category: 'personal' },
    { id: 'personTitle', label: 'Cargo', visible: true, category: 'personal' },
    { id: 'personLocation', label: 'Ubicación', visible: false, category: 'personal' },
    { id: 'durationInRole', label: 'Tiempo en Cargo', visible: false, category: 'personal' },
    { id: 'durationInCompany', label: 'Tiempo en Empresa', visible: false, category: 'personal' },
    { id: 'companyName', label: 'Empresa', visible: true, category: 'company' },
    { id: 'industry', label: 'Industria', visible: false, category: 'company' },
    { id: 'employeeCount', label: 'Empleados', visible: false, category: 'company' },
    { id: 'companyLocation', label: 'Ubicación Empresa', visible: false, category: 'company' },
    { id: 'website', label: 'Website', visible: false, category: 'company' },
    { id: 'yearFounded', label: 'Año Fundación', visible: false, category: 'company' },
    { id: 'email', label: 'Email', visible: true, category: 'email' },
    { id: 'email_validation', label: 'Validación Email', visible: true, category: 'email' },
    { id: 'compUrl', label: 'CompUrl', visible: true, category: 'company' },
    { id: 'verification', label: 'Estado Verificación', visible: true, category: 'status' },
    { id: 'compScrap', label: 'Estado CompScrap', visible: false, category: 'status' },
    { id: 'box1', label: 'Estado Box1', visible: false, category: 'status' },
    { id: 'instantly', label: 'Estado Instantly', visible: false, category: 'status' },
    { id: 'actions', label: 'Acciones', visible: true, locked: true, category: 'other' }
];

export const FieldConfigModal: React.FC<FieldConfigModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialFields,
    initialTransformRules = []
}) => {
    const [activeView, setActiveView] = useState<'fields' | 'transforms'>('fields');
    const [fields, setFields] = useState<FieldConfig[]>(initialFields.length > 0 ? initialFields : DEFAULT_FIELDS);
    const [transformRules, setTransformRules] = useState<DataTransformRule[]>(initialTransformRules);
    const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
    const [isAddingField, setIsAddingField] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldId, setNewFieldId] = useState('');
    const [newFieldCategory, setNewFieldCategory] = useState<FieldConfig['category']>('other');
    const [mappingSourceField, setMappingSourceField] = useState('');
    const [mappingTransform, setMappingTransform] = useState<FieldConfig['transform']>('none');

    // Transform rule form states
    const [isAddingRule, setIsAddingRule] = useState(false);
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
    const [ruleSourceField, setRuleSourceField] = useState('');
    const [ruleTargetField, setRuleTargetField] = useState('');
    const [ruleAction, setRuleAction] = useState<'copy' | 'replace'>('copy');
    const [ruleTransform, setRuleTransform] = useState<DataTransformRule['transform']>('none');
    const [ruleDescription, setRuleDescription] = useState('');

    useEffect(() => {
        if (initialFields.length > 0) {
            setFields(initialFields);
        }
    }, [initialFields]);

    if (!isOpen) return null;

    const categories = [
        { id: 'all', label: 'Todos', icon: '📋' },
        { id: 'personal', label: 'Datos Personales', icon: '👤' },
        { id: 'company', label: 'Empresa', icon: '🏢' },
        { id: 'email', label: 'Email', icon: '📧' },
        { id: 'status', label: 'Estados', icon: '📊' },
        { id: 'other', label: 'Otros', icon: '⚙️' }
    ];

    const filteredFields = activeCategory === 'all'
        ? fields
        : fields.filter(f => f.category === activeCategory);

    const toggleFieldVisibility = (fieldId: string) => {
        setFields(prev => prev.map(f =>
            f.id === fieldId && !f.locked
                ? { ...f, visible: !f.visible }
                : f
        ));
    };

    const toggleAll = (visible: boolean) => {
        setFields(prev => prev.map(f =>
            f.locked ? f : { ...f, visible }
        ));
    };

    const resetToDefaults = () => {
        setFields(DEFAULT_FIELDS);
    };

    const handleAddField = () => {
        if (!newFieldLabel.trim() || !newFieldId.trim()) return;

        // Check if ID already exists
        if (fields.some(f => f.id === newFieldId)) {
            alert('Ya existe un campo con ese ID');
            return;
        }

        const newField: FieldConfig = {
            id: newFieldId,
            label: newFieldLabel,
            visible: true,
            category: newFieldCategory,
            custom: true,
            sourceField: mappingSourceField || undefined,
            transform: mappingTransform !== 'none' ? mappingTransform : undefined
        };

        setFields(prev => [...prev, newField]);

        // Reset form
        setNewFieldLabel('');
        setNewFieldId('');
        setNewFieldCategory('other');
        setMappingSourceField('');
        setMappingTransform('none');
        setIsAddingField(false);
    };

    const handleEditField = (fieldId: string) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field || field.locked) return;

        setEditingFieldId(fieldId);
        setNewFieldLabel(field.label);
        setNewFieldId(field.id);
        setNewFieldCategory(field.category || 'other');
        setMappingSourceField(field.sourceField || '');
        setMappingTransform(field.transform || 'none');
    };

    const handleUpdateField = () => {
        if (!editingFieldId) return;

        setFields(prev => prev.map(f =>
            f.id === editingFieldId
                ? {
                    ...f,
                    label: newFieldLabel,
                    category: newFieldCategory,
                    sourceField: mappingSourceField || undefined,
                    transform: mappingTransform !== 'none' ? mappingTransform : undefined
                }
                : f
        ));

        // Reset
        setEditingFieldId(null);
        setNewFieldLabel('');
        setNewFieldId('');
        setNewFieldCategory('other');
        setMappingSourceField('');
        setMappingTransform('none');
    };

    const handleDeleteField = (fieldId: string) => {
        const field = fields.find(f => f.id === fieldId);
        if (field?.locked) return;

        if (confirm(`¿Eliminar el campo "${field?.label}"?`)) {
            setFields(prev => prev.filter(f => f.id !== fieldId));
        }
    };

    // Transform Rules Management
    const handleAddRule = () => {
        if (!ruleSourceField.trim() || !ruleTargetField.trim()) return;

        const newRule: DataTransformRule = {
            id: `rule_${Date.now()}`,
            sourceField: ruleSourceField,
            targetField: ruleTargetField,
            action: ruleAction,
            transform: ruleTransform !== 'none' ? ruleTransform : undefined,
            enabled: true,
            description: ruleDescription || undefined
        };

        setTransformRules(prev => [...prev, newRule]);
        resetRuleForm();
    };

    const handleEditRule = (ruleId: string) => {
        const rule = transformRules.find(r => r.id === ruleId);
        if (!rule) return;

        setEditingRuleId(ruleId);
        setRuleSourceField(rule.sourceField);
        setRuleTargetField(rule.targetField);
        setRuleAction(rule.action);
        setRuleTransform(rule.transform || 'none');
        setRuleDescription(rule.description || '');
    };

    const handleUpdateRule = () => {
        if (!editingRuleId) return;

        setTransformRules(prev => prev.map(r =>
            r.id === editingRuleId
                ? {
                    ...r,
                    sourceField: ruleSourceField,
                    targetField: ruleTargetField,
                    action: ruleAction,
                    transform: ruleTransform !== 'none' ? ruleTransform : undefined,
                    description: ruleDescription || undefined
                }
                : r
        ));

        resetRuleForm();
    };

    const handleDeleteRule = (ruleId: string) => {
        if (confirm('¿Eliminar esta regla de transformación?')) {
            setTransformRules(prev => prev.filter(r => r.id !== ruleId));
        }
    };

    const handleToggleRule = (ruleId: string) => {
        setTransformRules(prev => prev.map(r =>
            r.id === ruleId ? { ...r, enabled: !r.enabled } : r
        ));
    };

    const resetRuleForm = () => {
        setIsAddingRule(false);
        setEditingRuleId(null);
        setRuleSourceField('');
        setRuleTargetField('');
        setRuleAction('copy');
        setRuleTransform('none');
        setRuleDescription('');
    };

    const handleSave = () => {
        onSave(fields, transformRules);
        onClose();
    };

    const visibleCount = fields.filter(f => f.visible).length;
    const totalCount = fields.length;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Settings size={24} className="text-accent" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Configuración del Dashboard</h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Personaliza columnas y reglas de transformación de datos
                            </p>
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 ml-4">
                            <button
                                onClick={() => setActiveView('fields')}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                                    activeView === 'fields'
                                        ? 'bg-accent text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Eye size={16} />
                                Campos Visibles
                            </button>
                            <button
                                onClick={() => setActiveView('transforms')}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                                    activeView === 'transforms'
                                        ? 'bg-accent text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Shuffle size={16} />
                                Reglas de Datos
                                {transformRules.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">
                                        {transformRules.filter(r => r.enabled).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* FIELDS VIEW */}
                {activeView === 'fields' && (
                    <>
                        {/* Category Tabs - NOW FIRST */}
                        <div className="px-6 py-4 bg-black/20 border-b border-border">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filtrar por categoría:</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-accent text-white shadow-lg scale-105'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                {cat.label}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    activeCategory === cat.id
                                        ? 'bg-white/20'
                                        : 'bg-white/10'
                                }`}>
                                    {cat.id === 'all'
                                        ? fields.length
                                        : fields.filter(f => f.category === cat.id).length
                                    }
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="px-6 py-3 bg-white/5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                            Mostrando:
                            <span className="ml-2 font-bold text-white">{filteredFields.length}</span>
                            <span className="text-gray-600"> campos</span>
                            <span className="mx-2">|</span>
                            Visibles:
                            <span className="ml-2 font-semibold text-accent">{visibleCount}</span>
                            <span className="text-gray-600"> / {totalCount}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsAddingField(true)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded border border-purple-500/20 transition-colors font-medium"
                        >
                            <Plus size={12} />
                            Añadir Campo
                        </button>
                        <button
                            onClick={() => toggleAll(true)}
                            className="px-3 py-1.5 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded border border-green-500/20 transition-colors font-medium"
                        >
                            ✓ Mostrar todo
                        </button>
                        <button
                            onClick={() => toggleAll(false)}
                            className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded border border-red-500/20 transition-colors font-medium"
                        >
                            ✗ Ocultar todo
                        </button>
                        <button
                            onClick={resetToDefaults}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded border border-blue-500/20 transition-colors font-medium"
                        >
                            <RotateCcw size={12} />
                            Restablecer
                        </button>
                    </div>
                </div>

                {/* Fields List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add/Edit Field Form */}
                    {(isAddingField || editingFieldId) && (
                        <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Wand2 size={18} className="text-purple-400" />
                                <h3 className="text-sm font-semibold text-white">
                                    {editingFieldId ? 'Editar Campo' : 'Añadir Nuevo Campo'}
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Label */}
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Etiqueta *</label>
                                    <input
                                        type="text"
                                        value={newFieldLabel}
                                        onChange={(e) => setNewFieldLabel(e.target.value)}
                                        placeholder="Ej: Email Principal"
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                    />
                                </div>

                                {/* ID */}
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">ID del Campo *</label>
                                    <input
                                        type="text"
                                        value={newFieldId}
                                        onChange={(e) => setNewFieldId(e.target.value.replace(/\s/g, '_'))}
                                        placeholder="Ej: email_principal"
                                        disabled={!!editingFieldId}
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
                                    <select
                                        value={newFieldCategory}
                                        onChange={(e) => setNewFieldCategory(e.target.value as any)}
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                    >
                                        <option value="personal">👤 Datos Personales</option>
                                        <option value="company">🏢 Empresa</option>
                                        <option value="email">📧 Email</option>
                                        <option value="status">📊 Estados</option>
                                        <option value="other">⚙️ Otros</option>
                                    </select>
                                </div>

                                {/* Source Field (Mapping) */}
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
                                        <ArrowRight size={12} />
                                        Campo Fuente (Mapeo)
                                    </label>
                                    <input
                                        type="text"
                                        value={mappingSourceField}
                                        onChange={(e) => setMappingSourceField(e.target.value)}
                                        placeholder="Ej: firstName_cleaned"
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                    />
                                </div>

                                {/* Transform */}
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-400 mb-1 block">Transformación</label>
                                    <select
                                        value={mappingTransform}
                                        onChange={(e) => setMappingTransform(e.target.value as any)}
                                        className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                    >
                                        <option value="none">Sin transformación</option>
                                        <option value="uppercase">MAYÚSCULAS</option>
                                        <option value="lowercase">minúsculas</option>
                                        <option value="capitalize">Capitalizar</option>
                                        <option value="trim">Eliminar espacios</option>
                                    </select>
                                </div>
                            </div>

                            {/* Info */}
                            {mappingSourceField && (
                                <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                                    💡 Este campo mostrará el valor de <code className="bg-black/40 px-1 py-0.5 rounded">{mappingSourceField}</code>
                                    {mappingTransform !== 'none' && ` con transformación: ${mappingTransform}`}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 mt-3">
                                <button
                                    onClick={() => {
                                        setIsAddingField(false);
                                        setEditingFieldId(null);
                                        setNewFieldLabel('');
                                        setNewFieldId('');
                                        setNewFieldCategory('other');
                                        setMappingSourceField('');
                                        setMappingTransform('none');
                                    }}
                                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={editingFieldId ? handleUpdateField : handleAddField}
                                    disabled={!newFieldLabel.trim() || !newFieldId.trim()}
                                    className="px-4 py-1.5 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {editingFieldId ? 'Actualizar' : 'Añadir'} Campo
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {filteredFields.map(field => (
                            <div
                                key={field.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                    field.visible
                                        ? 'bg-white/5 border-white/10'
                                        : 'bg-black/20 border-white/5'
                                } ${field.custom ? 'border-l-4 border-l-purple-500' : ''}`}
                            >
                                {/* Drag Handle */}
                                <div className="cursor-move text-gray-600 hover:text-gray-400">
                                    <GripVertical size={16} />
                                </div>

                                {/* Toggle Button */}
                                <button
                                    onClick={() => toggleFieldVisibility(field.id)}
                                    disabled={field.locked}
                                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                        field.locked
                                            ? 'bg-gray-800 cursor-not-allowed'
                                            : field.visible
                                            ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                            : 'bg-white/10 hover:bg-white/20 text-gray-500'
                                    }`}
                                >
                                    {field.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>

                                {/* Field Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${
                                            field.visible ? 'text-white' : 'text-gray-600'
                                        }`}>
                                            {field.label}
                                        </span>
                                        {field.locked && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-gray-700 text-gray-400 border border-gray-600">
                                                🔒 Bloqueado
                                            </span>
                                        )}
                                        {field.custom && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                ⭐ Personalizado
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                        <span>ID: {field.id}</span>
                                        {field.sourceField && (
                                            <>
                                                <span className="text-gray-700">•</span>
                                                <span className="flex items-center gap-1 text-blue-400">
                                                    <ArrowRight size={10} />
                                                    {field.sourceField}
                                                    {field.transform && field.transform !== 'none' && (
                                                        <span className="text-[10px] bg-blue-500/20 px-1 rounded">
                                                            {field.transform}
                                                        </span>
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <div className="px-3 py-1 rounded-full text-xs bg-white/10 text-gray-400">
                                    {categories.find(c => c.id === field.category)?.label || 'Otro'}
                                </div>

                                {/* Edit/Delete Buttons (only for custom fields) */}
                                {field.custom && !field.locked && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleEditField(field.id)}
                                            className="p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                                            title="Editar campo"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteField(field.id)}
                                            className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                            title="Eliminar campo"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                    </>
                )}

                {/* TRANSFORMS VIEW */}
                {activeView === 'transforms' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Header Info */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Shuffle size={24} className="text-orange-400 mt-0.5" />
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1">Reglas de Transformación de Datos</h3>
                                    <p className="text-sm text-gray-400 mb-2">
                                        Configura reglas para copiar o reemplazar campos automáticamente cuando los datos entran al sistema.
                                    </p>
                                    <div className="flex gap-4 text-xs">
                                        <div className="flex items-center gap-1 text-blue-400">
                                            <Copy size={12} />
                                            <span><strong>Copiar:</strong> Mantiene ambos campos</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-orange-400">
                                            <RefreshCw size={12} />
                                            <span><strong>Reemplazar:</strong> Solo mantiene el destino</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Add/Edit Rule Form */}
                        {(isAddingRule || editingRuleId) && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-orange-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                    <Wand2 size={18} className="text-orange-400" />
                                    <h3 className="text-sm font-semibold text-white">
                                        {editingRuleId ? 'Editar Regla' : 'Nueva Regla de Transformación'}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Source Field */}
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Campo Origen *</label>
                                        <input
                                            type="text"
                                            value={ruleSourceField}
                                            onChange={(e) => setRuleSourceField(e.target.value)}
                                            placeholder="Ej: companyName_fromP"
                                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                        />
                                        <p className="text-[10px] text-gray-600 mt-1">De donde se copia el valor</p>
                                    </div>

                                    {/* Target Field */}
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Campo Destino *</label>
                                        <input
                                            type="text"
                                            value={ruleTargetField}
                                            onChange={(e) => setRuleTargetField(e.target.value)}
                                            placeholder="Ej: companyName"
                                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                        />
                                        <p className="text-[10px] text-gray-600 mt-1">A donde se copia el valor</p>
                                    </div>

                                    {/* Action */}
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Acción</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setRuleAction('copy')}
                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                                                    ruleAction === 'copy'
                                                        ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                                                        : 'bg-white/5 text-gray-400 border-2 border-transparent hover:border-white/10'
                                                }`}
                                            >
                                                <Copy size={12} />
                                                Copiar
                                            </button>
                                            <button
                                                onClick={() => setRuleAction('replace')}
                                                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                                                    ruleAction === 'replace'
                                                        ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500'
                                                        : 'bg-white/5 text-gray-400 border-2 border-transparent hover:border-white/10'
                                                }`}
                                            >
                                                <RefreshCw size={12} />
                                                Reemplazar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transform */}
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Transformación</label>
                                        <select
                                            value={ruleTransform}
                                            onChange={(e) => setRuleTransform(e.target.value as any)}
                                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                        >
                                            <option value="none">Sin transformación</option>
                                            <option value="uppercase">MAYÚSCULAS</option>
                                            <option value="lowercase">minúsculas</option>
                                            <option value="capitalize">Capitalizar</option>
                                            <option value="trim">Eliminar espacios</option>
                                        </select>
                                    </div>

                                    {/* Description */}
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-400 mb-1 block">Descripción (opcional)</label>
                                        <input
                                            type="text"
                                            value={ruleDescription}
                                            onChange={(e) => setRuleDescription(e.target.value)}
                                            placeholder="Ej: Usar nombre de empresa limpio"
                                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-white"
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                {ruleSourceField && ruleTargetField && (
                                    <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded">
                                        <div className="text-[10px] text-gray-500 mb-1">VISTA PREVIA:</div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <code className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{ruleSourceField}</code>
                                            <ArrowRight size={16} className="text-gray-600" />
                                            <code className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">{ruleTargetField}</code>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                ruleAction === 'copy' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                                {ruleAction === 'copy' ? '(ambos existen)' : '(solo destino)'}
                                            </span>
                                            {ruleTransform !== 'none' && (
                                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                                    {ruleTransform}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={resetRuleForm}
                                        className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={editingRuleId ? handleUpdateRule : handleAddRule}
                                        disabled={!ruleSourceField.trim() || !ruleTargetField.trim()}
                                        className="px-4 py-1.5 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {editingRuleId ? 'Actualizar' : 'Añadir'} Regla
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add Rule Button */}
                        {!isAddingRule && !editingRuleId && (
                            <button
                                onClick={() => setIsAddingRule(true)}
                                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-2 border-dashed border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/20 transition-all"
                            >
                                <Plus size={18} />
                                Añadir Nueva Regla de Transformación
                            </button>
                        )}

                        {/* Rules List */}
                        <div className="space-y-3">
                            {transformRules.length === 0 ? (
                                <div className="text-center py-12 text-gray-600">
                                    <Shuffle size={48} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No hay reglas de transformación configuradas</p>
                                    <p className="text-xs mt-1">Crea una regla para empezar</p>
                                </div>
                            ) : (
                                transformRules.map(rule => (
                                    <div
                                        key={rule.id}
                                        className={`p-4 rounded-lg border transition-all ${
                                            rule.enabled
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-black/20 border-white/5 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Toggle */}
                                            <button
                                                onClick={() => handleToggleRule(rule.id)}
                                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                                    rule.enabled
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-white/10 text-gray-500'
                                                }`}
                                            >
                                                {rule.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>

                                            {/* Rule Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <code className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-mono">
                                                        {rule.sourceField}
                                                    </code>
                                                    <ArrowRight size={16} className="text-gray-600" />
                                                    <code className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-sm font-mono">
                                                        {rule.targetField}
                                                    </code>
                                                </div>

                                                {/* Action Badge */}
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={`flex items-center gap-1 px-2 py-1 rounded ${
                                                        rule.action === 'copy'
                                                            ? 'bg-blue-500/20 text-blue-400'
                                                            : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                        {rule.action === 'copy' ? <Copy size={10} /> : <RefreshCw size={10} />}
                                                        {rule.action === 'copy' ? 'Copiar' : 'Reemplazar'}
                                                    </span>

                                                    {rule.transform && rule.transform !== 'none' && (
                                                        <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">
                                                            {rule.transform}
                                                        </span>
                                                    )}

                                                    {rule.enabled && (
                                                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">
                                                            ✓ Activa
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Description */}
                                                {rule.description && (
                                                    <p className="text-xs text-gray-500 mt-2">{rule.description}</p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditRule(rule.id)}
                                                    className="p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                                                    title="Editar regla"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                                    title="Eliminar regla"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-border bg-surface/50">
                    <div className="text-sm text-gray-500">
                        {activeView === 'fields' ? (
                            <>💡 Tip: Los campos bloqueados son esenciales y no se pueden ocultar</>
                        ) : (
                            <>⚡ Las reglas se aplican automáticamente cuando los datos entran al sistema</>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-medium transition-colors"
                        >
                            Guardar Configuración
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
