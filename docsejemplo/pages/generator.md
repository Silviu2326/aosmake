# GeneratorPage - Doc Generator

**Route**: `/`
**Role**: Página principal donde el usuario ingresa su idea y genera documentación

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo DocGen]                    [Generador] [Historial]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         ✨ DocGen                                │
│              De idea a documentación en segundos                 │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  Describe tu idea de aplicación...                        │  │
│  │                                                           │  │
│  │                                                           │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                    0/2000       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Opciones (opcional)                                    [▼] ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            ││
│  │ │ Complejidad │ │   Estilo    │ │ Incluir Auth│            ││
│  │ │  [Medium▼]  │ │  [Modern▼]  │ │    [ ]      │            ││
│  │ └─────────────┘ └─────────────┘ └─────────────┘            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│              [ ✨ Generar Documentación ]                        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 💡 Ejemplos de ideas:                                     │  │
│  │ • "App de lista de tareas con categorías y recordatorios" │  │
│  │ • "Dashboard de analytics con gráficos y filtros"         │  │
│  │ • "E-commerce con carrito, checkout y perfil de usuario"  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    © 2024 DocGen · GitHub                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Header con logo y navegación (Generador, Historial)
- [ ] Título hero: "DocGen" con tagline
- [ ] Textarea para ingresar idea (mínimo 4 líneas visibles)
- [ ] Contador de caracteres (0/2000)
- [ ] Validación: mínimo 10 caracteres para habilitar botón
- [ ] Botón "Generar Documentación" (disabled si < 10 chars)
- [ ] Estado loading con spinner mientras genera
- [ ] Navegación a `/preview` tras generación exitosa
- [ ] Mostrar error si falla la generación
- [ ] Footer con copyright

### SHOULD
- [ ] Panel colapsable de opciones (complejidad, estilo, auth)
- [ ] Ejemplos de ideas clickeables que rellenan el textarea
- [ ] Persistir última idea en localStorage
- [ ] Animación suave en transiciones
- [ ] Focus automático en textarea al cargar

### COULD
- [ ] Guardar borradores automáticamente
- [ ] Sugerencias mientras escribes
- [ ] Modo oscuro

---

## Components

### Header
```tsx
interface HeaderProps {
  // No props, usa navegación interna
}
```
- Logo "DocGen" a la izquierda → link a `/`
- Nav links a la derecha: Generador (activo), Historial
- Sticky en scroll

### HeroSection
- Icono: ✨ (Sparkles)
- Título: "DocGen"
- Subtítulo: "De idea a documentación en segundos"

### IdeaTextarea
```tsx
interface IdeaTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}
```
- Textarea con 4-6 líneas visibles
- Placeholder: "Describe tu idea de aplicación. Ej: Una app de gestión de proyectos con kanban, usuarios y reportes..."
- Contador de caracteres abajo a la derecha
- Borde cambia a primary cuando tiene focus
- Borde rojo si supera maxLength

### OptionsPanel
```tsx
interface OptionsPanelProps {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
  collapsed?: boolean;
}
```
- Collapsible (default: collapsed)
- Contiene:
  - **Complejidad**: Select (simple, medium, complex)
  - **Estilo**: Select (minimal, modern, corporate)
  - **Incluir Auth**: Checkbox

### GenerateButton
```tsx
interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}
```
Estados visuales:
| Estado | Apariencia |
|--------|------------|
| Disabled | Gris, cursor not-allowed |
| Enabled | Primary color, hover effect |
| Loading | Spinner + "Generando...", disabled |

### ExamplesCard
- Lista de 3-4 ideas de ejemplo
- Click en una → rellena el textarea
- Estilo: card con fondo sutil

### ErrorAlert
```tsx
interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}
```
- Background rojo claro, borde rojo
- Icono de error, mensaje, botón X para cerrar

---

## States

| Estado | Condición | UI |
|--------|-----------|-----|
| `idle` | Sin texto o < 10 chars | Botón disabled |
| `ready` | Texto >= 10 chars | Botón enabled |
| `generating` | Llamada en curso | Spinner, textarea disabled |
| `success` | Generación completa | Redirect a /preview |
| `error` | Fallo en generación | Mostrar ErrorAlert |

---

## Interactions

| Elemento | Evento | Acción |
|----------|--------|--------|
| Textarea | `onChange` | Actualiza state, valida longitud |
| Textarea | `onFocus` | Resalta borde |
| Botón Generar | `onClick` | Llama `generateDocs()`, muestra loading |
| Ejemplo | `onClick` | Copia texto al textarea |
| Options toggle | `onClick` | Expande/colapsa panel |
| Error X | `onClick` | Oculta error |
| Logo | `onClick` | Navega a `/` |
| Historial link | `onClick` | Navega a `/history` |

---

## Data Flow

```
1. Usuario escribe idea
   └─> setIdea(text)
   └─> Validación (length >= 10)

2. Usuario click "Generar"
   └─> setStatus('generating')
   └─> generateDocs({ idea, options })

3a. Éxito
   └─> setGeneratedDocs(docs)
   └─> saveToHistory(docs)
   └─> navigate('/preview')

3b. Error
   └─> setError(error)
   └─> setStatus('error')
```

---

## Accessibility

- Textarea con `aria-label="Describe tu idea de aplicación"`
- Contador con `aria-live="polite"`
- Botón con `aria-disabled` cuando corresponda
- Spinner con `aria-busy="true"`
- Error con `role="alert"`

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Textarea full width, opciones stack vertical |
| Tablet (640-1024px) | Contenedor con padding lateral |
| Desktop (> 1024px) | Max-width 800px, centrado |
