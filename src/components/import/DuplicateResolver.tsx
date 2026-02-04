import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface DuplicateResolverProps {
    strategy: 'skip' | 'update' | 'append';
    onChange: (val: 'skip' | 'update' | 'append') => void;
}

export function DuplicateResolver({ strategy, onChange }: DuplicateResolverProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">If a contact with the same email already exists:</h3>

            <Card className={`cursor-pointer transition-colors border-2 ${strategy === 'skip' ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-white/5'}`} onClick={() => onChange('skip')}>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                        {strategy === 'skip' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                    <div>
                        <div className="font-medium text-white">Skip import</div>
                        <div className="text-sm text-gray-400">Keep the existing record and ignore the new data.</div>
                    </div>
                </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors border-2 ${strategy === 'update' ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-white/5'}`} onClick={() => onChange('update')}>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                        {strategy === 'update' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                    <div>
                        <div className="font-medium text-white">Update missing fields</div>
                        <div className="text-sm text-gray-400">Enrich existing record with new data only if empty.</div>
                    </div>
                </CardContent>
            </Card>

            <Card className={`cursor-pointer transition-colors border-2 ${strategy === 'append' ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-white/5'}`} onClick={() => onChange('append')}>
                <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center">
                        {strategy === 'append' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                    <div>
                        <div className="font-medium text-white">Create duplicate (not recommended)</div>
                        <div className="text-sm text-gray-400">Import as a new contact regardless of duplicates.</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
