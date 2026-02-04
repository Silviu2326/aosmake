# Data Models - AOS Studio

## Core Types

### Lead
Entidad principal del sistema.

```typescript
interface Lead {
  id: string;                    // UUID unico
  firstName: string;
  lastName: string;
  fullName?: string;             // Computed o manual
  email: string;
  emailStatus: EmailStatus;
  linkedinUrl?: string;
  phone?: string;

  // Empresa
  company: string;
  companyLinkedin?: string;
  companyWebsite?: string;
  country?: string;
  companySize?: CompanySize;
  industry?: string;
  jobTitle?: string;

  // Metadata
  source: LeadSource;
  tags: string[];
  score?: number;                // 0-100
  createdAt: Date;
  updatedAt: Date;

  // Estado del procesamiento
  lastFlowRun?: string;          // ID del ultimo run
  lastFlowStatus?: 'success' | 'error' | 'pending';
}

type EmailStatus =
  | 'unknown'      // Sin verificar
  | 'pending'      // En proceso de verificacion
  | 'valid'        // Email valido y entregable
  | 'invalid'      // Email no existe
  | 'risky'        // Catch-all o temporal
  | 'error';       // Error en verificacion

type LeadSource =
  | 'csv_import'
  | 'linkedin'
  | 'apollo'
  | 'manual'
  | 'api'
  | 'scraper';

type CompanySize =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | '5001+';
```

---

### Flow
Definicion de un flujo de procesamiento.

```typescript
interface Flow {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: FlowStatus;
  owner: string;

  // Contenido
  nodes: FlowNode[];
  edges: FlowEdge[];

  // Metricas
  lastRun?: Date;
  successRate?: number;          // 0-100
  avgDuration?: number;          // ms
  totalRuns: number;

  createdAt: Date;
  updatedAt: Date;
}

type FlowStatus =
  | 'draft'        // En edicion
  | 'active'       // Listo para usar
  | 'paused'       // Temporalmente deshabilitado
  | 'archived';    // Archivado

interface FlowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  data: NodeData;
}

type NodeType =
  | 'LLM'          // Procesador con modelo de lenguaje
  | 'JSON'         // Nodo de datos estaticos
  | 'JSON_BUILDER' // Constructor de JSON dinamico
  | 'API'          // Llamada a API externa
  | 'EMAIL_VERIFY' // Verificacion de email
  | 'CONDITION'    // Branch condicional
  | 'TRANSFORM';   // Transformacion de datos

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}
```

---

### NodeData
Configuracion de un nodo.

```typescript
interface NodeData {
  id: string;
  type: string;
  label: string;
  status: NodeStatus;

  // LLM Config
  model?: string;                // 'gpt-4', 'claude-3', etc.
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;          // 0-2
  schema?: string | object;      // JSON Schema para output estructurado
  outputMode?: 'structured' | 'free';

  // Variantes para A/B testing
  variants?: NodeVariant[];
  selectedVariantId?: string;

  // Runtime
  outputData?: any;
  tokens?: string;

  // Conexiones
  inputs: string[];
  outputs: string[];
}

type NodeStatus =
  | 'idle'
  | 'running'
  | 'success'
  | 'warning'
  | 'error'
  | 'waiting';    // Esperando seleccion de variante

interface NodeVariant {
  id: string;
  label: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  output?: any;
  status?: string;
}
```

---

### Run
Ejecucion de un flujo.

```typescript
interface Run {
  id: string;
  flowId: string;
  flowVersion: number;
  type: 'precrafter' | 'crafter';

  status: RunStatus;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;

  // Inputs
  leadId?: string;               // Si es single lead
  batchId?: string;              // Si es batch
  inputData?: any;               // JSON manual

  // Results
  results: Record<string, NodeResult>;
  error?: string;
}

type RunStatus =
  | 'queued'
  | 'running'
  | 'success'
  | 'failed'
  | 'cancelled';

interface NodeResult {
  input: {
    systemPrompt?: string;
    userPrompt?: string;
    model?: string;
    temperature?: number;
  };
  output: any;
  durationMs?: number;
  tokensUsed?: number;
}
```

---

### ImportSession
Sesion de importacion de leads.

```typescript
interface ImportSession {
  id: string;
  filename: string;
  status: ImportStatus;

  // Progreso
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  duplicateRows: number;

  // Configuracion
  columnMapping: ColumnMapping;
  duplicateStrategy: DuplicateStrategy;
  normalizeNames: boolean;
  normalizeDomains: boolean;

  createdAt: Date;
  completedAt?: Date;
}

type ImportStatus =
  | 'uploading'
  | 'mapping'
  | 'normalizing'
  | 'detecting_duplicates'
  | 'importing'
  | 'completed'
  | 'failed';

interface ColumnMapping {
  [csvColumn: string]: keyof Lead | null;
}

type DuplicateStrategy =
  | 'skip'         // Ignorar duplicados
  | 'update'       // Actualizar existentes
  | 'create_new';  // Crear como nuevo
```

---

## Application State

### AppStore
Estado global de la aplicacion (Zustand).

```typescript
interface AppStore {
  // Leads
  leads: Lead[];
  selectedLeadIds: string[];
  leadFilters: LeadFilters;

  // Flows
  flows: Flow[];
  activeFlowId: string | null;

  // Runs
  runs: Run[];
  activeRunId: string | null;

  // Import
  importSession: ImportSession | null;

  // UI State
  isLoading: boolean;
  error: AppError | null;

  // Actions
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  selectLeads: (ids: string[]) => void;
  executeBulkAction: (action: BulkAction) => Promise<void>;

  fetchFlows: () => Promise<void>;
  saveFlow: (flow: Flow) => Promise<void>;

  fetchRuns: (type?: string) => Promise<void>;

  startImport: (file: File) => Promise<void>;
  setColumnMapping: (mapping: ColumnMapping) => void;
  executeImport: () => Promise<void>;
}

interface LeadFilters {
  search?: string;
  emailStatus?: EmailStatus[];
  source?: LeadSource[];
  tags?: string[];
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  pageSize: number;
}

type BulkAction =
  | { type: 'verify_email' }
  | { type: 'run_flow'; flowId: string }
  | { type: 'add_tag'; tag: string }
  | { type: 'remove_tag'; tag: string }
  | { type: 'delete' }
  | { type: 'export' };

interface AppError {
  code: string;
  message: string;
  details?: string;
}
```

---

## Error Codes

| Code | Message | Causa |
|------|---------|-------|
| `LEAD_NOT_FOUND` | "Lead no encontrado" | ID invalido |
| `FLOW_NOT_FOUND` | "Flujo no encontrado" | ID invalido |
| `IMPORT_FAILED` | "Error en importacion" | Archivo invalido |
| `DUPLICATE_EMAIL` | "Email duplicado" | Ya existe |
| `EMAIL_VERIFY_FAILED` | "Error verificando email" | API error |
| `RUN_FAILED` | "Ejecucion fallida" | Error en nodo |
| `RATE_LIMIT` | "Limite de requests excedido" | API limit |

---

## API Endpoints

```typescript
// Base URL
const API_BASE = 'http://localhost:3001/api';

// Leads
GET    /leads                    // Lista con filtros
GET    /leads/:id                // Detalle
POST   /leads                    // Crear
PATCH  /leads/:id                // Actualizar
DELETE /leads/:id                // Eliminar
POST   /leads/bulk               // Accion masiva
POST   /leads/verify-email       // Verificar email

// Flows
GET    /workflows/precrafter     // Obtener PreCrafter
POST   /workflows/precrafter     // Guardar PreCrafter
GET    /workflows/crafter        // Obtener Crafter
POST   /workflows/crafter        // Guardar Crafter
POST   /workflows/run-node       // Ejecutar nodo

// Runs
GET    /workflows/precrafter/runs  // Historial PreCrafter
GET    /workflows/crafter/runs     // Historial Crafter
GET    /workflows/runs/:id         // Detalle de run
POST   /workflows/precrafter/runs  // Guardar run
POST   /workflows/crafter/runs     // Guardar run

// Import
POST   /import/upload            // Subir CSV
POST   /import/map               // Configurar mapping
POST   /import/execute           // Ejecutar importacion
GET    /import/:id/status        // Estado de importacion
```

---

## Validation Rules

```typescript
// Lead validation
const LeadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().min(1).max(200),
  linkedinUrl: z.string().url().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().max(200).optional(),
});

// Flow validation
const FlowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(NodeSchema).min(1),
  edges: z.array(EdgeSchema),
});

// Import validation
const ImportSchema = z.object({
  file: z.instanceof(File),
  columnMapping: z.record(z.string().nullable()),
  duplicateStrategy: z.enum(['skip', 'update', 'create_new']),
});
```
