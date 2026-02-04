import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface LeadFiltersProps {
    onSearch: (query: string) => void;
    onFilterChange: (key: string, value: any) => void;
    onClear: () => void;
}

export function LeadFilters({ onSearch, onFilterChange, onClear }: LeadFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface border-b border-white/5">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search leads by name, email or company..."
                    className="pl-9 bg-surfaceHighlight border-white/10"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                {/* Placeholder dropdowns for filters */}
                <Button variant="outline" className="gap-2">
                    <Filter size={14} />
                    Status
                </Button>
                <Button variant="outline" className="gap-2">
                    <Filter size={14} />
                    Source
                </Button>
                <Button variant="ghost" onClick={onClear} className="text-gray-400 hover:text-white">
                    <X size={14} className="mr-1" /> Clear
                </Button>
            </div>
        </div>
    );
}
