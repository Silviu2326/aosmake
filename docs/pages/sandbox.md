# SandboxPage - Laboratorio de Pruebas

**Route**: `/sandbox`
**Role**: Pagina tipo Make/n8n para probar flujos con datos de ejemplo antes de ejecutar en produccion

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox              [Search] [User] [⚙]│
├────────┬────────────────────────────────────────────────────────────────────┤
│        │  Sandbox                               [Select Flow ▼] [Run Test] │
│  Nav   │  ──────────────────────────────────────────────────────────────────│
│        │                                                                    │
│ Leads  │  ┌────────────────────────────────────┬───────────────────────────┐│
│ Import │  │                                    │ INPUT                     ││
│ Flows  │  │       FLOW VISUALIZATION           │ ─────────────────────────  ││
│ Runs   │  │                                    │ [Lead Example▼] [JSON] [CSV]││
│Sandbox◀│  │     ┌─────┐                        │                           ││
│        │  │     │Start│                        │ ┌───────────────────────┐ ││
│        │  │     └──┬──┘                        │ │ {                     │ ││
│        │  │        │                           │ │   "firstName": "John",│ ││
│        │  │     ┌──▼──┐                        │ │   "lastName": "Smith",│ ││
│        │  │     │ LLM │ ← Running              │ │   "email": "john@...",│ ││
│        │  │     └──┬──┘                        │ │   "company": "Acme"   │ ││
│        │  │        │                           │ │ }                     │ ││
│        │  │   ┌────┴────┐                      │ └───────────────────────┘ ││
│        │  │ ┌─▼─┐    ┌──▼──┐                   │                           ││
│        │  │ │Out│    │Score│                   │ [Load Lead] [Paste JSON]  ││
│        │  │ └───┘    └─────┘                   │                           ││
│        │  │                                    ├───────────────────────────┤│
│        │  │                                    │ OUTPUT                    ││
│        │  │                                    │ ─────────────────────────  ││
│        │  │                                    │                           ││
│        │  │                                    │ Step 1: Lead Analyzer     ││
│        │  │                                    │ ┌───────────────────────┐ ││
│        │  │                                    │ │ Input:                │ ││
│        │  │                                    │ │ System: You are...    │ ││
│        │  │                                    │ │ User: Analyze {{...}} │ ││
│        │  │                                    │ ├───────────────────────┤ ││
│        │  │                                    │ │ Output:               │ ││
│        │  │                                    │ │ { "score": 85 }       │ ││
│        │  │                                    │ └───────────────────────┘ ││
│        │  │                                    │                           ││
│        │  │                                    │ Step 2: Scoring...        ││
│        │  │                                    │ [Running...]              ││
│        │  │                                    │                           ││
│        │  └────────────────────────────────────┴───────────────────────────┘│
│        │                                                                    │
└────────┴────────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Selector de flujo a probar
- [ ] Visualizacion del flujo (grafo de nodos)
- [ ] Input: seleccionar lead de ejemplo de la base
- [ ] Input: pegar JSON manual
- [ ] Input: subir CSV pequeno (max 10 filas)
- [ ] Boton "Run Test" para ejecutar
- [ ] Ver input/output por cada step en tiempo real
- [ ] Indicador visual del nodo que se esta ejecutando
- [ ] Mostrar estado de cada nodo (idle, running, success, error)

### SHOULD
- [ ] Ejecutar solo un nodo especifico (no todo el flujo)
- [ ] Pausar ejecucion entre nodos
- [ ] Editar prompts on-the-fly para iterar rapido
- [ ] Comparar outputs de diferentes ejecuciones
- [ ] Guardar inputs favoritos para reutilizar
- [ ] Ver tiempo de ejecucion por nodo
- [ ] Copiar output de cualquier nodo

### COULD
- [ ] Modo "step-by-step" con confirmacion manual
- [ ] Rollback a estado anterior
- [ ] Fork del flujo desde sandbox
- [ ] Compartir sesion de sandbox
- [ ] Historial de ejecuciones del sandbox
- [ ] Mock de APIs externas

---

## Components

### SandboxHeader
```tsx
interface SandboxHeaderProps {
  selectedFlowId: string | null;
  flows: Flow[];
  onFlowSelect: (id: string) => void;
  onRunTest: () => void;
  isRunning: boolean;
}
```
- Dropdown selector de flujo
- Boton "Run Test" prominente
- Estado de ejecucion

### FlowVisualization
```tsx
interface FlowVisualizationProps {
  flow: Flow;
  nodeStatuses: Record<string, NodeStatus>;
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
}
```
- React Flow en modo read-only
- Nodos con colores segun estado
- Highlight del nodo activo
- Animacion de ejecucion

### InputPanel
```tsx
interface InputPanelProps {
  mode: 'lead' | 'json' | 'csv';
  onModeChange: (mode: 'lead' | 'json' | 'csv') => void;
  value: any;
  onChange: (value: any) => void;
  onLoadLead: () => void;
}
```
- Tabs para cambiar modo de input
- Lead selector con busqueda
- Editor JSON con syntax highlighting
- Upload de CSV pequeno

### LeadSelector
```tsx
interface LeadSelectorProps {
  onSelect: (lead: Lead) => void;
  recentLeads: Lead[];
}
```
- Dropdown con busqueda
- Leads recientes como sugerencias
- Preview del lead seleccionado

### JsonEditor
```tsx
interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
```
- Editor con syntax highlighting
- Validacion JSON en tiempo real
- Format/prettify automatico

### OutputPanel
```tsx
interface OutputPanelProps {
  steps: StepResult[];
  isRunning: boolean;
  activeStepIndex: number;
}

interface StepResult {
  nodeId: string;
  nodeLabel: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input?: {
    systemPrompt: string;
    userPrompt: string;
    model: string;
    temperature: number;
  };
  output?: any;
  duration?: number;
  error?: string;
}
```
- Lista vertical de steps
- Cada step colapsable
- Input y Output por separado
- Indicador de progreso

### StepCard
```tsx
interface StepCardProps {
  step: StepResult;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
}
```
- Header con nombre y estado
- Seccion Input colapsable
- Seccion Output colapsable
- Boton copiar output

---

## States

| Estado | Condicion | UI |
|--------|-----------|-----|
| `no_flow` | Sin flujo seleccionado | Mensaje "Select a flow" |
| `ready` | Flujo cargado, input listo | Boton Run habilitado |
| `running` | Ejecutando flujo | Nodos animados, progress |
| `paused` | Pausado entre nodos | Boton "Resume" |
| `completed` | Ejecucion terminada | Todos outputs visibles |
| `error` | Error en algun nodo | Nodo en rojo, mensaje error |

---

## Interactions

| Elemento | Evento | Accion |
|----------|--------|--------|
| Flow selector | `onChange` | Cargar flujo, resetear outputs |
| Tab input mode | `onClick` | Cambiar entre lead/json/csv |
| Lead dropdown | `onSelect` | Cargar datos del lead |
| JSON editor | `onChange` | Actualizar input data |
| "Run Test" | `onClick` | Iniciar ejecucion |
| Nodo en grafo | `onClick` | Scroll a step en output panel |
| Step header | `onClick` | Expandir/colapsar step |
| "Copy" output | `onClick` | Copiar al clipboard |
| "Stop" | `onClick` | Cancelar ejecucion |

---

## Data Flow

```
1. Usuario selecciona flujo
   └─> fetchFlow(id)
   └─> Renderizar grafo
   └─> Inicializar nodeStatuses: all 'pending'

2. Usuario configura input
   └─> Modo Lead: fetchLead(id) → set inputData
   └─> Modo JSON: parse y validar → set inputData
   └─> Modo CSV: parse primera fila → set inputData

3. Usuario click "Run Test"
   └─> setIsRunning(true)
   └─> Construir dependency graph
   └─> Encontrar nodos iniciales (sin dependencias)
   └─> Iniciar ejecucion

4. Ejecucion de cada nodo
   └─> setNodeStatus(id, 'running')
   └─> setActiveNodeId(id)
   └─> POST /workflows/run-node { node, context }
   └─> setStepResult(id, result)
   └─> setNodeStatus(id, result.success ? 'success' : 'error')
   └─> Actualizar context con output
   └─> Encolar nodos dependientes que ya pueden ejecutar

5. Ejecucion completada
   └─> setIsRunning(false)
   └─> setActiveNodeId(null)
   └─> Mostrar resumen
```

---

## Execution Engine

```typescript
const runSandboxTest = async (flow: Flow, inputData: any) => {
  const context: Record<string, any> = { input: inputData };
  const results: StepResult[] = [];

  // Build dependency graph
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();

  flow.nodes.forEach(n => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
  });

  flow.edges.forEach(e => {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    outEdges.get(e.source)?.push(e.target);
  });

  // Find start nodes
  const queue = flow.nodes
    .filter(n => inDegree.get(n.id) === 0)
    .map(n => n.id);

  // Execute in topological order
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = flow.nodes.find(n => n.id === nodeId)!;

    setNodeStatus(nodeId, 'running');

    try {
      const result = await executeNode(node, context);
      context[nodeId] = result.output;

      results.push({
        nodeId,
        nodeLabel: node.data.label,
        status: 'success',
        input: result.input,
        output: result.output,
        duration: result.duration,
      });

      setNodeStatus(nodeId, 'success');

      // Enqueue dependents
      outEdges.get(nodeId)?.forEach(targetId => {
        const newDegree = (inDegree.get(targetId) || 0) - 1;
        inDegree.set(targetId, newDegree);
        if (newDegree === 0) queue.push(targetId);
      });

    } catch (error) {
      results.push({
        nodeId,
        nodeLabel: node.data.label,
        status: 'error',
        error: error.message,
      });

      setNodeStatus(nodeId, 'error');
      break; // Stop on error
    }
  }

  return results;
};
```

---

## Input Modes

### Lead Example Mode
```typescript
// Cargar lead real de la base de datos
const loadLeadAsInput = async (leadId: string) => {
  const lead = await fetchLead(leadId);
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    company: lead.company,
    jobTitle: lead.jobTitle,
    linkedinUrl: lead.linkedinUrl,
    // ... otros campos
  };
};
```

### JSON Manual Mode
```typescript
// Usuario pega JSON directamente
const defaultJsonTemplate = {
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@example.com",
  company: "Acme Inc",
  jobTitle: "VP Engineering",
};
```

### CSV Mode
```typescript
// Subir CSV pequeno, ejecutar con primera fila
const parseCSVForSandbox = (file: File): Promise<any[]> => {
  // Max 10 filas para sandbox
  // Retorna array de objetos
};
```

---

## Accessibility

- Grafo con `role="img"` y `aria-label` descriptivo
- Tabs con `role="tablist"` y `aria-selected`
- Editor JSON con `role="textbox"` y `aria-multiline`
- Steps con `role="list"` y items expandibles
- Progress con `aria-live="polite"` para updates
- Keyboard shortcuts para Run (Cmd+Enter)

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Layout vertical: grafo arriba, panels abajo |
| Tablet (640-1024px) | Grafo 50%, panels 50% |
| Desktop (> 1024px) | Layout como mockup |
