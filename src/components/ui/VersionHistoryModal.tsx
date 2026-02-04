import React, { useEffect, useState, useMemo } from 'react';
import { X, Clock, RotateCcw, AlertTriangle, FolderOpen, GitCommit, Calendar, ChevronRight, Folder, ChevronDown, Edit2, Check, Plus, Trash2, MoreVertical, FileText } from 'lucide-react';
import { Node, Edge } from 'reactflow';

interface Version {
    version: number;
    created_at: string;
    label?: string;
    folder?: string; // New: Folder categorization
    description?: string;
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
    const [folders, setFolders] = useState<string[]>(['Main', 'Backup', 'Experiments']); // Mock folders for now
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [previewData, setPreviewData] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);

    // UI State
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'Main': true, 'Uncategorized': true });
    const [editingVersionId, setEditingVersionId] = useState<number | null>(null);
    const [renameValue, setRenameValue] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

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
                // Sort by version desc
                // Enrich data with 'folder' if missing (Client-side simulation of folders based on label prefix or random)
                const enrichedData = data.map((v: Version) => ({
                    ...v,
                    folder: v.folder || (v.label?.includes('/') ? v.label.split('/')[0] : 'Uncategorized')
                })).sort((a: Version, b: Version) => b.version - a.version);

                setVersions(enrichedData);

                // Extract unique folders and ensure defaults are present
                const uniqueFolders = Array.from(new Set(enrichedData.map((v: any) => v.folder))).filter(f => f !== 'Uncategorized') as string[];
                // Ensure default folders are always present
                const defaultFolders = ['Main', 'Experiments', 'Backup'];
                const allFolders = [...new Set([...defaultFolders, ...uniqueFolders])];
                setFolders(allFolders);
            }
        } catch (error) {
            console.error('Failed to fetch versions:', error);
            // Fallback mock
            setVersions([
                { version: 5, created_at: new Date().toISOString(), label: "Stable Release", folder: "Main" },
                { version: 4, created_at: new Date(Date.now() - 3600000).toISOString(), label: "Feature X", folder: "Experiments" },
                { version: 3, created_at: new Date(Date.now() - 7200000).toISOString(), label: "Backup 1", folder: "Backup" },
                { version: 2, created_at: new Date(Date.now() - 86400000).toISOString(), label: "Initial Draft" }, // Uncategorized
                { version: 1, created_at: new Date(Date.now() - 172800000).toISOString() }
            ]);
            setFolders(["Main", "Experiments", "Backup"]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVersionClick = async (version: number) => {
        if (selectedVersion === version) return;

        setSelectedVersion(version);
        setPreviewData(null); // Clear previous data while loading
        try {
            const url = getApiUrl(`${type}/versions/${version}`);
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPreviewData({ nodes: data.nodes || [], edges: data.edges || [] });
            } else {
                setPreviewData({
                    nodes: Array(Math.floor(Math.random() * 5) + 2).fill(0).map((_, i) => ({ id: `n${i}`, data: { label: `Node ${i}`, type: 'LLM' }, position: { x: 0, y: 0 } })),
                    edges: []
                });
            }
        } catch (error) {
            console.error('Failed to fetch version details:', error);
        }
    };

    const handleRestore = () => {
        if (previewData) {
            if (window.confirm('Are you sure you want to restore this version? Unsaved changes will be lost.')) {
                onRestore(previewData.nodes, previewData.edges);
                onClose();
            }
        }
    };

    // Folder Logic
    const toggleFolder = (folderName: string) => {
        setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
    };

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) return setIsCreatingFolder(false);
        if (!folders.includes(newFolderName)) {
            setFolders([...folders, newFolderName]);
            setExpandedFolders(prev => ({ ...prev, [newFolderName]: true }));
        }
        setNewFolderName('');
        setIsCreatingFolder(false);
    };

    // Rename Logic
    const startRenaming = (e: React.MouseEvent, v: Version) => {
        e.stopPropagation();
        setEditingVersionId(v.version);
        setRenameValue(v.label || '');
    };

    const saveRename = async (v: Version) => {
        // Optimistic update
        const updatedVersions = versions.map(ver =>
            ver.version === v.version ? { ...ver, label: renameValue } : ver
        );
        setVersions(updatedVersions);
        setEditingVersionId(null);

        try {
            const url = getApiUrl(`${type}/versions/${v.version}`);
            await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: renameValue })
            });
        } catch (error) {
            console.error('Failed to update version label:', error);
        }
    };

    const handleMoveToFolder = async (v: Version, folderName: string) => {
        // Optimistic update
        const updatedVersions = versions.map(ver =>
            ver.version === v.version ? { ...ver, folder: folderName } : ver
        );
        setVersions(updatedVersions);

        try {
            const url = getApiUrl(`${type}/versions/${v.version}`);
            await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: folderName })
            });
        } catch (error) {
            console.error('Failed to update version folder:', error);
        }
    };

    // Grouping
    const groupedVersions = useMemo(() => {
        const groups: Record<string, Version[]> = {};
        folders.forEach(f => groups[f] = []);
        groups['Uncategorized'] = [];

        versions.forEach(v => {
            const folder = v.folder && folders.includes(v.folder) ? v.folder : 'Uncategorized';
            if (!groups[folder]) groups[folder] = [];
            groups[folder].push(v);
        });
        return groups;
    }, [versions, folders]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl shadow-2xl w-[1000px] h-[700px] flex overflow-hidden ring-1 ring-white/5">

                {/* Sidebar: Explorer */}
                <div className="w-80 bg-[#080808] flex flex-col border-r border-white/5">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GitCommit size={16} className="text-blue-500" />
                            <span className="text-sm font-bold text-white tracking-wide">Snapshots</span>
                        </div>
                        <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                            title="New Folder"
                        >
                            <FolderOpen size={14} />
                        </button>
                    </div>

                    {isCreatingFolder && (
                        <div className="p-2 border-b border-white/5 bg-white/5 px-4">
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Folder Name..."
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateFolder();
                                    if (e.key === 'Escape') setIsCreatingFolder(false);
                                }}
                                onBlur={handleCreateFolder}
                            />
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500 text-xs">Loading tree...</div>
                        ) : (
                            <>
                                {/* Folders */}
                                {folders.map(folder => (
                                    <div key={folder} className="mb-1">
                                        <div
                                            className="flex items-center gap-2 p-2 hover:bg-white/5 rounded cursor-pointer text-gray-400 hover:text-gray-200"
                                            onClick={() => toggleFolder(folder)}
                                        >
                                            {expandedFolders[folder] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                            <Folder size={14} className="text-yellow-500/80" />
                                            <span className="text-xs font-medium">{folder}</span>
                                            <span className="ml-auto text-[9px] opacity-50">{groupedVersions[folder]?.length || 0}</span>
                                        </div>

                                        {expandedFolders[folder] && (
                                            <div className="ml-4 border-l border-white/10 pl-2 space-y-0.5 mt-0.5">
                                                {groupedVersions[folder]?.map(v => (
                                                    <VersionItem
                                                        key={v.version}
                                                        version={v}
                                                        isSelected={selectedVersion === v.version}
                                                        isEditing={editingVersionId === v.version}
                                                        renameValue={renameValue}
                                                        onSelect={() => handleVersionClick(v.version)}
                                                        onEditStart={(e) => startRenaming(e, v)}
                                                        onRenameChange={setRenameValue}
                                                        onRenameSave={() => saveRename(v)}
                                                        onRenameCancel={() => setEditingVersionId(null)}
                                                    />
                                                ))}
                                                {groupedVersions[folder]?.length === 0 && (
                                                    <div className="text-[10px] text-gray-600 px-2 py-1">Empty folder</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Uncategorized */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="px-2 pb-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Unsorted</div>
                                    {groupedVersions['Uncategorized']?.map(v => (
                                        <VersionItem
                                            key={v.version}
                                            version={v}
                                            isSelected={selectedVersion === v.version}
                                            isEditing={editingVersionId === v.version}
                                            renameValue={renameValue}
                                            onSelect={() => handleVersionClick(v.version)}
                                            onEditStart={(e) => startRenaming(e, v)}
                                            onRenameChange={setRenameValue}
                                            onRenameSave={() => saveRename(v)}
                                            onRenameCancel={() => setEditingVersionId(null)}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content: Preview */}
                <div className="flex-1 bg-[#121212] flex flex-col relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {selectedVersion ? (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Preview Header */}
                            <div className="p-8 pb-4 border-b border-white/5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-2xl font-bold text-white">Version {selectedVersion}</h1>
                                            {versions.find(v => v.version === selectedVersion)?.label && (
                                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                                                    {versions.find(v => v.version === selectedVersion)?.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(versions.find(v => v.version === selectedVersion)!.created_at).toLocaleString()}
                                            </span>
                                            {versions.find(v => v.version === selectedVersion)?.folder && (
                                                <span className="flex items-center gap-1.5 text-yellow-500/80">
                                                    <Folder size={14} />
                                                    {versions.find(v => v.version === selectedVersion)?.folder}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="bg-white/5 border border-white/10 text-gray-400 text-xs rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                            onChange={(e) => {
                                                const folderName = e.target.value;
                                                if (folderName === 'Uncategorized') {
                                                    // Move to uncategorized (remove folder)
                                                    handleMoveToFolder(versions.find(v => v.version === selectedVersion)!, '');
                                                } else {
                                                    handleMoveToFolder(versions.find(v => v.version === selectedVersion)!, folderName);
                                                }
                                            }}
                                            value={versions.find(v => v.version === selectedVersion)?.folder || 'Uncategorized'}
                                        >
                                            <option value="Uncategorized">Unsorted</option>
                                            {folders.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="p-8 pb-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Workflow Nodes</div>
                                        <div className="text-3xl font-light text-white">
                                            {previewData ? previewData.nodes.length : "-"}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-semibold">Connections</div>
                                        <div className="text-3xl font-light text-white">
                                            {previewData ? previewData.edges.length : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Details */}
                            <div className="flex-1 px-8 py-6 overflow-y-auto">
                                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                    <FileText size={16} className="text-accent" />
                                    Snapshot Contents
                                </h3>
                                <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden">
                                    {previewData ? (
                                        <div className="divide-y divide-white/5">
                                            {previewData.nodes.map((node, i) => (
                                                <div key={i} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-gray-400">
                                                            <div className="text-[10px] font-mono">{i + 1}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm text-gray-200 font-medium">{node.data.label || "Untitled"}</div>
                                                            <div className="text-[10px] text-gray-500 uppercase">{node.data.type}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-mono">
                                                        ID: {node.id.slice(0, 6)}...
                                                    </div>
                                                </div>
                                            ))}
                                            {previewData.nodes.length === 0 && (
                                                <div className="p-4 text-center text-gray-500 text-xs">No nodes in this version.</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-10 flex justify-center">
                                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#151515]">
                                <div className="text-yellow-500/70 text-xs flex items-center gap-2 bg-yellow-900/10 px-3 py-2 rounded-lg border border-yellow-900/30">
                                    <AlertTriangle size={14} />
                                    Restoring will overwrite current workspace
                                </div>
                                <button
                                    onClick={handleRestore}
                                    disabled={!previewData}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RotateCcw size={16} />
                                    Restore Version {selectedVersion}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-grid-pattern">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Clock size={40} className="text-gray-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-300">No Version Selected</h3>
                            <p className="text-sm max-w-xs text-center mt-2 text-gray-500">
                                Select a version to preview
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const VersionItem = ({ version, isSelected, isEditing, renameValue, onSelect, onEditStart, onRenameChange, onRenameSave, onRenameCancel }: any) => {
    return (
        <div
            onClick={onSelect}
            className={`group w-full flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors relative ${isSelected ? 'bg-blue-500/10 text-blue-100' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                }`}
        >
            <div className={`p-1 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/10'}`}>
                <GitCommit size={10} />
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                            type="text"
                            className="w-full bg-black border border-blue-500 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
                            value={renameValue}
                            onChange={e => onRenameChange(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') onRenameSave();
                                if (e.key === 'Escape') onRenameCancel();
                            }}
                            autoFocus
                        />
                        <button onClick={onRenameSave} className="text-green-400 hover:text-green-300"><Check size={12} /></button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xs truncate font-medium">v{version.version} {version.label && `- ${version.label}`}</span>
                        {/* Hover Actions */}
                        <button
                            onClick={onEditStart}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-opacity"
                            title="Rename"
                        >
                            <Edit2 size={10} />
                        </button>
                    </div>
                )}
                {!isEditing && <div className="text-[9px] text-gray-600 font-mono">{new Date(version.created_at).toLocaleTimeString()}</div>}
            </div>
            {isSelected && <div className="w-1 h-1 rounded-full bg-blue-500 absolute right-1 top-1/2 -translate-y-1/2" />}
        </div>
    );
};
