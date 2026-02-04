import { NodeData } from '../types';

export const flattenObject = (obj: any, prefix = ''): string[] => {
    let keys: string[] = [];
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        keys.push(newKey);
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(flattenObject(obj[key], newKey));
        }
    }
    return keys;
};

const flattenSchemaProperties = (properties: any, prefix = ''): string[] => {
    let keys: string[] = [];
    for (const key in properties) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const prop = properties[key];
        
        keys.push(newKey);
        
        // If it's an object and has nested properties, recurse
        if (prop && prop.type === 'object' && prop.properties) {
            keys = keys.concat(flattenSchemaProperties(prop.properties, newKey));
        }
    }
    return keys;
};

// Parse CSV headers from CSV content
export const parseCsvHeaders = (csvContent: string): string[] => {
    if (!csvContent || !csvContent.trim()) return [];

    // Detect delimiter
    const firstLine = csvContent.split(/\r?\n/)[0] || '';
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxCount = 0;

    for (const d of delimiters) {
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

    // Parse first line (headers) handling quoted values
    const headers: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < firstLine.length; i++) {
        const char = firstLine[i];
        const nextChar = firstLine[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentCell += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentCell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === bestDelimiter) {
                headers.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
    }

    // Don't forget the last header
    if (currentCell || headers.length > 0) {
        headers.push(currentCell.trim());
    }

    return headers;
};

export const getNodeFields = (n: NodeData): string[] => {
    // 1. JSON Node / JSON Builder: Parse the static JSON content
    // Note: NodeData in types might not strictly have 'json' typed yet, so we treat as any for safety access
    const nodeAny = n as any;
    if ((nodeAny.type === 'JSON' || nodeAny.type === 'JSON_BUILDER') && nodeAny.json) {
        try {
            const parsed = JSON.parse(nodeAny.json);
            return flattenObject(parsed);
        } catch (e) {
            return [];
        }
    }

    // 2. CSV Input Node: Extract column headers from CSV content
    if (nodeAny.type === 'CSV_INPUT' && nodeAny.csv) {
        const headers = parseCsvHeaders(nodeAny.csv);
        // Return headers as available fields, plus special accessors
        return headers.length > 0 ? ['rows', 'rowCount', ...headers] : ['rows', 'rowCount'];
    }

    // 3. Lead Input / Box1 Input Node: Return lead fields
    if (nodeAny.type === 'LEAD_INPUT' || nodeAny.type === 'BOX1_INPUT') {
        return [
            'leads',
            'leads[].LeadNumber',
            'leads[].TargetID',
            'leads[].firstName',
            'leads[].lastName',
            'leads[].personTitle',
            'leads[].personTitleDescription',
            'leads[].personSummary',
            'leads[].personLocation',
            'leads[].durationInRole',
            'leads[].durationInCompany',
            'leads[].email',
            'leads[].email_validation',
            'leads[].companyName',
            'leads[].companyDescription',
            'leads[].companyTagLine',
            'leads[].industry',
            'leads[].employeeCount',
            'leads[].companyLocation',
            'leads[].website',
            'leads[].domain',
            'leads[].minRevenue',
            'leads[].maxRevenue',
            'leads[].growth6Mth',
            'leads[].growth1Yr',
            'leads[].growth2Yr',
            'leadCount'
        ];
    }

    // 4. Schema-based Nodes (LLM)
    if (n.schema) {
        try {
            // Handle both string and object schemas
            const schema = typeof n.schema === 'string' ? JSON.parse(n.schema) : n.schema;

            // Case A: Valid JSON Schema with 'properties'
            if (schema.properties) {
                return flattenSchemaProperties(schema.properties);
            }

            // Case B: User pasted a raw JSON object as schema (fallback)
            // If it's an object and doesn't look like a schema definition
            if (typeof schema === 'object' && schema !== null && !Array.isArray(schema)) {
                 return flattenObject(schema);
            }
        } catch (e) {
            // fall through
        }
    }

    // 4. Fallback to declared outputs
    return n.outputs || [];
};