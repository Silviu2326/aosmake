import React from 'react';
import { Button } from '../ui/Button';
import { RotateCw, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { RunStatus } from './RunStatusBadge';

type RunType = 'precrafter' | 'crafter';
type FilterStatus = 'all' | RunStatus;

interface RunsHeaderProps {
    activeType: RunType;
    onTypeChange: (type: RunType) => void;
    activeStatus: FilterStatus;
    onStatusChange: (status: FilterStatus) => void;
    onRefresh: () => void;
}

export function RunsHeader({ activeType, onTypeChange, activeStatus, onStatusChange, onRefresh }: RunsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 bg-background z-10 sticky top-0">

            {/* Run Type Toggle */}
            <div className="flex p-1 bg-surfaceHighlight rounded-lg border border-white/5">
                <button
                    onClick={() => onTypeChange('precrafter')}
                    className={clsx(
                        "px-4 py-2 text-sm font-medium rounded-md transition-all",
                        activeType === 'precrafter'
                            ? "bg-surface text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                    )}
                >
                    PreCrafter
                </button>
                <button
                    onClick={() => onTypeChange('crafter')}
                    className={clsx(
                        "px-4 py-2 text-sm font-medium rounded-md transition-all",
                        activeType === 'crafter'
                            ? "bg-surface text-white shadow-sm"
                            : "text-gray-400 hover:text-white"
                    )}
                >
                    Crafter
                </button>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1 bg-surfaceHighlight rounded-lg p-1 border border-white/5">
                    {['all', 'success', 'failed', 'running'].map((status) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status as FilterStatus)}
                            className={clsx(
                                "px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize",
                                activeStatus === status
                                    ? "bg-white/10 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh">
                    <RotateCw size={18} />
                </Button>
            </div>
        </div>
    );
}
