const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend', 'data', 'precrafter_scenario (4).json');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Find the node with the schema
    const node = data.nodes.find(n => n.id === 'node_1766324188323');
    if (node) {
        console.log("Schema Type:", typeof node.data.schema);
        if (typeof node.data.schema === 'string') {
            const parsed = JSON.parse(node.data.schema);
            console.log("Parsed Schema Root Keys:", Object.keys(parsed));
            if (parsed.type === 'object' && parsed.properties) {
                console.log("Schema structure looks CORRECT: has 'type' and 'properties'.");
            } else {
                console.error("Schema structure INCORRECT: missing 'type' or 'properties'.");
            }
        } else {
            console.log("Schema is already an object.");
        }
    } else {
        console.error("Node not found.");
    }
} catch (e) {
    console.error("Error:", e);
}
