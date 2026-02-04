# LeadImportPage - Importacion de Leads

**Route**: `/import`
**Role**: Wizard de importacion de leads desde CSV con mapeo, normalizacion y deteccion de duplicados

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox              [Search] [User] [⚙]│
├────────┬────────────────────────────────────────────────────────────────────┤
│        │  Import Leads                                            [Cancel] │
│  Nav   │  ──────────────────────────────────────────────────────────────────│
│        │                                                                    │
│ Leads  │       ●────────────●────────────●────────────●────────────○       │
│ Import◀│      Upload      Mapping    Normalize    Duplicates    Import     │
│ Flows  │                                                                    │
│ Runs   │  ┌─────────────────────────────────────────────────────────────┐  │
│Sandbox │  │                                                              │  │
│        │  │                     Step 2: Column Mapping                   │  │
│        │  │                                                              │  │
│        │  │  CSV Column          →    Lead Field                        │  │
│        │  │  ─────────────────────────────────────────────────────────  │  │
│        │  │  [first_name    ▼]   →    [First Name    ▼]                 │  │
│        │  │  [last_name     ▼]   →    [Last Name     ▼]                 │  │
│        │  │  [email_address ▼]   →    [Email         ▼]  ← Required     │  │
│        │  │  [company_name  ▼]   →    [Company       ▼]  ← Required     │  │
│        │  │  [job_title     ▼]   →    [Job Title     ▼]                 │  │
│        │  │  [linkedin      ▼]   →    [LinkedIn URL  ▼]                 │  │
│        │  │  [country       ▼]   →    [Country       ▼]                 │  │
│        │  │  [notes         ▼]   →    [-- Skip --    ▼]                 │  │
│        │  │                                                              │  │
│        │  │  Preview (first 5 rows):                                    │  │
│        │  │  ┌────────────┬─────────────┬────────────────┬───────────┐  │  │
│        │  │  │ First Name │ Last Name   │ Email          │ Company   │  │  │
│        │  │  ├────────────┼─────────────┼────────────────┼───────────┤  │  │
│        │  │  │ John       │ Smith       │ john@acme.com  │ Acme Inc  │  │  │
│        │  │  │ Jane       │ Doe         │ jane@tech.io   │ TechCorp  │  │  │
│        │  │  └────────────┴─────────────┴────────────────┴───────────┘  │  │
│        │  │                                                              │  │
│        │  └─────────────────────────────────────────────────────────────┘  │
│        │                                                                    │
│        │                              [← Back]  [Next: Normalize →]        │
└────────┴────────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Step 1: Subir archivo CSV (drag & drop o click)
- [ ] Step 2: Mapeo de columnas CSV a campos de Lead
- [ ] Step 3: Normalizacion (limpiar nombres, dominios, telefonos)
- [ ] Step 4: Deteccion de duplicados con opciones de resolucion
- [ ] Preview de datos en cada paso
- [ ] Indicador de progreso del wizard (stepper)
- [ ] Validacion de campos requeridos (email, company)
- [ ] Boton cancelar que vuelve a `/leads`
- [ ] Resumen final antes de importar

### SHOULD
- [ ] Auto-detectar mapeo de columnas por nombres similares
- [ ] Mostrar estadisticas: total filas, validas, con errores
- [ ] Opciones de normalizacion configurables
- [ ] Estrategia de duplicados: skip, update, create new
- [ ] Preview de como quedaran los datos normalizados
- [ ] Poder editar filas individuales antes de importar
- [ ] Guardar mapeo para futuras importaciones

### COULD
- [ ] Importar desde Google Sheets
- [ ] Importar desde otras fuentes (Apollo, LinkedIn export)
- [ ] Programar importaciones recurrentes
- [ ] Rollback de importacion
- [ ] Importar con tags automaticos

---

## Components

### ImportWizard
```tsx
interface ImportWizardProps {
  onComplete: (session: ImportSession) => void;
  onCancel: () => void;
}
```
- Controla el estado del wizard
- Maneja navegacion entre pasos
- Mantiene datos entre pasos

### StepIndicator
```tsx
interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}
```
- Linea horizontal con circulos
- Colores por estado
- Labels debajo de cada paso

### FileUploader
```tsx
interface FileUploaderProps {
  onUpload: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
  isLoading: boolean;
}
```
- Zona de drag & drop
- Click para abrir file picker
- Validacion de tipo y tamano
- Preview del archivo seleccionado

### ColumnMapper
```tsx
interface ColumnMapperProps {
  csvColumns: string[];
  leadFields: LeadField[];
  mapping: ColumnMapping;
  onChange: (mapping: ColumnMapping) => void;
  preview: any[];
}

interface LeadField {
  key: string;
  label: string;
  required: boolean;
}
```
- Dos columnas de dropdowns
- Auto-suggest basado en nombres
- Indicador de campos requeridos
- Preview de datos mapeados

### NormalizationOptions
```tsx
interface NormalizationOptionsProps {
  options: NormalizationConfig;
  onChange: (options: NormalizationConfig) => void;
  preview: NormalizationPreview;
}

interface NormalizationConfig {
  cleanNames: boolean;        // Capitalizar, quitar espacios extra
  normalizeDomains: boolean;  // Lowercase, quitar www
  formatPhones: boolean;      // Formato internacional
  removeEmojis: boolean;      // Limpiar emojis de nombres
}

interface NormalizationPreview {
  before: string;
  after: string;
}
```
- Toggles para cada opcion
- Preview en tiempo real de transformaciones

### DuplicateResolver
```tsx
interface DuplicateResolverProps {
  duplicates: DuplicateGroup[];
  strategy: DuplicateStrategy;
  onStrategyChange: (strategy: DuplicateStrategy) => void;
  onResolve: (groupId: string, action: 'keep_new' | 'keep_old' | 'merge') => void;
}

interface DuplicateGroup {
  id: string;
  newLead: Lead;
  existingLead: Lead;
  matchField: 'email' | 'linkedin' | 'name_company';
  similarity: number;
}
```
- Lista de grupos de duplicados
- Comparacion lado a lado
- Selector de estrategia global
- Resolucion individual por grupo

### ImportSummary
```tsx
interface ImportSummaryProps {
  session: ImportSession;
  onConfirm: () => void;
  onBack: () => void;
}
```
- Estadisticas finales
- Lista de warnings
- Boton "Import" prominente

---

## States

| Estado | Condicion | UI |
|--------|-----------|-----|
| `step_upload` | Paso 1 | FileUploader visible |
| `uploading` | Subiendo archivo | Progress bar |
| `step_mapping` | Paso 2 | ColumnMapper visible |
| `step_normalize` | Paso 3 | NormalizationOptions visible |
| `step_duplicates` | Paso 4 | DuplicateResolver visible |
| `step_summary` | Paso 5 | ImportSummary visible |
| `importing` | Ejecutando importacion | Progress con contadores |
| `completed` | Importacion exitosa | Success message, link a /leads |
| `error` | Error en importacion | Error message, opcion reintentar |

---

## Interactions

| Elemento | Evento | Accion |
|----------|--------|--------|
| Drop zone | `onDrop` | Validar y subir archivo |
| "Browse" | `onClick` | Abrir file picker |
| CSV column dropdown | `onChange` | Actualizar mapping |
| Lead field dropdown | `onChange` | Actualizar mapping |
| "Auto-detect" | `onClick` | Sugerir mapping automatico |
| Toggle normalizacion | `onChange` | Actualizar config, refresh preview |
| Strategy radio | `onChange` | Cambiar estrategia global |
| "Keep New" / "Keep Old" | `onClick` | Resolver duplicado individual |
| "Next" | `onClick` | Validar paso, avanzar |
| "Back" | `onClick` | Retroceder un paso |
| "Cancel" | `onClick` | Confirmar y volver a /leads |
| "Import" | `onClick` | Ejecutar importacion final |

---

## Data Flow

```
1. Usuario sube CSV
   └─> Parsear archivo
   └─> Extraer headers y primeras filas
   └─> Guardar en session state

2. Mapeo de columnas
   └─> Auto-detectar por nombres similares
   └─> Usuario ajusta manualmente
   └─> Validar campos requeridos

3. Normalizacion
   └─> Aplicar transformaciones segun config
   └─> Mostrar preview before/after
   └─> Usuario ajusta opciones

4. Deteccion de duplicados
   └─> Comparar por email (exacto)
   └─> Comparar por LinkedIn (si disponible)
   └─> Comparar por nombre+empresa (fuzzy)
   └─> Agrupar duplicados encontrados
   └─> Usuario resuelve conflictos

5. Importacion final
   └─> Validar todo
   └─> POST /import/execute
   └─> Mostrar progreso en tiempo real
   └─> Al completar: navegar a /leads con filtro por batch
```

---

## Normalization Rules

```typescript
const normalizationRules = {
  cleanNames: (name: string) => {
    return name
      .trim()
      .replace(/\s+/g, ' ')                    // Multiple espacios
      .replace(/[^\w\s-]/g, '')                // Caracteres especiales
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  normalizeDomains: (domain: string) => {
    return domain
      .toLowerCase()
      .trim()
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  },

  formatPhones: (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1 ${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    }
    return phone;
  },
};
```

---

## Duplicate Detection Logic

```typescript
const detectDuplicates = async (leads: Lead[]) => {
  const duplicates: DuplicateGroup[] = [];

  for (const lead of leads) {
    // 1. Exact email match
    const emailMatch = await findByEmail(lead.email);
    if (emailMatch) {
      duplicates.push({
        newLead: lead,
        existingLead: emailMatch,
        matchField: 'email',
        similarity: 1.0,
      });
      continue;
    }

    // 2. LinkedIn match
    if (lead.linkedinUrl) {
      const linkedinMatch = await findByLinkedin(lead.linkedinUrl);
      if (linkedinMatch) {
        duplicates.push({
          newLead: lead,
          existingLead: linkedinMatch,
          matchField: 'linkedin',
          similarity: 1.0,
        });
        continue;
      }
    }

    // 3. Fuzzy name + company match
    const fuzzyMatch = await findByNameCompany(lead.fullName, lead.company);
    if (fuzzyMatch && fuzzyMatch.similarity > 0.85) {
      duplicates.push({
        newLead: lead,
        existingLead: fuzzyMatch.lead,
        matchField: 'name_company',
        similarity: fuzzyMatch.similarity,
      });
    }
  }

  return duplicates;
};
```

---

## Accessibility

- Wizard con `role="form"` y `aria-label`
- Stepper con `role="progressbar"` y `aria-valuenow`
- File upload con `aria-describedby` para instrucciones
- Dropdowns con labels asociados
- Error messages con `role="alert"`
- Progress bar con `aria-valuemin/max/now`

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Wizard full width, stepper vertical |
| Tablet (640-1024px) | Mapper en stack, preview colapsable |
| Desktop (> 1024px) | Layout completo como mockup |
