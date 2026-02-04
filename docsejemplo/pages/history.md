# HistoryPage - Doc Generator

**Route**: `/history`
**Role**: Ver y gestionar generaciones anteriores guardadas en localStorage

---

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo DocGen]                    [Generador] [Historial]       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📚 Historial de Generaciones                                    │
│  Tienes 5 documentaciones guardadas                              │
│                                                      [🗑 Limpiar]│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Buscar en historial...                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📄 App de lista de tareas con categorías y...              ││
│  │     Hace 2 horas · 6 páginas                        [→] [🗑]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  📄 Dashboard de analytics con gráficos...                  ││
│  │     Ayer · 8 páginas                                [→] [🗑]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  📄 E-commerce con carrito y checkout...                    ││
│  │     Hace 3 días · 12 páginas                        [→] [🗑]││
│  ├─────────────────────────────────────────────────────────────┤│
│  │  📄 Blog personal con editor markdown...                    ││
│  │     Hace 1 semana · 5 páginas                       [→] [🗑]││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│                        Mostrando 4 de 5                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              ¿Primera vez aquí?                              ││
│  │   Genera tu primera documentación para verla aquí           ││
│  │                  [Ir al Generador →]                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                    © 2024 DocGen · GitHub                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Requirements Checklist

### MUST
- [ ] Listar todas las generaciones guardadas en localStorage
- [ ] Cada item muestra: idea (truncada), fecha relativa, número de páginas
- [ ] Click en item → cargar y navegar a `/preview`
- [ ] Botón eliminar individual por item
- [ ] Botón "Limpiar historial" (con confirmación)
- [ ] Estado vacío si no hay historial
- [ ] Ordenar por fecha (más reciente primero)

### SHOULD
- [ ] Buscador para filtrar por texto de idea
- [ ] Confirmación antes de eliminar (modal o inline)
- [ ] Animación al eliminar item
- [ ] Paginación si hay muchos items (> 10)
- [ ] Indicador de espacio usado en localStorage

### COULD
- [ ] Exportar todo el historial
- [ ] Importar historial desde archivo
- [ ] Ordenar por diferentes criterios

---

## Components

### HistoryHeader
```tsx
interface HistoryHeaderProps {
  totalItems: number;
  onClearAll: () => void;
}
```
- Icono 📚
- Título: "Historial de Generaciones"
- Subtítulo: "Tienes {n} documentaciones guardadas"
- Botón "Limpiar" (destructivo, requiere confirmación)

### SearchInput
```tsx
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}
```
- Icono 🔍 a la izquierda
- Input con placeholder "Buscar en historial..."
- Botón X para limpiar si tiene texto

### HistoryList
```tsx
interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}
```
- Lista vertical de HistoryItem
- Separadores entre items

### HistoryItem
```tsx
interface HistoryItemProps {
  item: HistoryItem;
  onSelect: () => void;
  onDelete: () => void;
}
```
- Icono 📄
- Idea truncada (max 60 chars)
- Fecha relativa: "Hace 2 horas", "Ayer", "Hace 3 días"
- Badge: "{n} páginas"
- Botón ver (→) → `onSelect`
- Botón eliminar (🗑) → `onDelete`
- Hover: background sutil

### EmptyState
```tsx
interface EmptyStateProps {
  filtered?: boolean; // true si es resultado de búsqueda vacía
}
```
Si `filtered`:
- "No hay resultados para tu búsqueda"
- Botón "Limpiar búsqueda"

Si no `filtered`:
- Icono grande
- "¿Primera vez aquí?"
- "Genera tu primera documentación para verla aquí"
- Botón "Ir al Generador →"

### ConfirmModal
```tsx
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}
```
- Overlay oscuro
- Card centrado con título, mensaje, botones
- Si `destructive`: botón confirmar en rojo

---

## States

| Estado | Condición | UI |
|--------|-----------|-----|
| `loading` | Cargando de localStorage | Skeleton |
| `empty` | No hay historial | EmptyState |
| `empty-filtered` | Búsqueda sin resultados | EmptyState con mensaje de filtro |
| `viewing` | Hay items | Lista de items |
| `confirming-delete` | Modal de confirmación abierto | Modal + lista |
| `deleting` | Eliminando item | Item con opacity, loading |

---

## Interactions

| Elemento | Evento | Acción |
|----------|--------|--------|
| Search input | `onChange` | Filtra lista en tiempo real |
| Search X | `onClick` | Limpia búsqueda |
| History item | `onClick` | Carga docs, navega a `/preview` |
| Item → btn | `onClick` | Mismo que click en item |
| Item 🗑 btn | `onClick` | Abre modal confirmación |
| Limpiar todo | `onClick` | Abre modal confirmación |
| Modal confirmar | `onClick` | Ejecuta delete, cierra modal |
| Modal cancelar | `onClick` | Cierra modal |
| Ir al Generador | `onClick` | Navega a `/` |

---

## Data Flow

```
1. Cargar historial
   └─> loadHistory() // de localStorage
   └─> setHistory(items)

2. Buscar
   └─> setSearchQuery(text)
   └─> filteredItems = items.filter(...)

3. Seleccionar item
   └─> loadFromHistory(id)
   └─> setGeneratedDocs(docs)
   └─> navigate('/preview')

4. Eliminar item
   └─> showConfirmModal()
   └─> [usuario confirma]
   └─> deleteFromHistory(id)
   └─> updateLocalStorage()

5. Limpiar todo
   └─> showConfirmModal("¿Eliminar todo el historial?")
   └─> [usuario confirma]
   └─> clearHistory()
   └─> localStorage.removeItem('docgen_history')
```

---

## Date Formatting

Usar fechas relativas:
- < 1 minuto: "Hace un momento"
- < 1 hora: "Hace {n} minutos"
- < 24 horas: "Hace {n} horas"
- < 2 días: "Ayer"
- < 7 días: "Hace {n} días"
- < 30 días: "Hace {n} semanas"
- >= 30 días: "dd/mm/yyyy"

Librería sugerida: `date-fns` con `formatDistanceToNow`

---

## localStorage Limits

- Mostrar warning si:
  - localStorage > 4MB usado
  - Más de 15 items guardados

- Mensaje: "Estás alcanzando el límite de almacenamiento. Considera eliminar generaciones antiguas."

---

## Responsive Behavior

| Breakpoint | Cambios |
|------------|---------|
| Mobile (< 640px) | Items full width, botones más pequeños |
| Tablet (640-1024px) | Layout normal |
| Desktop (> 1024px) | Max-width en lista |

---

## Accessibility

- Lista con `role="list"` y items con `role="listitem"`
- Botones con `aria-label` descriptivo
- Modal con `role="dialog"` y `aria-modal="true"`
- Focus trap en modal
- Anunciar eliminaciones con `aria-live`
