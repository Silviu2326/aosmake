# LeadDetailPage - Ficha del Lead

**Route**: `/leads/:id`
**Role**: La "ficha clinica" del lead con toda su informacion y acciones rapidas

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox              [Search] [User] [⚙]│
├────────┬────────────────────────────────────────────────────────────────────┤
│        │  ← Back to Leads                                                   │
│  Nav   │  ──────────────────────────────────────────────────────────────────│
│        │                                                                    │
│ Leads  │  ┌─────────────────────────────────────────────────────────────┐  │
│ Import │  │  👤 John Smith                                              │  │
│ Flows  │  │     VP of Engineering @ Acme Inc                            │  │
│ Runs   │  │     ✓ john.smith@acme.com                    Score: 85/100  │  │
│Sandbox │  │                                                              │  │
│        │  │  [Verify Email] [Run Flow ▼] [Edit] [Delete]                │  │
│        │  └─────────────────────────────────────────────────────────────┘  │
│        │                                                                    │
│        │  ┌─────────────────────────┐ ┌─────────────────────────────────┐  │
│        │  │ IDENTITY               │ │ COMPANY                          │  │
│        │  │ ────────────────────── │ │ ───────────────────────────────  │  │
│        │  │ Name:    John Smith    │ │ Name:       Acme Inc             │  │
│        │  │ Email:   john@acme.com │ │ Website:    acme.com         🔗  │  │
│        │  │ Status:  ✓ Valid       │ │ LinkedIn:   linkedin.com/... 🔗  │  │
│        │  │ LinkedIn: /in/jsmith 🔗│ │ Country:    United States        │  │
│        │  │ Phone:   +1 555-1234   │ │ Size:       201-500              │  │
│        │  │ Source:  LinkedIn      │ │ Industry:   SaaS / Technology    │  │
│        │  └─────────────────────────┘ └─────────────────────────────────┘  │
│        │                                                                    │
│        │  ┌─────────────────────────────────────────────────────────────┐  │
│        │  │ ACTIVITY TIMELINE                                    [Filter]│  │
│        │  │ ─────────────────────────────────────────────────────────── │  │
│        │  │ ● 2h ago   Email verified: Valid                            │  │
│        │  │ ● 1d ago   Flow "Lead Scoring" executed: Score 85           │  │
│        │  │ ● 3d ago   Imported from CSV batch #abc123                  │  │
│        │  │ ● 5d ago   Created                                          │  │
│        │  └─────────────────────────────────────────────────────────────┘  │
│        │                                                                    │
│        │  ┌─────────────────────────────────────────────────────────────┐  │
│        │  │ TAGS                                                 [+ Add] │  │
│        │  │ [enterprise] [high-priority] [contacted]                    │  │
│        │  └─────────────────────────────────────────────────────────────┘  │
└────────┴────────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Header con nombre, cargo, email y score
- [ ] Seccion Identidad: nombre, cargo, email (con estado), LinkedIn, fuente
- [ ] Seccion Empresa: nombre, LinkedIn company, web, pais, tamano, industria
- [ ] Accion rapida: Verificar email
- [ ] Accion rapida: Ejecutar flujo puntual (selector de flujo)
- [ ] Boton editar que abre modal de edicion
- [ ] Boton eliminar con confirmacion
- [ ] Link "Back to Leads" para volver a la lista
- [ ] Mostrar estado del email con icono y color

### SHOULD
- [ ] Timeline de actividad del lead
- [ ] Seccion de tags con posibilidad de agregar/eliminar
- [ ] Links externos a LinkedIn y website de empresa
- [ ] Ejecutar paso especifico de un flujo (no todo el flujo)
- [ ] Historial de ejecuciones de flujos en este lead
- [ ] Notas/comentarios del equipo sobre el lead

### COULD
- [ ] Duplicar lead
- [ ] Merge con otro lead (si hay duplicados)
- [ ] Comparar con leads similares
- [ ] Prediccion de probabilidad de conversion
- [ ] Integracion con CRM externo

---

## Components

### LeadHeader
```tsx
interface LeadHeaderProps {
  lead: Lead;
  onVerifyEmail: () => void;
  onRunFlow: (flowId: string, stepId?: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  flows: Flow[];
  isVerifying: boolean;
}
```
- Avatar con iniciales o imagen
- Nombre grande, cargo debajo
- Email con badge de estado
- Score circular con color (verde >70, amarillo 40-70, rojo <40)
- Botones de accion a la derecha

### IdentityCard
```tsx
interface IdentityCardProps {
  lead: Lead;
}
```
- Card con datos personales
- Email clickeable (mailto:)
- LinkedIn clickeable (nueva pestana)
- Icono de estado junto al email

### CompanyCard
```tsx
interface CompanyCardProps {
  lead: Lead;
}
```
- Card con datos de la empresa
- Website y LinkedIn como links externos
- Badge de tamano de empresa
- Badge de industria

### ActivityTimeline
```tsx
interface ActivityTimelineProps {
  activities: Activity[];
  onFilter?: (type: string) => void;
}

interface Activity {
  id: string;
  type: 'email_verified' | 'flow_run' | 'imported' | 'created' | 'updated' | 'tagged';
  timestamp: Date;
  description: string;
  metadata?: any;
}
```
- Lista vertical con linea conectora
- Iconos diferentes por tipo de actividad
- Timestamps relativos ("2h ago")

### TagsSection
```tsx
interface TagsSectionProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}
```
- Chips de tags con X para eliminar
- Input con autocomplete para agregar
- Colores diferentes por categoria de tag

### FlowSelector
```tsx
interface FlowSelectorProps {
  flows: Flow[];
  onSelect: (flowId: string, stepId?: string) => void;
  showSteps?: boolean;
}
```
- Dropdown de flujos disponibles
- Opcionalmente mostrar steps del flujo
- Ejecutar flujo completo o paso especifico

---

## States

| Estado | Condicion | UI |
|--------|-----------|-----|
| `loading` | Cargando lead | Skeleton cards |
| `not_found` | Lead no existe | 404 con link a /leads |
| `idle` | Lead cargado | Vista completa |
| `verifying` | Verificando email | Spinner en boton |
| `running_flow` | Ejecutando flujo | Spinner + progress |
| `editing` | Modal de edicion abierto | Modal overlay |
| `deleting` | Confirmando eliminacion | Dialog de confirmacion |

---

## Interactions

| Elemento | Evento | Accion |
|----------|--------|--------|
| "Back to Leads" | `onClick` | Navegar a `/leads` |
| "Verify Email" | `onClick` | POST verificacion, actualizar estado |
| "Run Flow" dropdown | `onClick` | Abrir selector de flujos |
| Flow item | `onClick` | Ejecutar flujo seleccionado |
| Step item | `onClick` | Ejecutar solo ese paso |
| "Edit" | `onClick` | Abrir modal de edicion |
| "Delete" | `onClick` | Abrir dialog de confirmacion |
| Confirm delete | `onClick` | DELETE lead, navegar a `/leads` |
| LinkedIn link | `onClick` | Abrir en nueva pestana |
| Website link | `onClick` | Abrir en nueva pestana |
| Tag X | `onClick` | Eliminar tag |
| "+ Add" tag | `onClick` | Mostrar input de nuevo tag |

---

## Data Flow

```
1. Pagina carga con :id
   └─> fetchLead(id)
   └─> fetchActivities(id)
   └─> fetchFlows()

2. Lead no encontrado
   └─> Mostrar 404
   └─> Opcion volver a /leads

3. Usuario click "Verify Email"
   └─> setVerifying(true)
   └─> POST /leads/:id/verify-email
   └─> Actualizar lead.emailStatus
   └─> Agregar actividad al timeline

4. Usuario selecciona flujo
   └─> POST /flows/:flowId/run { leadId: id }
   └─> Mostrar progreso
   └─> Actualizar score si aplica
   └─> Agregar actividad al timeline

5. Usuario ejecuta paso especifico
   └─> POST /flows/:flowId/run { leadId: id, stepId: stepId }
   └─> Solo ejecutar ese nodo
   └─> Mostrar resultado inline
```

---

## Quick Actions Detail

```typescript
const quickActions = {
  verifyEmail: {
    label: 'Verify Email',
    icon: 'Mail',
    action: async (leadId: string) => {
      // Llama a AnyMail Finder
      const result = await verifyEmail(leadId);
      // Actualiza estado del lead
      // Registra actividad
    },
  },

  runFlow: {
    label: 'Run Flow',
    icon: 'Play',
    action: async (leadId: string, flowId: string, stepId?: string) => {
      if (stepId) {
        // Ejecutar solo el paso especifico
        await runFlowStep(flowId, stepId, { leadId });
      } else {
        // Ejecutar flujo completo
        await runFlow(flowId, { leadId });
      }
    },
  },
};
```

---

## Accessibility

- Breadcrumb con `aria-label="Breadcrumb"`
- Cards con `role="region"` y `aria-labelledby`
- Links externos con `aria-label` indicando que abren nueva ventana
- Botones de accion con tooltips descriptivos
- Timeline con `role="list"` semantico
- Tags como `role="list"` con items removibles

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Cards en stack vertical, acciones en menu |
| Tablet (640-1024px) | Cards en 1 columna, header condensado |
| Desktop (> 1024px) | Layout 2 columnas como mockup |
