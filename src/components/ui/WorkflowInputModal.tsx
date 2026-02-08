import React, { useState, useEffect } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';
import { WorkflowVariable } from '../../types/workflowVariables';

interface WorkflowInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: Record<string, string>) => void;
    variables: WorkflowVariable[];
}

export const WorkflowInputModal: React.FC<WorkflowInputModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    variables
}) => {
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            // Initialize with default values
            const initialValues: Record<string, string> = {};
            variables.forEach(v => {
                initialValues[v.name] = v.defaultValue || '';
            });
            setValues(initialValues);
            setErrors({});
        }
    }, [isOpen, variables]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        variables.forEach(v => {
            const value = values[v.name] || '';

            if (v.required && !value.trim()) {
                newErrors[v.name] = 'Este campo es obligatorio';
                return;
            }

            if (value && v.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors[v.name] = 'Email no válido';
                }
            }

            if (value && v.type === 'url') {
                try {
                    new URL(value);
                } catch {
                    newErrors[v.name] = 'URL no válida';
                }
            }

            if (value && v.type === 'number') {
                if (isNaN(Number(value))) {
                    newErrors[v.name] = 'Debe ser un número';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(values);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-150">
            <div className="bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Configurar Workflow</h2>
                        <p className="text-xs text-gray-500">Completa los campos para ejecutar el workflow</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-5">
                        {variables.map((variable) => (
                            <div key={variable.id}>
                                <label className="block text-sm font-medium text-white mb-2">
                                    {variable.label}
                                    {variable.required && <span className="text-red-400 ml-1">*</span>}
                                </label>

                                {variable.description && (
                                    <p className="text-xs text-gray-500 mb-2">{variable.description}</p>
                                )}

                                {variable.type === 'textarea' ? (
                                    <textarea
                                        value={values[variable.name] || ''}
                                        onChange={(e) => setValues({ ...values, [variable.name]: e.target.value })}
                                        className={`w-full bg-black/20 border ${
                                            errors[variable.name] ? 'border-red-500' : 'border-white/10'
                                        } rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none`}
                                        rows={4}
                                        placeholder={variable.defaultValue || `Ingresa ${variable.label.toLowerCase()}`}
                                    />
                                ) : (
                                    <input
                                        type={variable.type === 'number' ? 'number' : 'text'}
                                        value={values[variable.name] || ''}
                                        onChange={(e) => setValues({ ...values, [variable.name]: e.target.value })}
                                        className={`w-full bg-black/20 border ${
                                            errors[variable.name] ? 'border-red-500' : 'border-white/10'
                                        } rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        placeholder={variable.defaultValue || `Ingresa ${variable.label.toLowerCase()}`}
                                    />
                                )}

                                {errors[variable.name] && (
                                    <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs">
                                        <AlertCircle size={12} />
                                        <span>{errors[variable.name]}</span>
                                    </div>
                                )}

                                {/* Show variable name hint */}
                                <p className="text-[10px] text-gray-600 mt-1.5">
                                    Variable: <code className="text-purple-400">{'{{' + variable.name + '}}'}</code>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                        <Play size={16} />
                        Ejecutar Workflow
                    </button>
                </div>
            </div>
        </div>
    );
};
