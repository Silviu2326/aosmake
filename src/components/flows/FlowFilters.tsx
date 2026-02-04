import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { clsx } from 'clsx';
import { FlowStatus } from './FlowStatusBadge';

type FilterType = 'all' | FlowStatus;

interface FlowFiltersProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onSearch: (query: string) => void;
}

export function FlowFilters({ activeFilter, onFilterChange, onSearch }: FlowFiltersProps) {
    const tabs: { id: FilterType; label: string }[] = [
        { id: 'all', label: 'All Flows' },
        { id: 'active', label: 'Active' },
        { id: 'draft', label: 'Drafts' },
        { id: 'archived', label: 'Archived' },
    ];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Tabs */}
            <div className="flex p-1 bg-surfaceHighlight rounded-lg border border-white/5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onFilterChange(tab.id)}
                        className={clsx(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            activeFilter === tab.id
                                ? "bg-surface text-white shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search flows..."
                    className="pl-9 bg-surface border-white/10"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
        </div>
    );
}
