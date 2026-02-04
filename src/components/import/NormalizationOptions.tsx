import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface NormalizationProps {
    options: {
        trimWhitespace: boolean;
        capitalizeNames: boolean;
        lowercaseEmails: boolean;
        removeDuplicatesFile: boolean;
    };
    onChange: (key: string, val: boolean) => void;
}

export function NormalizationOptions({ options, onChange }: NormalizationProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Data Formatting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                            checked={options.trimWhitespace}
                            onChange={(e) => onChange('trimWhitespace', e.target.checked)}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-gray-200">Trim Whitespace</div>
                            <div className="text-gray-500">Remove leading and trailing spaces</div>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                            checked={options.capitalizeNames}
                            onChange={(e) => onChange('capitalizeNames', e.target.checked)}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-gray-200">Proper Case Names</div>
                            <div className="text-gray-500">Convert "JOHN DOE" to "John Doe"</div>
                        </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                            checked={options.lowercaseEmails}
                            onChange={(e) => onChange('lowercaseEmails', e.target.checked)}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-gray-200">Lowercase Emails</div>
                            <div className="text-gray-500">Standardize email addresses</div>
                        </div>
                    </label>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Validation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="rounded border-gray-600 bg-background text-accent focus:ring-accent"
                            checked={options.removeDuplicatesFile}
                            onChange={(e) => onChange('removeDuplicatesFile', e.target.checked)}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-gray-200">Remove File Duplicates</div>
                            <div className="text-gray-500">Scan file for duplicate emails</div>
                        </div>
                    </label>
                </CardContent>
            </Card>
        </div>
    );
}
