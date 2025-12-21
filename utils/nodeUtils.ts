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

    // 3. Fallback to declared outputs
    return n.outputs || [];
};