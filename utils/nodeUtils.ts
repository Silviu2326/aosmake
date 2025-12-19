import { NodeData } from '../types';

export const flattenObject = (obj: any, prefix = ''): string[] => {
    let keys: string[] = [];
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(flattenObject(obj[key], newKey));
        } else {
            keys.push(newKey);
        }
    }
    return keys;
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
    
    // 2. Schema-based Nodes (LLM)
    if (n.schema) {
            try {
            const schema = JSON.parse(n.schema);
            if (schema.properties) {
                return Object.keys(schema.properties);
            }
        } catch (e) {
            // fall through
        }
    }

    // 3. Fallback to declared outputs
    return n.outputs || [];
};