# Data Models - Doc Generator

## Core Types

### IdeaInput
Input del usuario para generar documentación.

```typescript
interface IdeaInput {
  idea: string;           // Descripción de la app (min 10 chars)
  options?: GenerationOptions;
}

interface GenerationOptions {
  includeAuth?: boolean;      // Incluir páginas de login/register
  complexity?: 'simple' | 'medium' | 'complex';  // Nivel de detalle
  stylePreset?: 'minimal' | 'modern' | 'corporate';
}
```

**Validación**:
- `idea`: requerido, mínimo 10 caracteres, máximo 2000
- `complexity`: default `'medium'`
- `stylePreset`: default `'modern'`

---

### GeneratedDocs
Resultado de la generación.

```typescript
interface GeneratedDocs {
  id: string;              // UUID único de la generación
  idea: string;            // Idea original
  createdAt: Date;         // Timestamp
  globals: GlobalDocs;
  pages: PageDoc[];
  metadata: DocsMetadata;
}

interface GlobalDocs {
  tokens: DocFile;
  routing: DocFile;
  models: DocFile;
}

interface DocFile {
  filename: string;        // ej: "tokens.md"
  content: string;         // Contenido markdown
  path: string;            // ej: "globals/tokens.md"
}

interface PageDoc {
  name: string;            // ej: "HomePage"
  route: string;           // ej: "/"
  filename: string;        // ej: "home.md"
  content: string;         // Contenido markdown completo
  path: string;            // ej: "pages/home.md"
}

interface DocsMetadata {
  totalFiles: number;
  totalPages: number;
  generationTime: number;  // ms
  tokensUsed?: number;     // si aplica
}
```

---

### HistoryItem
Para el historial de generaciones.

```typescript
interface HistoryItem {
  id: string;
  idea: string;            // Truncado a 100 chars para preview
  createdAt: Date;
  pageCount: number;
  // Los docs completos se cargan on-demand
}
```

---

## Application State

### DocsStore
Estado global de la aplicación (usar Zustand o Context).

```typescript
interface DocsStore {
  // State
  currentIdea: string;
  generationStatus: GenerationStatus;
  generatedDocs: GeneratedDocs | null;
  history: HistoryItem[];
  error: AppError | null;

  // Actions
  setIdea: (idea: string) => void;
  generateDocs: (input: IdeaInput) => Promise<void>;
  clearDocs: () => void;
  loadFromHistory: (id: string) => Promise<void>;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
}

type GenerationStatus =
  | 'idle'           // Sin acción
  | 'generating'     // En proceso
  | 'success'        // Completado
  | 'error';         // Error

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
| `IDEA_TOO_SHORT` | "La idea debe tener al menos 10 caracteres" | Validación |
| `IDEA_TOO_LONG` | "La idea no puede exceder 2000 caracteres" | Validación |
| `GENERATION_FAILED` | "Error al generar documentación" | API/proceso |
| `STORAGE_FULL` | "Almacenamiento local lleno" | localStorage |
| `NOT_FOUND` | "Documentación no encontrada" | Historial |

---

## Local Storage Schema

```typescript
// Key: 'docgen_history'
interface StoredHistory {
  version: number;  // Para migraciones futuras (actual: 1)
  items: StoredHistoryItem[];
}

interface StoredHistoryItem {
  id: string;
  idea: string;
  createdAt: string;  // ISO date
  docs: GeneratedDocs;
}
```

**Límites**:
- Máximo 20 items en historial
- Si se excede, eliminar el más antiguo (FIFO)

---

## API Mock / Generator Interface

```typescript
interface DocGeneratorService {
  generate(input: IdeaInput): Promise<GeneratedDocs>;
}

// Para desarrollo, usar mock que genera docs estáticos
// En producción, conectar a API real o LLM
```

---

## Utility Types

```typescript
// Para el FileViewer
interface FileTab {
  id: string;
  label: string;
  path: string;
  content: string;
  language: 'markdown' | 'typescript' | 'json';
}

// Para el ZIP download
interface ZipStructure {
  files: Array<{
    path: string;
    content: string;
  }>;
}
```

---

## Form Validation Schema (Zod)

```typescript
import { z } from 'zod';

export const IdeaInputSchema = z.object({
  idea: z
    .string()
    .min(10, 'La idea debe tener al menos 10 caracteres')
    .max(2000, 'La idea no puede exceder 2000 caracteres'),
  options: z.object({
    includeAuth: z.boolean().optional(),
    complexity: z.enum(['simple', 'medium', 'complex']).optional(),
    stylePreset: z.enum(['minimal', 'modern', 'corporate']).optional(),
  }).optional(),
});

export type IdeaInputType = z.infer<typeof IdeaInputSchema>;
```
