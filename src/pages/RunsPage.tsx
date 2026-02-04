import React, { useState, useEffect, useCallback } from 'react';
import { RunsTable, Run } from '../components/runs/RunsTable';
import { RunDetailPanel } from '../components/runs/RunDetailPanel';
import { RefreshCw, Play, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

// API URL
const API_URL = 'https://backendaos-production.up.railway.app/api';

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config = {
        success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
        failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
        running: { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
        cancelled: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' }
    };

    const { icon: Icon, color, bg } = config[status as keyof typeof config] || config.running;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${color}`}>
            <Icon size={12} />
            <span className="capitalize">{status}</span>
        </span>
    );
};

export function RunsPage() {
    const [activeStatus, setActiveStatus] = useState<'all' | string>('all');
    const [selectedRun, setSelectedRun] = useState<Run | null>(null);
    const [runs, setRuns] = useState<Run[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch runs from API
    const fetchRuns = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/workflows/runs`);
            if (!response.ok) {
                throw new Error('Failed to fetch runs');
            }
            const data = await response.json();
            
            // Transform API data to Run format
            const transformedRuns: Run[] = (data.runs || []).map((run: any) => ({
                id: run.id,
                workflowId: run.workflow_id || run.workflowId || '',
                workflowVersion: run.workflow_version || run.workflowVersion || '1.0',
                status: mapStatus(run.status),
                startTime: new Date(run.started_at || run.startTime || Date.now()),
                duration: run.duration || 0,
                type: run.type || 'precrafter',
                trigger: run.trigger || 'manual'
            }));

            setRuns(transformedRuns);
        } catch (err) {
            console.error('Error fetching runs:', err);
            setError('Failed to load runs');
            // Fallback to mock data
            setRuns(getMockRuns());
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch runs on mount
    useEffect(() => {
        fetchRuns();
    }, [fetchRuns]);

    // Filter runs by status
    const filteredRuns = runs.filter(run => {
        const statusMatch = activeStatus === 'all' || run.status === activeStatus;
        return statusMatch;
    });

    // Calculate stats
    const stats = {
        total: runs.length,
        success: runs.filter(r => r.status === 'success').length,
        failed: runs.filter(r => r.status === 'failed').length,
        running: runs.filter(r => r.status === 'running').length
    };

    return (
        <div className="p-6 min-h-screen bg-background">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Execution Runs</h1>
                <p className="text-gray-400 mt-1">Monitor your automation workflow executions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Total Runs</p>
                    <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Successful</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">{stats.success}</p>
                </div>
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Failed</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">{stats.failed}</p>
                </div>
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Running</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">{stats.running}</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <XCircle size={18} className="text-red-400" />
                    <p className="text-red-400 text-sm">{error}</p>
                    <span className="text-xs text-gray-500 ml-auto">Showing mock data</span>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'All', icon: Activity },
                        { key: 'success', label: 'Success', icon: CheckCircle },
                        { key: 'failed', label: 'Failed', icon: XCircle },
                        { key: 'running', label: 'Running', icon: Play },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveStatus(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeStatus === key
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                    : 'bg-surface text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
                            }`}
                        >
                            <Icon size={14} />
                            {label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                                activeStatus === key ? 'bg-white/20' : 'bg-white/10'
                            }`}>
                                {key === 'all' ? stats.total : key === 'success' ? stats.success : key === 'failed' ? stats.failed : stats.running}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Refresh Button */}
                <button
                    onClick={fetchRuns}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {isLoading && runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface border border-white/10 rounded-xl">
                    <RefreshCw size={32} className="text-accent animate-spin mb-4" />
                    <p className="text-gray-400">Loading runs...</p>
                </div>
            ) : filteredRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface border border-white/10 rounded-xl border-dashed">
                    <Activity size={48} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No runs found</p>
                    <p className="text-gray-500 text-sm mt-1">Execute a workflow to see results here</p>
                </div>
            ) : (
                <RunsTable
                    runs={filteredRuns}
                    onRunClick={setSelectedRun}
                />
            )}

            {/* Run Detail Panel */}
            {selectedRun && (
                <RunDetailPanel
                    run={selectedRun}
                    onClose={() => setSelectedRun(null)}
                />
            )}
        </div>
    );
}

// Helper to map API status to RunStatus
function mapStatus(status: string): 'success' | 'failed' | 'running' | 'cancelled' {
    const statusMap: Record<string, 'success' | 'failed' | 'running' | 'cancelled'> = {
        'completed': 'success',
        'succeeded': 'success',
        'success': 'success',
        'failed': 'failed',
        'error': 'failed',
        'running': 'running',
        'pending': 'running',
        'cancelled': 'cancelled',
        'canceled': 'cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'running';
}

// Fallback mock data
function getMockRuns(): Run[] {
    return [
        { id: 'r1', workflowId: 'w1', workflowVersion: '2.3', status: 'success', startTime: new Date(), duration: 4200, type: 'precrafter' },
        { id: 'r2', workflowId: 'w1', workflowVersion: '2.3', status: 'failed', startTime: new Date(Date.now() - 1000 * 60 * 15), duration: 1500, type: 'precrafter' },
        { id: 'r3', workflowId: 'w2', workflowVersion: '1.0', status: 'success', startTime: new Date(Date.now() - 1000 * 60 * 60), duration: 12500, type: 'crafter' },
        { id: 'r4', workflowId: 'w1', workflowVersion: '2.2', status: 'success', startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), duration: 3800, type: 'precrafter' },
        { id: 'r5', workflowId: 'w3', workflowVersion: '3.0', status: 'running', startTime: new Date(Date.now() - 5000), duration: 0, type: 'crafter' },
    ];
}
