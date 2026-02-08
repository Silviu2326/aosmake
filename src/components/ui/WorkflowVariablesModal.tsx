import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Play, Save, Variable, Building2, Target, MessageSquare, Sparkles, ChevronRight, Users, Globe, Briefcase, Megaphone, PenLine, Zap, Check, Copy, LayoutTemplate } from 'lucide-react';
import { WorkflowVariable } from '../../types/workflowVariables';

// ── Preset Templates ──────────────────────────────────────────────────
interface ClientProfileField {
    id: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'url';
    placeholder: string;
    description: string;
    section: 'company' | 'campaign' | 'personalization';
    required: boolean;
    icon: React.ReactNode;
}

interface VariabilizationTemplate {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    fields: ClientProfileField[];
}

const TEMPLATES: VariabilizationTemplate[] = [
    {
        id: 'outbound-email',
        name: 'Outbound Email',
        description: 'Generación de emails de prospección en frío',
        icon: <Megaphone size={20} />,
        gradient: 'from-blue-500 to-cyan-500',
        fields: [
            { id: 'f1', name: 'empresa_nombre', label: 'Nombre de la Empresa', type: 'text', placeholder: 'AOS Studio', description: 'Nombre de la empresa que envía los emails', section: 'company', required: true, icon: <Building2 size={14} /> },
            { id: 'f2', name: 'empresa_sector', label: 'Sector / Industria', type: 'text', placeholder: 'SaaS, Marketing, Fintech...', description: 'Sector en el que opera la empresa', section: 'company', required: true, icon: <Briefcase size={14} /> },
            { id: 'f3', name: 'empresa_producto', label: 'Producto / Servicio', type: 'textarea', placeholder: 'Plataforma de automatización de outbound con IA', description: 'Qué ofrece la empresa al mercado', section: 'company', required: true, icon: <Zap size={14} /> },
            { id: 'f4', name: 'empresa_web', label: 'Web de la Empresa', type: 'url', placeholder: 'https://aos.studio', description: 'URL del sitio web', section: 'company', required: false, icon: <Globe size={14} /> },
            { id: 'f5', name: 'propuesta_valor', label: 'Propuesta de Valor', type: 'textarea', placeholder: 'Automatizamos tu outbound con IA para generar 3x más reuniones', description: 'Principal valor diferencial frente a la competencia', section: 'campaign', required: true, icon: <Target size={14} /> },
            { id: 'f6', name: 'publico_objetivo', label: 'Público Objetivo', type: 'textarea', placeholder: 'CMOs, VP Sales, Growth Managers en empresas B2B de 50-500 empleados', description: 'A quién van dirigidos los emails', section: 'campaign', required: true, icon: <Users size={14} /> },
            { id: 'f7', name: 'pain_points', label: 'Pain Points del Cliente', type: 'textarea', placeholder: 'Bajo ratio de respuesta en cold emails, demasiado tiempo prospectando manualmente', description: 'Problemas que resuelve tu producto para el público objetivo', section: 'campaign', required: false, icon: <MessageSquare size={14} /> },
            { id: 'f8', name: 'tono_comunicacion', label: 'Tono de Comunicación', type: 'text', placeholder: 'Profesional pero cercano, directo, sin ser agresivo', description: 'Estilo y personalidad de los mensajes', section: 'personalization', required: true, icon: <PenLine size={14} /> },
            { id: 'f9', name: 'nombre_remitente', label: 'Nombre del Remitente', type: 'text', placeholder: 'Carlos de AOS', description: 'Nombre con el que se firma el email', section: 'personalization', required: false, icon: <Users size={14} /> },
            { id: 'f10', name: 'cta_principal', label: 'Call to Action', type: 'text', placeholder: '¿Te va bien un call de 15 min esta semana?', description: 'Acción que quieres que haga el destinatario', section: 'personalization', required: false, icon: <Target size={14} /> },
        ]
    },
    {
        id: 'content-generation',
        name: 'Content Marketing',
        description: 'Generación de contenido para marketing',
        icon: <PenLine size={20} />,
        gradient: 'from-purple-500 to-pink-500',
        fields: [
            { id: 'f1', name: 'marca_nombre', label: 'Nombre de la Marca', type: 'text', placeholder: 'AOS Studio', description: 'Nombre de la marca o empresa', section: 'company', required: true, icon: <Building2 size={14} /> },
            { id: 'f2', name: 'marca_sector', label: 'Sector / Industria', type: 'text', placeholder: 'Tecnología, SaaS...', description: 'Industria de la marca', section: 'company', required: true, icon: <Briefcase size={14} /> },
            { id: 'f3', name: 'marca_mision', label: 'Misión / Visión', type: 'textarea', placeholder: 'Democratizar el acceso a herramientas de outbound con IA', description: 'Propósito fundamental de la marca', section: 'company', required: false, icon: <Target size={14} /> },
            { id: 'f4', name: 'audiencia_target', label: 'Audiencia Target', type: 'textarea', placeholder: 'Fundadores y equipos de ventas en startups B2B', description: 'A quién va dirigido el contenido', section: 'campaign', required: true, icon: <Users size={14} /> },
            { id: 'f5', name: 'tematicas_clave', label: 'Temáticas Clave', type: 'textarea', placeholder: 'Outbound, ventas B2B, automatización, IA para ventas', description: 'Temas principales sobre los que se genera contenido', section: 'campaign', required: true, icon: <MessageSquare size={14} /> },
            { id: 'f6', name: 'tono_marca', label: 'Tono de Marca', type: 'text', placeholder: 'Experto pero accesible, data-driven, inspirador', description: 'Personalidad y voz de la marca en el contenido', section: 'personalization', required: true, icon: <PenLine size={14} /> },
            { id: 'f7', name: 'formato_preferido', label: 'Formatos Preferidos', type: 'text', placeholder: 'LinkedIn posts, blog articles, Twitter threads', description: 'Tipos de contenido que se generarán', section: 'personalization', required: false, icon: <LayoutTemplate size={14} /> },
            { id: 'f8', name: 'keywords_seo', label: 'Keywords / SEO', type: 'textarea', placeholder: 'cold email, outbound automation, AI sales...', description: 'Palabras clave para posicionamiento', section: 'campaign', required: false, icon: <Globe size={14} /> },
        ]
    },
    {
        id: 'lead-enrichment',
        name: 'Lead Enrichment',
        description: 'Enriquecimiento e investigación de leads',
        icon: <Users size={20} />,
        gradient: 'from-emerald-500 to-teal-500',
        fields: [
            { id: 'f1', name: 'empresa_cliente', label: 'Tu Empresa', type: 'text', placeholder: 'AOS Studio', description: 'Nombre de tu empresa (para contextualizar la investigación)', section: 'company', required: true, icon: <Building2 size={14} /> },
            { id: 'f2', name: 'producto_servicio', label: 'Tu Producto / Servicio', type: 'textarea', placeholder: 'Plataforma de automatización de outbound', description: 'Qué vendes (para encontrar ángulos de conexión con el lead)', section: 'company', required: true, icon: <Zap size={14} /> },
            { id: 'f3', name: 'icp_descripcion', label: 'ICP (Ideal Customer Profile)', type: 'textarea', placeholder: 'Empresas B2B SaaS de 50-500 empleados, facturando entre 1M-50M EUR', description: 'Descripción del cliente ideal', section: 'campaign', required: true, icon: <Target size={14} /> },
            { id: 'f4', name: 'datos_buscar', label: 'Datos a Buscar', type: 'textarea', placeholder: 'Cargo, empresa, tamaño, tecnologías que usan, funding reciente', description: 'Qué información quieres obtener de cada lead', section: 'campaign', required: false, icon: <MessageSquare size={14} /> },
            { id: 'f5', name: 'criterios_scoring', label: 'Criterios de Scoring', type: 'textarea', placeholder: 'Prioridad alta: decision maker en tech, empresa con funding reciente', description: 'Cómo puntuar la calidad de los leads', section: 'personalization', required: false, icon: <Sparkles size={14} /> },
        ]
    },
    {
        id: 'custom',
        name: 'Personalizado',
        description: 'Configura las variables desde cero',
        icon: <Variable size={20} />,
        gradient: 'from-gray-500 to-gray-600',
        fields: []
    }
];

const SECTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    company: { label: 'Empresa / Cliente', icon: <Building2 size={15} />, color: 'text-blue-400' },
    campaign: { label: 'Campaña / Estrategia', icon: <Target size={15} />, color: 'text-emerald-400' },
    personalization: { label: 'Personalización', icon: <PenLine size={15} />, color: 'text-purple-400' },
};

// ── Component ─────────────────────────────────────────────────────────

interface WorkflowVariablesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (variables: WorkflowVariable[], applyWithAI?: boolean) => void;
    initialVariables?: WorkflowVariable[];
    workflowVariables?: WorkflowVariable[];
    hasNodes?: boolean;
}

type ModalStep = 'template' | 'profile' | 'custom';

export const WorkflowVariablesModal: React.FC<WorkflowVariablesModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialVariables = [],
    workflowVariables = [],
    hasNodes = false
}) => {
    const [step, setStep] = useState<ModalStep>('template');
    const [selectedTemplate, setSelectedTemplate] = useState<VariabilizationTemplate | null>(null);
    const [profileValues, setProfileValues] = useState<Record<string, string>>({});
    const [customVariables, setCustomVariables] = useState<WorkflowVariable[]>([]);
    const [copiedVar, setCopiedVar] = useState<string | null>(null);

    // If there are already variables, go straight to editing
    useEffect(() => {
        if (isOpen) {
            if (initialVariables.length > 0) {
                setCustomVariables(initialVariables);
                setStep('custom');
                setSelectedTemplate(null);
                setProfileValues({});
            } else {
                setStep('template');
                setSelectedTemplate(null);
                setProfileValues({});
                setCustomVariables([]);
            }
        }
    }, [isOpen, initialVariables]);

    // ── Profile field handlers ──
    const updateProfileValue = (fieldName: string, value: string) => {
        setProfileValues(prev => ({ ...prev, [fieldName]: value }));
    };

    // ── Convert profile to WorkflowVariables ──
    const profileToVariables = (): WorkflowVariable[] => {
        if (!selectedTemplate) return [];

        return selectedTemplate.fields
            .filter(f => profileValues[f.name]?.trim())
            .map(f => ({
                id: `var_${f.name}`,
                name: f.name,
                label: f.label,
                type: f.type,
                defaultValue: profileValues[f.name] || '',
                description: f.description,
                required: f.required
            }));
    };

    // ── Merge all variables (profile + custom) ──
    const getAllVariables = (): WorkflowVariable[] => {
        const profileVars = profileToVariables();
        const customNames = new Set(customVariables.map(v => v.name));
        const filteredProfileVars = profileVars.filter(v => !customNames.has(v.name));
        return [...filteredProfileVars, ...customVariables];
    };

    // ── Custom variable CRUD ──
    const addCustomVariable = () => {
        const newVar: WorkflowVariable = {
            id: `var_${Date.now()}`,
            name: `variable_${customVariables.length + 1}`,
            label: 'Nueva Variable',
            type: 'text',
            defaultValue: '',
            description: '',
            required: false
        };
        setCustomVariables(prev => [...prev, newVar]);
    };

    const updateCustomVariable = (id: string, updates: Partial<WorkflowVariable>) => {
        setCustomVariables(vars => vars.map(v => v.id === id ? { ...v, ...updates } : v));
    };

    const deleteCustomVariable = (id: string) => {
        setCustomVariables(vars => vars.filter(v => v.id !== id));
    };

    const copyVarSyntax = (name: string) => {
        navigator.clipboard.writeText(`{{${name}}}`);
        setCopiedVar(name);
        setTimeout(() => setCopiedVar(null), 1500);
    };

    // ── Save ──
    const handleSave = (applyWithAI: boolean = false) => {
        const allVars = getAllVariables();

        const invalidVars = allVars.filter(v => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(v.name));
        if (invalidVars.length > 0) {
            alert('Los nombres de variables solo pueden contener letras, números y guiones bajos.');
            return;
        }

        if (applyWithAI && allVars.length === 0) {
            alert('Necesitas definir al menos una variable para aplicar con IA.');
            return;
        }

        onSave(allVars, applyWithAI);
        onClose();
    };

    // ── Select template ──
    const handleSelectTemplate = (template: VariabilizationTemplate) => {
        setSelectedTemplate(template);
        setProfileValues({});
        setCustomVariables([]);
        if (template.id === 'custom') {
            setStep('custom');
        } else {
            setStep('profile');
        }
    };

    if (!isOpen) return null;

    const allVars = getAllVariables();
    const filledCount = selectedTemplate
        ? selectedTemplate.fields.filter(f => profileValues[f.name]?.trim()).length
        : 0;
    const totalFields = selectedTemplate?.fields.length || 0;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">

                {/* ── Header ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${selectedTemplate?.gradient || 'from-purple-500 to-pink-500'} flex items-center justify-center shadow-lg`}>
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-white tracking-tight">
                                {step === 'template' && 'Variabilizar Sistema'}
                                {step === 'profile' && `Configurar: ${selectedTemplate?.name}`}
                                {step === 'custom' && (selectedTemplate ? `${selectedTemplate.name} — Variables` : 'Variables del Workflow')}
                            </h2>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                                {step === 'template' && 'Elige una plantilla para adaptar tu sistema a un cliente'}
                                {step === 'profile' && 'Rellena el perfil del cliente para variabilizar los prompts'}
                                {step === 'custom' && 'Gestiona las variables que personalizan tus workflows'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Breadcrumb */}
                        {step !== 'template' && (
                            <div className="flex items-center gap-1 text-[11px] text-gray-600 mr-3">
                                <button onClick={() => { setStep('template'); setSelectedTemplate(null); }} className="hover:text-gray-300 transition-colors">
                                    Plantillas
                                </button>
                                <ChevronRight size={10} />
                                {step === 'profile' && (
                                    <span className="text-gray-400">{selectedTemplate?.name}</span>
                                )}
                                {step === 'custom' && selectedTemplate && (
                                    <>
                                        <button onClick={() => setStep('profile')} className="hover:text-gray-300 transition-colors">
                                            {selectedTemplate.name}
                                        </button>
                                        <ChevronRight size={10} />
                                        <span className="text-gray-400">Variables</span>
                                    </>
                                )}
                                {step === 'custom' && !selectedTemplate && (
                                    <span className="text-gray-400">Variables</span>
                                )}
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-gray-500 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Content ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ▸ STEP 1: Template Selection ──────────────────── */}
                    {step === 'template' && (
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                {TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template)}
                                        className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-5 text-left transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                                                {template.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-white/90">
                                                    {template.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    {template.description}
                                                </p>
                                                {template.fields.length > 0 && (
                                                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-600">
                                                        <Variable size={10} />
                                                        {template.fields.length} campos preconfigurados
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors mt-1 shrink-0" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Sparkles size={16} className="text-purple-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            <span className="text-white font-medium">¿Cómo funciona?</span> Elige una plantilla, rellena los datos de tu cliente y el sistema generará variables que personalizan los prompts de tu workflow.
                                            Las variables se insertan con la sintaxis <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{'{{nombre_variable}}'}</code> y se reemplazan automáticamente al ejecutar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ▸ STEP 2: Client Profile ──────────────────────── */}
                    {step === 'profile' && selectedTemplate && (
                        <div className="p-6 space-y-6">
                            {/* Progress */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${selectedTemplate.gradient} rounded-full transition-all duration-500`}
                                        style={{ width: `${totalFields > 0 ? (filledCount / totalFields) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-[11px] text-gray-500 tabular-nums shrink-0">
                                    {filledCount}/{totalFields} completados
                                </span>
                            </div>

                            {/* Sections */}
                            {(['company', 'campaign', 'personalization'] as const).map(sectionKey => {
                                const sectionFields = selectedTemplate.fields.filter(f => f.section === sectionKey);
                                if (sectionFields.length === 0) return null;
                                const meta = SECTION_META[sectionKey];

                                return (
                                    <div key={sectionKey}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={meta.color}>{meta.icon}</span>
                                            <h3 className={`text-xs font-semibold uppercase tracking-wider ${meta.color}`}>
                                                {meta.label}
                                            </h3>
                                        </div>

                                        <div className="space-y-3">
                                            {sectionFields.map(field => (
                                                <div
                                                    key={field.id}
                                                    className="group bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 hover:bg-white/[0.04] transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">{field.icon}</span>
                                                            <label className="text-sm font-medium text-white">
                                                                {field.label}
                                                                {field.required && <span className="text-red-400 ml-1">*</span>}
                                                            </label>
                                                        </div>
                                                        <button
                                                            onClick={() => copyVarSyntax(field.name)}
                                                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-gray-500 hover:text-purple-400 transition-all"
                                                            title="Copiar sintaxis de variable"
                                                        >
                                                            {copiedVar === field.name ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                                                            <code>{`{{${field.name}}}`}</code>
                                                        </button>
                                                    </div>

                                                    {field.description && (
                                                        <p className="text-[11px] text-gray-600 mb-2">{field.description}</p>
                                                    )}

                                                    {field.type === 'textarea' ? (
                                                        <textarea
                                                            value={profileValues[field.name] || ''}
                                                            onChange={(e) => updateProfileValue(field.name, e.target.value)}
                                                            className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 resize-none transition-all"
                                                            rows={3}
                                                            placeholder={field.placeholder}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            value={profileValues[field.name] || ''}
                                                            onChange={(e) => updateProfileValue(field.name, e.target.value)}
                                                            className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all"
                                                            placeholder={field.placeholder}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add custom variable section */}
                            <div className="pt-2">
                                <button
                                    onClick={() => setStep('custom')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] border-dashed rounded-lg text-gray-500 hover:text-gray-300 text-xs transition-colors"
                                >
                                    <Plus size={14} />
                                    Agregar Variables Personalizadas
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ▸ STEP 3: Custom Variables ─────────────────────── */}
                    {step === 'custom' && (
                        <div className="p-6">
                            {/* Show profile variables summary if template was used */}
                            {selectedTemplate && selectedTemplate.fields.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Variables del Perfil
                                        </h3>
                                        <button
                                            onClick={() => setStep('profile')}
                                            className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            Editar perfil
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.fields
                                            .filter(f => profileValues[f.name]?.trim())
                                            .map(f => (
                                                <div
                                                    key={f.id}
                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px]"
                                                >
                                                    <Check size={10} className="text-green-400" />
                                                    <span className="text-gray-400">{f.label}</span>
                                                    <code className="text-purple-400 ml-1">{`{{${f.name}}}`}</code>
                                                </div>
                                            ))
                                        }
                                        {selectedTemplate.fields.filter(f => !profileValues[f.name]?.trim()).length > 0 && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-gray-600">
                                                +{selectedTemplate.fields.filter(f => !profileValues[f.name]?.trim()).length} sin rellenar
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Custom Variables Editor */}
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Variables Personalizadas
                                </h3>
                                <span className="text-[11px] text-gray-600">{customVariables.length} variable{customVariables.length !== 1 ? 's' : ''}</span>
                            </div>

                            {customVariables.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                        <Variable size={24} className="text-gray-600" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Sin variables personalizadas</p>
                                    <p className="text-[11px] text-gray-600 mb-5 max-w-sm">
                                        Agrega campos extra que no estén en la plantilla del perfil
                                    </p>
                                    <button
                                        onClick={addCustomVariable}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white text-xs font-medium transition-colors"
                                    >
                                        <Plus size={14} />
                                        Crear Variable
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {customVariables.map((variable) => (
                                        <div
                                            key={variable.id}
                                            className="group bg-white/[0.02] border border-white/[0.06] rounded-lg p-4 hover:bg-white/[0.04] transition-colors"
                                        >
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                                        Nombre de Variable *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={variable.name}
                                                        onChange={(e) => updateCustomVariable(variable.id, { name: e.target.value })}
                                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                        placeholder="nombre_variable"
                                                    />
                                                    <p className="text-[10px] text-gray-600 mt-1">
                                                        Usar como: <code className="text-purple-400">{'{{' + variable.name + '}}'}</code>
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                                                        Etiqueta *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={variable.label}
                                                        onChange={(e) => updateCustomVariable(variable.id, { label: e.target.value })}
                                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                        placeholder="Etiqueta visible"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Tipo</label>
                                                    <select
                                                        value={variable.type}
                                                        onChange={(e) => updateCustomVariable(variable.id, { type: e.target.value as any })}
                                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                    >
                                                        <option value="text">Texto corto</option>
                                                        <option value="textarea">Texto largo</option>
                                                        <option value="number">Número</option>
                                                        <option value="email">Email</option>
                                                        <option value="url">URL</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Valor por Defecto</label>
                                                    <input
                                                        type="text"
                                                        value={variable.defaultValue}
                                                        onChange={(e) => updateCustomVariable(variable.id, { defaultValue: e.target.value })}
                                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                        placeholder="Valor opcional"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <label className="block text-[11px] font-medium text-gray-500 mb-1">Descripción</label>
                                                    <input
                                                        type="text"
                                                        value={variable.description}
                                                        onChange={(e) => updateCustomVariable(variable.id, { description: e.target.value })}
                                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                        placeholder="Ayuda para el usuario que rellene este campo"
                                                    />
                                                </div>

                                                <div className="col-span-2 flex items-center justify-between pt-1">
                                                    <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={variable.required}
                                                            onChange={(e) => updateCustomVariable(variable.id, { required: e.target.checked })}
                                                            className="w-3.5 h-3.5 rounded border-white/20 bg-black/30 text-purple-500 focus:ring-purple-500"
                                                        />
                                                        Obligatorio
                                                    </label>
                                                    <button
                                                        onClick={() => deleteCustomVariable(variable.id)}
                                                        className="flex items-center gap-1.5 px-2.5 py-1 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-md text-[11px] transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addCustomVariable}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] border-dashed rounded-lg text-gray-500 hover:text-gray-300 text-xs transition-colors"
                                    >
                                        <Plus size={14} />
                                        Agregar Variable
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────── */}
                {step !== 'template' && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <Variable size={12} />
                                <span className="tabular-nums">{allVars.length} variable{allVars.length !== 1 ? 's' : ''} total{allVars.length !== 1 ? 'es' : ''}</span>
                            </div>
                            {allVars.length > 0 && (
                                <div className="h-3 w-px bg-white/[0.06]" />
                            )}
                            {allVars.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                    {allVars.filter(v => v.required).length} obligatoria{allVars.filter(v => v.required).length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-500 hover:text-white transition-colors text-xs"
                            >
                                Cancelar
                            </button>

                            {step === 'profile' && (
                                <button
                                    onClick={() => setStep('custom')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white text-xs font-medium transition-colors"
                                >
                                    <Plus size={14} />
                                    + Variables Extra
                                </button>
                            )}

                            <button
                                onClick={() => handleSave(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-white text-xs font-medium transition-colors"
                            >
                                <Save size={14} />
                                Guardar
                            </button>

                            {hasNodes && allVars.length > 0 && (
                                <button
                                    onClick={() => handleSave(true)}
                                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${selectedTemplate?.gradient || 'from-purple-500 to-pink-500'} hover:brightness-110 rounded-lg text-white text-xs font-medium transition-all shadow-lg`}
                                >
                                    <Sparkles size={14} />
                                    Guardar y Variabilizar con IA
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
