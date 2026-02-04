import React, { useState, useEffect, useMemo } from 'react';
import { X, Table, Code, Upload, Download, FileInput, AlertCircle } from 'lucide-react';

interface CsvInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (csv: string) => void;
    initialValue: string;
    nodeLabel: string;
}

// Robust CSV parser that handles quoted values, different delimiters, etc.
function parseCSV(text: string, delimiter: string = ','): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote
                    currentCell += '"';
                    i++;
                } else {
                    // End of quoted section
                    inQuotes = false;
                }
            } else {
                currentCell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === delimiter) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if (char === '\r' && nextChar === '\n') {
                // Windows line ending
                currentRow.push(currentCell.trim());
                rows.push(currentRow);
                currentRow = [];
                currentCell = '';
                i++; // Skip \n
            } else if (char === '\n') {
                // Unix line ending
                currentRow.push(currentCell.trim());
                rows.push(currentRow);
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
    }

    // Don't forget the last cell and row
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
    }

    return rows;
}

// Detect the most likely delimiter
function detectDelimiter(text: string): string {
    const firstLine = text.split(/\r?\n/)[0] || '';

    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    for (const d of delimiters) {
        // Count occurrences outside of quotes
        let count = 0;
        let inQuotes = false;
        for (const char of firstLine) {
            if (char === '"') inQuotes = !inQuotes;
            if (!inQuotes && char === d) count++;
        }
        if (count > maxCount) {
            maxCount = count;
            bestDelimiter = d;
        }
    }

    return bestDelimiter;
}

// Convert parsed data back to CSV string
function toCSVString(rows: string[][], delimiter: string): string {
    return rows.map(row =>
        row.map(cell => {
            // Quote cells that contain delimiter, quotes, or newlines
            if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(delimiter)
    ).join('\n');
}

export const CsvInputModal: React.FC<CsvInputModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialValue,
    nodeLabel
}) => {
    const [csvContent, setCsvContent] = useState(initialValue);
    const [viewMode, setViewMode] = useState<'table' | 'raw'>('table');
    const [delimiter, setDelimiter] = useState<string>(',');

    useEffect(() => {
        setCsvContent(initialValue);
        if (initialValue) {
            setDelimiter(detectDelimiter(initialValue));
        }
    }, [initialValue]);

    const parsedData = useMemo(() => {
        if (!csvContent.trim()) return { headers: [], rows: [], allRows: [] };

        const allRows = parseCSV(csvContent, delimiter);
        if (allRows.length === 0) return { headers: [], rows: [], allRows: [] };

        const headers = allRows[0] || [];
        const rows = allRows.slice(1);

        return { headers, rows, allRows };
    }, [csvContent, delimiter]);

    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        const newAllRows = [...parsedData.allRows];
        if (newAllRows[rowIndex + 1]) {
            newAllRows[rowIndex + 1] = [...newAllRows[rowIndex + 1]];
            newAllRows[rowIndex + 1][colIndex] = value;
        }
        setCsvContent(toCSVString(newAllRows, delimiter));
    };

    const handleHeaderChange = (colIndex: number, value: string) => {
        const newAllRows = [...parsedData.allRows];
        if (newAllRows[0]) {
            newAllRows[0] = [...newAllRows[0]];
            newAllRows[0][colIndex] = value;
        }
        setCsvContent(toCSVString(newAllRows, delimiter));
    };

    const addRow = () => {
        const emptyRow = parsedData.headers.map(() => '');
        const newAllRows = [...parsedData.allRows, emptyRow];
        setCsvContent(toCSVString(newAllRows, delimiter));
    };

    const addColumn = () => {
        const newAllRows = parsedData.allRows.map((row, i) =>
            [...row, i === 0 ? 'newColumn' : '']
        );
        setCsvContent(toCSVString(newAllRows, delimiter));
    };

    const handleSave = () => {
        onSave(csvContent);
        onClose();
    };

    const handleExport = () => {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nodeLabel.replace(/\s+/g, '_')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setCsvContent(content);
            setDelimiter(detectDelimiter(content));
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleDelimiterChange = (newDelimiter: string) => {
        // Re-parse with new delimiter
        setDelimiter(newDelimiter);
    };

    if (!isOpen) return null;

    const delimiterLabel = delimiter === ',' ? 'Comma' : delimiter === ';' ? 'Semicolon' : delimiter === '\t' ? 'Tab' : 'Pipe';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[90vw] max-w-[1200px] max-h-[85vh] bg-[#111] border border-white/10 rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <FileInput size={18} className="text-green-400" />
                        <span className="text-white font-semibold">{nodeLabel}</span>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">CSV Input Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Delimiter Selector */}
                        <div className="flex items-center gap-1 mr-2">
                            <span className="text-[10px] text-gray-500">Delimiter:</span>
                            <select
                                value={delimiter}
                                onChange={(e) => handleDelimiterChange(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none"
                            >
                                <option value=",">Comma (,)</option>
                                <option value=";">Semicolon (;)</option>
                                <option value="&#9;">Tab</option>
                                <option value="|">Pipe (|)</option>
                            </select>
                        </div>
                        <div className="flex bg-white/5 rounded-lg p-0.5">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'table' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Table size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('raw')}
                                className={`px-3 py-1 rounded text-xs transition-colors ${viewMode === 'raw' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Code size={14} />
                            </button>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-4">
                    {viewMode === 'table' ? (
                        <div className="h-full flex flex-col">
                            {parsedData.headers.length > 20 && (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                                    <AlertCircle size={14} />
                                    Large dataset: {parsedData.headers.length} columns, {parsedData.rows.length} rows. Scroll horizontally to see all columns.
                                </div>
                            )}
                            <div className="flex-1 overflow-auto border border-white/10 rounded">
                                <table className="border-collapse min-w-full">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-white/10 bg-[#1a1a1a] px-1 py-1 text-[10px] text-gray-500 font-mono w-10 sticky left-0 z-20">
                                                #
                                            </th>
                                            {parsedData.headers.map((header, i) => (
                                                <th key={i} className="border border-white/10 bg-[#1a1a1a] p-0 min-w-[120px] max-w-[200px]">
                                                    <input
                                                        type="text"
                                                        value={header}
                                                        onChange={(e) => handleHeaderChange(i, e.target.value)}
                                                        className="w-full bg-transparent px-2 py-1.5 text-xs font-semibold text-green-400 focus:outline-none focus:bg-white/5 truncate"
                                                        title={header}
                                                    />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.rows.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-white/5">
                                                <td className="border border-white/10 bg-[#0d0d0d] px-2 py-1 text-[10px] text-gray-600 font-mono text-center sticky left-0">
                                                    {rowIndex + 1}
                                                </td>
                                                {parsedData.headers.map((_, colIndex) => (
                                                    <td key={colIndex} className="border border-white/10 p-0 min-w-[120px] max-w-[200px]">
                                                        <input
                                                            type="text"
                                                            value={row[colIndex] || ''}
                                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                                            className="w-full bg-transparent px-2 py-1.5 text-xs text-gray-300 focus:outline-none focus:bg-white/10 truncate"
                                                            title={row[colIndex] || ''}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-2 mt-3 flex-shrink-0">
                                <button
                                    onClick={addRow}
                                    className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors"
                                >
                                    + Add Row
                                </button>
                                <button
                                    onClick={addColumn}
                                    className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors"
                                >
                                    + Add Column
                                </button>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            value={csvContent}
                            onChange={(e) => setCsvContent(e.target.value)}
                            className="w-full h-full bg-black/50 border border-white/10 rounded p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-green-500/50 resize-none"
                            placeholder="name,email,age&#10;John,john@example.com,30"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded cursor-pointer transition-colors">
                            <Upload size={12} />
                            Import
                            <input type="file" accept=".csv,.txt,.tsv" onChange={handleImport} className="hidden" />
                        </label>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors"
                        >
                            <Download size={12} />
                            Export
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                            {parsedData.rows.length} rows, {parsedData.headers.length} columns ({delimiterLabel})
                        </span>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
