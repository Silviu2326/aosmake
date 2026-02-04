# LeadsPage - Lista Principal de Leads

**Route**: `/leads`
**Role**: Pagina estrella donde el usuario gestiona su base de leads con filtros y acciones masivas

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox              [Search] [User] [⚙]│
├────────┬────────────────────────────────────────────────────────────────────┤
│        │  Leads                                    [Import CSV] [+ Add Lead]│
│  Nav   │  ──────────────────────────────────────────────────────────────────│
│        │                                                                    │
│ Leads◀ │  ┌─────────────────────────────────────────────────────────────┐  │
│ Import │  │ Filters: [Email Status▼] [Source▼] [Tags▼] [Score▼] [Clear] │  │
│ Flows  │  └─────────────────────────────────────────────────────────────┘  │
│ Runs   │                                                                    │
│Sandbox │  ┌──────────────────────────────────────────────────────────────┐ │
│        │  │ ☑ Selected: 24 leads    [Verify Email] [Run Flow▼] [Delete]  │ │
│        │  └──────────────────────────────────────────────────────────────┘ │
│        │                                                                    │
│        │  ┌──┬────────────────┬─────────────┬───────────┬────────┬──────┐ │
│        │  │☐ │ Name           │ Email       │ Company   │ Status │ Score│ │
│        │  ├──┼────────────────┼─────────────┼───────────┼────────┼──────┤ │
│        │  │☑ │ John Smith     │ john@...    │ Acme Inc  │ ✓ Valid│  85  │ │
│        │  │☑ │ Jane Doe       │ jane@...    │ TechCorp  │ ⚠ Risky│  72  │ │
│        │  │☐ │ Bob Wilson     │ bob@...     │ StartupX  │ ? Pend │  --  │ │
│        │  │☐ │ Alice Brown    │ alice@...   │ BigCo     │ ✗ Invld│  45  │ │
│        │  └──┴────────────────┴─────────────┴───────────┴────────┴──────┘ │
│        │                                                                    │
│        │  Showing 1-50 of 1,234 leads                    [◀] 1 2 3 ... [▶] │
└────────┴────────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Tabla de leads con columnas: checkbox, nombre, email, empresa, estado email, score
- [ ] Checkbox para seleccion multiple de leads
- [ ] Barra de acciones bulk que aparece al seleccionar leads
- [ ] Filtros por: estado de email, fuente, tags, rango de score
- [ ] Accion masiva: "Verificar Email" con AnyMail Finder
- [ ] Accion masiva: "Ejecutar Flujo" con selector de flujo
- [ ] Paginacion con 50 leads por pagina
- [ ] Indicador visual del estado del email (iconos de color)
- [ ] Click en fila navega a `/leads/:id`
- [ ] Boton "Import CSV" navega a `/import`
- [ ] Boton "Add Lead" abre modal de creacion

### SHOULD
- [ ] Busqueda global por nombre, email o empresa
- [ ] Ordenar por cualquier columna (click en header)
- [ ] Seleccionar todos los leads de la pagina actual
- [ ] Seleccionar todos los leads filtrados
- [ ] Exportar leads seleccionados a CSV
- [ ] Limpiar nombres automaticamente antes de ejecutar acciones
- [ ] Reintentar verificacion de emails pendientes en 45 min
- [ ] Mostrar conteo de leads por estado en filtros

### COULD
- [ ] Vista de tarjetas alternativa a tabla
- [ ] Guardar filtros como "vistas" personalizadas
- [ ] Drag & drop para reordenar columnas
- [ ] Bulk tagging con autocomplete
- [ ] Preview de lead en hover

---

## Components

### LeadTable
```tsx
interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onRowClick: (id: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (column: string) => void;
}
```
- Tabla con filas seleccionables
- Headers clickeables para ordenar
- Iconos de estado de email con colores semanticos
- Score con barra de progreso visual

### LeadFilters
```tsx
interface LeadFiltersProps {
  filters: LeadFilters;
  onChange: (filters: LeadFilters) => void;
  onClear: () => void;
  counts?: FilterCounts;
}
```
- Dropdowns multiples para cada filtro
- Badges con conteo de leads por opcion
- Boton "Clear All" para resetear

### BulkActionBar
```tsx
interface BulkActionBarProps {
  selectedCount: number;
  onVerifyEmail: () => void;
  onRunFlow: (flowId: string) => void;
  onDelete: () => void;
  onExport: () => void;
  flows: Flow[];
}
```
Estados visuales:
| Estado | Apariencia |
|--------|------------|
| Hidden | No visible (0 seleccionados) |
| Visible | Barra fija con acciones |
| Loading | Spinner en boton activo |

### EmailStatusBadge
```tsx
interface EmailStatusBadgeProps {
  status: EmailStatus;
}
```
| Status | Color | Icono |
|--------|-------|-------|
| `valid` | green | CheckCircle |
| `invalid` | red | XCircle |
| `risky` | yellow | AlertTriangle |
| `pending` | blue | Clock |
| `unknown` | gray | HelpCircle |

### Pagination
```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}
```

---

## States

| Estado | Condicion | UI |
|--------|-----------|-----|
| `loading` | Cargando leads | Skeleton table |
| `empty` | Sin leads | Empty state con CTA importar |
| `filtered_empty` | Filtros sin resultados | Mensaje "No hay resultados" |
| `idle` | Leads cargados | Tabla con datos |
| `selecting` | Leads seleccionados | Bulk action bar visible |
| `bulk_action` | Ejecutando accion | Loading en accion activa |

---

## Interactions

| Elemento | Evento | Accion |
|----------|--------|--------|
| Checkbox fila | `onClick` | Toggle seleccion del lead |
| Checkbox header | `onClick` | Seleccionar/deseleccionar todos visibles |
| Fila de lead | `onClick` | Navegar a `/leads/:id` |
| Header columna | `onClick` | Ordenar por esa columna |
| Filtro dropdown | `onChange` | Aplicar filtro, resetear pagina |
| "Clear All" | `onClick` | Resetear todos los filtros |
| "Verify Email" | `onClick` | Llamar API verificacion bulk |
| "Run Flow" | `onClick` | Abrir selector de flujo |
| Flow selected | `onClick` | Ejecutar flujo en leads seleccionados |
| "Delete" | `onClick` | Confirmar y eliminar leads |
| "Import CSV" | `onClick` | Navegar a `/import` |
| Paginacion | `onClick` | Cambiar pagina |

---

## Data Flow

```
1. Pagina carga
   └─> fetchLeads(filters)
   └─> Mostrar skeleton

2. Leads recibidos
   └─> setLeads(data)
   └─> Renderizar tabla

3. Usuario selecciona leads
   └─> setSelectedIds([...])
   └─> Mostrar BulkActionBar

4. Usuario click "Verify Email"
   └─> setLoading(true)
   └─> POST /leads/bulk { action: 'verify_email', ids: [...] }
   └─> Actualizar estados individuales
   └─> Mostrar toast de progreso

5. Verificacion tiene reglas:
   └─> Si pendiente: reintentar en 45 min
   └─> Si risky: marcar para revision manual
   └─> Limpiar nombres antes de enviar
```

---

## Email Verification Rules

```typescript
const emailVerificationRules = {
  // Antes de verificar
  preProcess: {
    cleanNames: true,           // Eliminar caracteres especiales
    normalizeDomain: true,      // lowercase, trim
  },

  // Durante verificacion
  retryPolicy: {
    onPending: {
      retryAfterMinutes: 45,
      maxRetries: 3,
    },
  },

  // Despues de verificar
  postProcess: {
    autoTagRisky: true,         // Agregar tag "risky-email"
    notifyOnInvalid: true,      // Notificar si > 50% invalidos
  },
};
```

---

## Accessibility

- Tabla con `role="grid"` y `aria-label`
- Checkboxes con `aria-checked` y labels
- Filtros con `aria-expanded` cuando abiertos
- Bulk bar con `aria-live="polite"` para anunciar seleccion
- Paginacion con `aria-current="page"`
- Status badges con `aria-label` descriptivo

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Tabla scroll horizontal, filtros colapsados |
| Tablet (640-1024px) | Filtros en 2 columnas |
| Desktop (> 1024px) | Layout completo como mockup |
