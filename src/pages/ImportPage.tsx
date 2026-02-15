import React from 'react';
import { ImportWizard } from '../components/import/ImportWizard';
import { Upload, FileSpreadsheet, Users } from 'lucide-react';

export function ImportPage() {
    return (
        <div className="space-y-6">
            {/* Header Mejorado */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-gradient-to-r from-surface via-surface to-surface/80 border border-border/50 rounded-2xl">
                {/* Izquierda: Icono + Título + Info */}
                <div className="flex items-start gap-4">
                    {/* Icono Grande con fondo */}
                    <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
                        <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            className="w-7 h-7 text-blue-400"
                            stroke="currentColor" 
                            strokeWidth="1.5"
                        >
                            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    
                    {/* Título y subtítulo */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                                Importar Leads
                            </h1>
                            {/* Badge de formato */}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <FileSpreadsheet size={12} />
                                CSV
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                            Carga masiva de contactos desde archivo CSV
                        </p>
                        
                        {/* Info rápida */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5">
                                <Upload size={14} className="text-blue-400" />
                                <span className="text-xs text-gray-500">Arrastra o selecciona</span>
                            </div>
                            <div className="w-px h-4 bg-border/50" />
                            <div className="flex items-center gap-1.5">
                                <Users size={14} className="text-green-400" />
                                <span className="text-xs text-gray-500">Múltiples registros</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImportWizard />
        </div>
    );
}
