import React, { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '../ui/Button';

interface FileUploaderProps {
    onFileSelect: (file: File, rowCount: number, headers: string[]) => void;
}

async function countCSVRows(file: File): Promise<number> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim().length > 0);
            // Restar 1 por la fila de headers
            resolve(Math.max(0, lines.length - 1));
        };
        reader.readAsText(file.slice(0, 1024 * 1024)); // Leer solo los primeros 1MB para contar
    });
}

async function getCSVHeaders(file: File): Promise<string[]> {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
                // Parse header line (handle quoted values)
                const headerLine = lines[0];
                const headers: string[] = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < headerLine.length; i++) {
                    const char = headerLine[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        headers.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                headers.push(current.trim());
                resolve(headers);
            } else {
                resolve([]);
            }
        };
        reader.onerror = () => resolve([]);
        reader.readAsText(file.slice(0, 1024 * 1024));
    });
}

export function FileUploader({ onFileSelect }: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            const [rowCount, headers] = await Promise.all([
                countCSVRows(file),
                getCSVHeaders(file)
            ]);
            onFileSelect(file, rowCount, headers);
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const [rowCount, headers] = await Promise.all([
                countCSVRows(file),
                getCSVHeaders(file)
            ]);
            onFileSelect(file, rowCount, headers);
        }
    };

    return (
        <div
            className="border-2 border-dashed border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <div className="w-16 h-16 rounded-full bg-surfaceHighlight flex items-center justify-center mb-6 text-accent">
                <Upload size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Upload your CSV file</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Drag and drop your file here, or click to browse.
                Supported columns: First Name, Last Name, Email, Company, LinkedIn...
            </p>

            <input
                type="file"
                ref={inputRef}
                className="hidden"
                accept=".csv"
                onChange={handleChange}
            />

            <Button variant="secondary">Browse Files</Button>

            <div className="mt-8 flex items-center gap-2 text-xs text-gray-500">
                <FileSpreadsheet size={14} />
                <span>Template available for download</span>
            </div>
        </div>
    );
}
