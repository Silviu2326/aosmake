import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loader2, CheckCircle } from 'lucide-react';

interface ImportSummaryProps {
    stats: {
        totalRows: number;
        mappedFields: number;
        estimatedTime: string;
        campaign?: string;
    };
    isLoading: boolean;
}

export function ImportSummary({ stats, isLoading }: ImportSummaryProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
                <div className="text-white font-medium">Processing Import...</div>
                <p className="text-sm text-gray-400">Validating {stats.totalRows} records...</p>
            </div>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-surface to-green-900/10 border-green-500/20">
            <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={32} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Ready to Import</h2>
                
                {stats.campaign && (
                    <p className="text-accent text-sm mb-2">
                        Campaign: <strong>{stats.campaign}</strong>
                    </p>
                )}
                
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                    You are about to import <strong className="text-white">{stats.totalRows} contacts</strong>.
                    Data will be normalized and checked for duplicates.
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{stats.totalRows}</div>
                        <div className="text-xs text-gray-500 uppercase mt-1">Contacts</div>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{stats.mappedFields}</div>
                        <div className="text-xs text-gray-500 uppercase mt-1">Fields</div>
                    </div>
                    <div className="bg-surface/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">~5s</div>
                        <div className="text-xs text-gray-500 uppercase mt-1">Est. Time</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
