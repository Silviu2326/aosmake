# RunsPage - Ejecutor de Flujos (Queue)

**Route**: `/runs`
**Role**: Cola de ejecuciones con trazabilidad completa - logs por step, inputs/outputs, tiempos

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox              [Search] [User] [⚙]│
├────────┬────────────────────────────────────────────────────────────────────┤
│        │  Runs                                                   [Refresh] │
│  Nav   │  ──────────────────────────────────────────────────────────────────│
│        │                                                                    │
│ Leads  │  ┌─────────────────────────────────────────────────────────────┐  │
│ Import │  │ [PreCrafter] [Crafter]        [All] [Success] [Failed] [Run] │  │
│ Flows  │  └─────────────────────────────────────────────────────────────┘  │
│ Runs◀  │                                                                    │
│Sandbox │  ┌────────────────────────────────────────────────────────────────┐│
│        │  │ Status    │ Version │ Duration │ Time         │               ││
│        │  ├───────────┼─────────┼──────────┼──────────────┼───────────────┤│
│        │  │ ✓ Success │ v2.3    │ 4.2s     │ 2 min ago    │      [→]      ││
│        │  │ ✓ Success │ v2.3    │ 3.8s     │ 15 min ago   │      [→]      ││
│        │  │ ✗ Failed  │ v2.3    │ 1.2s     │ 1 hour ago   │      [→]      ││
│        │  │ ● Running │ v2.3    │ --       │ Just now     │      [→]      ││
│        │  │ ✓ Success │ v2.2    │ 5.1s     │ 2 hours ago  │      [→]      ││
│        │  └────────────────────────────────────────────────────────────────┘│
│        │                                                                    │
│        │                          [Load More]                               │
│        │                                                                    │
│        │  ┌─────────────────────────────────────────────────────────────┐  │
│        │  │ DETAIL PANEL (slide-over)                            [X]    │  │
│        │  │ ─────────────────────────────────────────────────────────── │  │
│        │  │ Run #8f2a4b • Success                                       │  │
│        │  │ Started: Jan 25, 2025 14:32:15  Duration: 4.2s              │  │
│        │  │                                                              │  │
│        │  │ NODE EXECUTION RESULTS                                       │  │
│        │  │ ┌─────────────────────────────────────────────────────────┐ │  │
│        │  │ │ node_1 (Lead Analyzer)                                  │ │  │
│        │  │ │ INPUT                                                   │ │  │
│        │  │ │ System: You are a lead analyst...                       │ │  │
│        │  │ │ User: Analyze this lead: {{lead}}                       │ │  │
│        │  │ │ Model: gpt-4  Temp: 0.7                                 │ │  │
│        │  │ │                                                         │ │  │
│        │  │ │ OUTPUT                                                  │ │  │
│        │  │ │ { "score": 85, "segment": "Enterprise" }                │ │  │
│        │  │ └─────────────────────────────────────────────────────────┘ │  │
│        │  │                                                              │  │
│        │  │ [Download JSON]                                              │  │
│        │  └─────────────────────────────────────────────────────────────┘  │
└────────┴────────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Lista de ejecuciones con: status, version, duracion, tiempo
- [ ] Tabs para filtrar por tipo: PreCrafter, Crafter
- [ ] Filtros por estado: All, Success, Failed, Running
- [ ] Click en run abre panel de detalles
- [ ] Panel muestra resultados por nodo
- [ ] Cada nodo muestra INPUT (prompts, model, temp) y OUTPUT
- [ ] Timestamps relativos ("2 min ago")
- [ ] Boton refresh para actualizar lista
- [ ] Status badges con colores semanticos

### SHOULD
- [ ] Descargar run completo como JSON
- [ ] Ver lead asociado al run (link a `/leads/:id`)
- [ ] Filtrar por rango de fechas
- [ ] Buscar por ID de run
- [ ] Mostrar tokens consumidos por nodo
- [ ] Comparar dos runs lado a lado
- [ ] Estadisticas agregadas (success rate, avg duration)

### COULD
- [ ] Re-ejecutar un run fallido
- [ ] Cancelar run en progreso
- [ ] Notificaciones en tiempo real de nuevos runs
- [ ] Graficos de tendencia (runs por hora, success rate)
- [ ] Exportar multiples runs
- [ ] Filtrar por nodo que fallo

---

## Components

### RunsHeader
```tsx
interface RunsHeaderProps {
  activeType: 'precrafter' | 'crafter';
  onTypeChange: (type: 'precrafter' | 'crafter') => void;
  activeStatus: RunStatus | 'all';
  onStatusChange: (status: RunStatus | 'all') => void;
  onRefresh: () => void;
}
```
- Toggle PreCrafter/Crafter
- Filtros de estado
- Boton refresh

### RunsTable
```tsx
interface RunsTableProps {
  runs: Run[];
  isLoading: boolean;
  onRunClick: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}
```
- Tabla con filas clickeables
- Infinite scroll o "Load More"
- Skeleton mientras carga

### RunStatusBadge
```tsx
interface RunStatusBadgeProps {
  status: RunStatus;
}
```
| Status | Color | Icono |
|--------|-------|-------|
| `success` | green | CheckCircle |
| `failed` | red | AlertCircle |
| `running` | blue | Spinner |
| `queued` | gray | Clock |
| `cancelled` | yellow | XCircle |

### RunDetailPanel
```tsx
interface RunDetailPanelProps {
  run: Run;
  onClose: () => void;
  onDownload: () => void;
}
```
- Slide-over desde la derecha
- Header con metadata del run
- Lista de resultados por nodo
- Boton descargar

### NodeResultCard
```tsx
interface NodeResultCardProps {
  nodeId: string;
  nodeLabel: string;
  result: NodeResult;
}
```
- Card colapsable
- Seccion INPUT con prompts y config
- Seccion OUTPUT con resultado formateado
- Syntax highlighting para JSON

### InputSection
```tsx
interface InputSectionProps {
  input: {
    systemPrompt?: string;
    userPrompt?: string;
    model?: string;
    temperature?: number;
  };
}
```
- System prompt en bloque
- User prompt en bloque
- Badges para model y temperature

### OutputSection
```tsx
interface OutputSectionProps {
  output: any;
}
```
- JSON formateado con syntax highlighting
- Boton copiar
- Expandir/colapsar para outputs largos

---

## States

| Estado | Condicion | UI |
|--------|-----------|-----|
| `loading` | Cargando runs | Skeleton table |
| `empty` | Sin runs | Empty state |
| `idle` | Runs cargados | Tabla con datos |
| `refreshing` | Actualizando | Spinner en header |
| `detail_open` | Panel abierto | Slide-over visible |
| `detail_loading` | Cargando detalles | Skeleton en panel |

---

## Interactions

| Elemento | Evento | Accion |
|----------|--------|--------|
| Tab PreCrafter/Crafter | `onClick` | Cambiar tipo, fetch runs |
| Filtro estado | `onClick` | Filtrar lista |
| "Refresh" | `onClick` | Fetch runs nuevamente |
| Fila de run | `onClick` | Abrir panel de detalles |
| [→] chevron | `onClick` | Abrir panel de detalles |
| Panel X | `onClick` | Cerrar panel |
| "Download JSON" | `onClick` | Descargar run como archivo |
| "Load More" | `onClick` | Cargar siguiente pagina |
| Node card header | `onClick` | Expandir/colapsar |

---

## Data Flow

```
1. Pagina carga
   └─> fetchRuns(type: 'precrafter')
   └─> Mostrar skeleton

2. Runs recibidos
   └─> setRuns(data)
   └─> Renderizar tabla

3. Usuario cambia a Crafter
   └─> setActiveType('crafter')
   └─> fetchRuns(type: 'crafter')
   └─> Actualizar tabla

4. Usuario click en run
   └─> Si run.results existe: mostrar
   └─> Si no: fetchRunDetails(id)
   └─> Abrir panel lateral

5. Usuario descarga run
   └─> Generar JSON con toda la data
   └─> Trigger download con nombre: run_8f2a_2025-01-25.json
```

---

## Run Detail Data Structure

```typescript
interface RunDetail {
  id: string;
  status: RunStatus;
  type: 'precrafter' | 'crafter';
  workflow_version: number;
  start_time: string;           // ISO date
  end_time?: string;            // ISO date
  duration_ms: number;

  // Input context
  leadId?: string;
  batchId?: string;
  inputData?: any;

  // Results per node
  results: {
    [nodeId: string]: {
      input: {
        systemPrompt?: string;
        userPrompt?: string;
        model?: string;
        temperature?: number;
      };
      output: any;
      duration_ms?: number;
      tokens_used?: number;
    };
  };

  // Error info if failed
  error?: {
    nodeId: string;
    message: string;
    stack?: string;
  };
}
```

---

## Time Formatting

```typescript
const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString();
};

const formatDuration = (ms: number): string => {
  if (!ms) return '--';
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
};
```

---

## Accessibility

- Tabla con `role="grid"` y headers con `scope="col"`
- Filas focuseables con Enter para abrir detalles
- Panel con `role="dialog"` y `aria-modal="true"`
- Focus trap en panel abierto
- Status badges con `aria-label` descriptivo
- Live region para anunciar nuevos runs

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Tabla como cards, panel fullscreen |
| Tablet (640-1024px) | Tabla condensada, panel 50% width |
| Desktop (> 1024px) | Layout completo, panel 500px |
