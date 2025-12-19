import React, { useEffect, useState } from 'react';
import { X, Clock, RotateCcw, AlertTriangle, FolderOpen } from 'lucide-react';
import { Node, Edge } from 'reactflow';

interface Version {
    version: number;
    created_at: string;
    label?: string;
}

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'precrafter' | 'crafter';
    onRestore: (nodes: Node[], edges: Edge[]) => void;
    currentVersion?: number;
}

// Ensure we are using the correct backend URL
const getApiUrl = (endpoint: string) => {
    return `https://backendaos-production.up.railway.app/api/workflows/${endpoint}`;
};

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ 
    isOpen, 
    onClose, 
    type,
    onRestore
}) => {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [previewData, setPreviewData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchVersions();
            setSelectedVersion(null);
            setPreviewData(null);
        }
    }, [isOpen, type]);

    const fetchVersions = async () => {
        setIsLoading(true);
        try {
            const url = getApiUrl(`${type}/versions`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setVersions(data);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVersionClick = async (version: number) => {
        if (selectedVersion === version) return;
        
        setSelectedVersion(version);
        try {
            const url = getApiUrl(`${type}/versions/${version}`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPreviewData({ nodes: data.nodes || [], edges: data.edges || [] });
            }
        } catch (error) {
            console.error('Failed to fetch version details:', error);
        }
    };

    const handleRestore = () => {
        if (previewData) {
            if (window.confirm('Are you sure you want to open this version? Current unsaved changes will be lost.')) {
                onRestore(previewData.nodes, previewData.edges);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#121212] border border-white/10 rounded-xl shadow-2xl w-[800px] h-[600px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-gray-400" />
                        <h2 className="text-sm font-semibold text-white">Version History</h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20 uppercase">
                            {type}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: List of Versions */}
                    <div className="w-64 border-r border-white/5 overflow-y-auto bg-[#0A0A0A]">
                        {isLoading ? (
                            <div className="p-4 text-center text-xs text-gray-500">Loading history...</div>
                        ) : versions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-gray-500">No versions found.</div>
                        ) : (
                            <div className="flex flex-col">
                                {versions.map((v) => (
                                    <button
                                        key={v.version}
                                        onClick={() => handleVersionClick(v.version)}
                                        className={`flex flex-col items-start p-3 border-b border-white/5 transition-colors text-left ${
                                            selectedVersion === v.version 
                                                ? 'bg-blue-500/10 border-l-2 border-l-blue-500' 
                                                : 'hover:bg-white/5 border-l-2 border-l-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between w-full mb-1">
                                            <span className={`text-xs font-medium ${selectedVersion === v.version ? 'text-blue-400' : 'text-gray-300'}`}>
                                                v{v.version} {v.label ? `- ${v.label}` : ''}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(v.created_at).toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Main Area: Preview Details */}
                    <div className="flex-1 bg-[#121212] flex flex-col">
                        {selectedVersion ? (
                            <div className="flex-1 flex flex-col">
                                <div className="p-6 flex-1 overflow-y-auto">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <span className="text-lg font-bold text-blue-400">{selectedVersion}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-white">
                                                Version {selectedVersion} 
                                                {versions.find(v => v.version === selectedVersion)?.label && (
                                                    <span className="ml-2 text-sm text-gray-400 font-normal">
                                                        ({versions.find(v => v.version === selectedVersion)?.label})
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Created on {versions.find(v => v.version === selectedVersion)?.created_at ? new Date(versions.find(v => v.version === selectedVersion)!.created_at).toLocaleString() : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Nodes</span>
                                            <div className="text-2xl font-light text-white mt-1">
                                                {previewData?.nodes.length || 0}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Edges</span>
                                            <div className="text-2xl font-light text-white mt-1">
                                                {previewData?.edges.length || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mini Node List Preview */}
                                    <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                        <div className="bg-white/5 px-4 py-2 text-xs font-medium text-gray-400 border-b border-white/5">
                                            Included Nodes
                                        </div>
                                        <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                                            {previewData?.nodes.map(node => (
                                                <div key={node.id} className="px-4 py-2 flex items-center justify-between">
                                                    <span className="text-xs text-gray-300">{node.data.label || 'Untitled Node'}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-500">{node.data.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-4 border-t border-white/5 bg-surface/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-yellow-500/80 text-xs">
                                        <AlertTriangle size={14} />
                                        <span>Opening will replace current workspace</span>
                                    </div>
                                    <button 
                                        onClick={handleRestore}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-medium transition-colors"
                                    >
                                        <FolderOpen size={14} />
                                        Abrir esta versión
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <Clock size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">Select a version from the history list</p>
                                <p className="text-xs opacity-60 mt-1">to preview and restore</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
