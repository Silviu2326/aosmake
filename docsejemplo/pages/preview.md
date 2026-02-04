# PreviewPage - Doc Generator

**Route**: `/preview`
**Role**: Mostrar documentación generada con navegación por archivos

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo DocGen]                    [Generador] [Historial]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📄 Documentación Generada                                       │
│  Idea: "App de lista de tareas con categorías..."               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  [Globals]  [Pages]                                         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │                                                              ││
│  │  📁 tokens.md  |  routing.md  |  models.md                  ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │                                                              ││
│  │  # Design Tokens                                            ││
│  │                                                              ││
│  │  ## Colors                                                  ││
│  │  - primary: #6366F1                                         ││
│  │  - secondary: ...                                           ││
│  │                                                              ││
│  │  ## Typography                                              ││
│  │  ...                                                        ││
│  │                                                              ││
│  │                                              [📋 Copiar]    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ 📥 Descargar    │  │ ✨ Nueva        │  │ 📝 Editar       │  │
│  │    ZIP          │  │    Generación   │  │    (próximo)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    © 2024 DocGen · GitHub                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Mostrar idea original (truncada si es muy larga)
- [ ] Tabs principales: Globals | Pages
- [ ] Sub-tabs para cada archivo dentro de la categoría
- [ ] Visor de contenido markdown con syntax highlight
- [ ] Botón copiar contenido del archivo actual
- [ ] Botón "Descargar ZIP" con toda la documentación
- [ ] Botón "Nueva Generación" → navega a `/`
- [ ] Si no hay docs generados, redirect a `/`
- [ ] Metadata: fecha, número de archivos

### SHOULD
- [ ] Preview renderizado del markdown (toggle raw/rendered)
- [ ] Indicador de archivo activo
- [ ] Toast de confirmación al copiar
- [ ] Animación al cambiar de tab/archivo
- [ ] Scroll suave en contenido largo

### COULD
- [ ] Editar markdown inline antes de descargar
- [ ] Compartir link (guardar en servidor)
- [ ] Exportar a otros formatos (PDF, HTML)

---

## Components

### PreviewHeader
```tsx
interface PreviewHeaderProps {
  idea: string;
  createdAt: Date;
  totalFiles: number;
}
```
- Icono 📄
- Título: "Documentación Generada"
- Subtítulo: idea truncada (max 100 chars con "...")
- Metadata: "Generado el {fecha} · {n} archivos"

### CategoryTabs
```tsx
interface CategoryTabsProps {
  activeCategory: 'globals' | 'pages';
  onChange: (category: 'globals' | 'pages') => void;
  globalCount: number;
  pageCount: number;
}
```
- Tab "Globals" con badge de conteo
- Tab "Pages" con badge de conteo
- Estilo: tabs con underline en activo

### FileTabs
```tsx
interface FileTabsProps {
  files: DocFile[];
  activeFile: string; // filename
  onChange: (filename: string) => void;
}
```
- Lista horizontal de archivos
- Icono 📁 para cada uno
- Activo: background primary-100, texto primary

### FileViewer
```tsx
interface FileViewerProps {
  content: string;
  filename: string;
  viewMode: 'raw' | 'rendered';
  onCopy: () => void;
}
```
- Contenedor con scroll
- Syntax highlight para markdown (usar prism o similar)
- Toggle raw/rendered (si implementado)
- Botón copiar (arriba derecha o abajo)

### ActionButtons
```tsx
interface ActionButtonsProps {
  onDownload: () => void;
  onNewGeneration: () => void;
  onEdit?: () => void; // opcional/futuro
}
```
- 3 botones en fila:
  - "Descargar ZIP" (primary)
  - "Nueva Generación" (secondary/outline)
  - "Editar" (disabled, futuro)

### CopyToast
- Aparece brevemente al copiar
- "✓ Copiado al portapapeles"
- Auto-dismiss en 2 segundos

---

## States

| Estado | Condición | UI |
|--------|-----------|-----|
| `no-docs` | `generatedDocs === null` | Redirect a `/` |
| `viewing` | Docs disponibles | Mostrar visor |
| `copying` | Copiando al clipboard | Toast de éxito |
| `downloading` | Generando ZIP | Spinner breve en botón |

---

## Interactions

| Elemento | Evento | Acción |
|----------|--------|--------|
| Category tab | `onClick` | Cambia categoría, muestra primer archivo |
| File tab | `onClick` | Cambia archivo activo |
| Copiar btn | `onClick` | Copia content al clipboard, muestra toast |
| Descargar ZIP | `onClick` | Genera y descarga ZIP |
| Nueva Generación | `onClick` | Navega a `/` |
| Toggle raw/rendered | `onClick` | Cambia modo de visualización |

---

## ZIP Structure

Al descargar, genera:

```
docgen-{timestamp}/
├── globals/
│   ├── tokens.md
│   ├── routing.md
│   └── models.md
└── pages/
    ├── home.md
    ├── dashboard.md
    └── ...
```

Usar librería `jszip` para generar en el cliente.

---

## Data Dependencies

```typescript
// Requiere del store:
const { generatedDocs } = useDocsStore();

// Si no hay docs:
if (!generatedDocs) {
  return <Navigate to="/" />;
}

// Extraer datos:
const { idea, globals, pages, metadata, createdAt } = generatedDocs;
```

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | File tabs scroll horizontal, botones stack |
| Tablet (640-1024px) | Layout normal |
| Desktop (> 1024px) | Sidebar con lista de archivos (opcional) |

---

## Accessibility

- Tabs con `role="tablist"` y `role="tab"`
- Panel con `role="tabpanel"`
- Botón copiar con `aria-label="Copiar contenido"`
- Toast con `role="status"` y `aria-live="polite"`
