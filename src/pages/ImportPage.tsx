import React from 'react';
import { ImportWizard } from '../components/import/ImportWizard';

export function ImportPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Import Leads</h1>
                    <p className="text-gray-400 mt-1">Bulk upload contacts from CSV</p>
                </div>
            </div>

            <ImportWizard />
        </div>
    );
}
