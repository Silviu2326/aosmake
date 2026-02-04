# FlowsPage - Biblioteca de Flujos

**Route**: `/flows`
**Role**: Gestion de flujos de procesamiento (como Make/n8n pero orientado a outbound sales)

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox              [Search] [User] [⚙]│
├────────┬────────────────────────────────────────────────────────────────────┤
│        │  Flow Library                                      [+ Create Flow] │
│  Nav   │  ──────────────────────────────────────────────────────────────────│
│        │                                                                    │
│ Leads  │  ┌─────────────────────────────────────────────────────────────┐  │
│ Import │  │ [All] [Active] [Draft] [Archived]     [Search flows...]     │  │
│ Flows◀ │  └─────────────────────────────────────────────────────────────┘  │
│ Runs   │                                                                    │
│Sandbox │  ┌────────────────────────────────────────────────────────────────┐│
│        │  │                                                                ││
│        │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐││
│        │  │  │ Lead Scoring    │  │ Email Enricher  │  │ ICP Qualifier   │││
│        │  │  │ v2.3 • Active   │  │ v1.0 • Draft    │  │ v4.1 • Active   │││
│        │  │  │                 │  │                 │  │                 │││
│        │  │  │ ○─○─○─○        │  │ ○─○─○           │  │ ○─○─○─○─○      │││
│        │  │  │                 │  │                 │  │                 │││
│        │  │  │ Owner: @john    │  │ Owner: @jane    │  │ Owner: @team    │││
│        │  │  │ Last: 2h ago    │  │ Last: Never     │  │ Last: 5m ago    │││
│        │  │  │ Success: 94%    │  │ Success: --     │  │ Success: 87%    │││
│        │  │  │                 │  │                 │  │                 │││
│        │  │  │ [Edit] [Test]   │  │ [Edit] [Test]   │  │ [Edit] [Test]   │││
│        │  │  └─────────────────┘  └─────────────────┘  └─────────────────┘││
│        │  │                                                                ││
│        │  │  ┌─────────────────┐  ┌─────────────────┐                     ││
│        │  │  │ Content Gen     │  │ Outreach Prep   │                     ││
│        │  │  │ v1.2 • Paused   │  │ v3.0 • Active   │                     ││
│        │  │  │ ...             │  │ ...             │                     ││
│        │  │  └─────────────────┘  └─────────────────┘                     ││
│        │  │                                                                ││
│        │  └────────────────────────────────────────────────────────────────┘│
│        │                                                                    │
│        │  Showing 5 of 12 flows                                             │
└────────┴────────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Lista de flujos en formato grid (cards)
- [ ] Cada card muestra: nombre, version, estado, owner, ultima ejecucion, tasa de exito
- [ ] Filtros por estado: All, Active, Draft, Paused, Archived
- [ ] Busqueda por nombre de flujo
- [ ] Boton "Edit" abre el editor de flujo
- [ ] Boton "Test" navega a `/sandbox?flow=:id`
- [ ] Boton "Create Flow" crea nuevo flujo en modo draft
- [ ] Miniatura visual del flujo (nodos conectados simplificados)

### SHOULD
- [ ] Ordenar por: nombre, fecha, uso, success rate
- [ ] Duplicar flujo existente
- [ ] Archivar/restaurar flujos
- [ ] Ver historial de versiones de un flujo
- [ ] Comparar dos versiones de un flujo
- [ ] Estadisticas agregadas: total runs, avg duration
- [ ] Tags/categorias para organizar flujos

### COULD
- [ ] Importar/exportar flujos como JSON
- [ ] Compartir flujo con otros usuarios
- [ ] Templates de flujos predefinidos
- [ ] Flujos favoritos/pinned
- [ ] Busqueda avanzada (por nodo, por modelo, etc.)

---

## Components

### FlowGrid
```tsx
interface FlowGridProps {
  flows: Flow[];
  onEdit: (id: string) => void;
  onTest: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}
```
- Grid responsive de cards
- Skeleton loading state
- Empty state cuando no hay flujos

### FlowCard
```tsx
interface FlowCardProps {
  flow: Flow;
  onEdit: () => void;
  onTest: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}
```
- Header con nombre y version badge
- Status badge con color
- Miniatura del flujo (nodos simplificados)
- Metadata: owner, last run, success rate
- Action buttons en footer

### FlowStatusBadge
```tsx
interface FlowStatusBadgeProps {
  status: FlowStatus;
}
```
| Status | Color | Label |
|--------|-------|-------|
| `active` | green | Active |
| `draft` | gray | Draft |
| `paused` | yellow | Paused |
| `archived` | red | Archived |

### FlowMiniature
```tsx
interface FlowMiniatureProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  width?: number;
  height?: number;
}
```
- SVG simplificado del grafo
- Circulos para nodos
- Lineas para conexiones
- Colores por tipo de nodo

### FlowFilters
```tsx
interface FlowFiltersProps {
  activeFilter: FlowStatus | 'all';
  onFilterChange: (filter: FlowStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```
- Tabs para filtrar por estado
- Input de busqueda
- Contadores por estado

### FlowEditor
```tsx
interface FlowEditorProps {
  flow: Flow;
  onSave: (flow: Flow) => void;
  onClose: () => void;
}
```
- Canvas con React Flow
- Panel lateral de propiedades
- Toolbar con acciones
- Inspector de nodo seleccionado

---

## States

| Estado | Condicion | UI |
|--------|-----------|-----|
| `loading` | Cargando flujos | Skeleton grid |
| `empty` | Sin flujos | Empty state con CTA crear |
| `filtered_empty` | Filtro sin resultados | "No flows match" |
| `idle` | Flujos cargados | Grid de cards |
| `editing` | Editor abierto | Modal/drawer con editor |
| `creating` | Creando nuevo | Editor con flujo vacio |

---

## Interactions

| Elemento | Evento | Accion |
|----------|--------|--------|
| Tab filtro | `onClick` | Filtrar por estado |
| Search input | `onChange` | Filtrar por nombre |
| "Create Flow" | `onClick` | Abrir editor con flujo nuevo |
| Card | `onClick` | Abrir editor del flujo |
| "Edit" button | `onClick` | Abrir editor del flujo |
| "Test" button | `onClick` | Navegar a `/sandbox?flow=:id` |
| Menu "..." | `onClick` | Mostrar opciones (duplicate, archive) |
| "Duplicate" | `onClick` | Crear copia del flujo |
| "Archive" | `onClick` | Confirmar y archivar |

---

## Data Flow

```
1. Pagina carga
   └─> fetchFlows()
   └─> Mostrar skeleton

2. Flujos recibidos
   └─> setFlows(data)
   └─> Renderizar grid

3. Usuario crea nuevo flujo
   └─> Crear flujo en draft
   └─> Abrir editor
   └─> Al guardar: POST /flows

4. Usuario edita flujo
   └─> Cargar flujo completo
   └─> Abrir editor
   └─> Al guardar: PUT /flows/:id
   └─> Incrementar version

5. Usuario archiva flujo
   └─> Confirmar accion
   └─> PATCH /flows/:id { status: 'archived' }
   └─> Actualizar lista
```

---

## Flow Editor Details

El editor de flujos es el componente mas complejo:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [←] Lead Scoring v2.3                    [Save] [Run Test] [Publish]   │
├─────────────────────────────────────────────────────────────────────────┤
│        │                                                        │       │
│ Node   │              ┌─────┐                                   │ Insp- │
│ Palette│              │Start│                                   │ ector │
│        │              └──┬──┘                                   │       │
│ [LLM]  │                 │                                      │ Name: │
│ [JSON] │              ┌──▼──┐                                   │ Type: │
│ [API]  │              │ LLM │←─ selected                        │ Model:│
│ [Cond] │              └──┬──┘                                   │ Prompt│
│        │                 │                                      │       │
│        │           ┌─────┴─────┐                                │       │
│        │        ┌──▼──┐     ┌──▼──┐                             │       │
│        │        │Score│     │ Tag │                             │       │
│        │        └─────┘     └─────┘                             │       │
│        │                                                        │       │
└────────┴────────────────────────────────────────────────────────┴───────┘
```

### Editor Components

- **Node Palette**: Drag & drop de tipos de nodos
- **Canvas**: React Flow con custom nodes
- **Inspector**: Configuracion del nodo seleccionado
- **Toolbar**: Save, Run Test, Publish, Version History

---

## Accessibility

- Grid con `role="grid"` y navegacion por teclado
- Cards como `role="gridcell"` focuseables
- Status badges con `aria-label` descriptivo
- Editor con `role="application"` para controles custom
- Shortcuts de teclado documentados

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Grid 1 columna, editor fullscreen |
| Tablet (640-1024px) | Grid 2 columnas |
| Desktop (> 1024px) | Grid 3-4 columnas, editor modal |
