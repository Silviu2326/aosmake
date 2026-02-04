# Routing Configuration - Doc Generator

## Tech Stack

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | React | 18.x |
| Router | react-router-dom | 6.x |
| Styling | Tailwind CSS | 3.x |
| Build Tool | Vite | 5.x |
| Language | TypeScript | 5.x |

**IMPORTANTE**: No usar Next.js, Remix ni otros frameworks. Solo React + Vite.

---

## Route Map

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `GeneratorPage` | Página principal - input de idea |
| `/preview` | `PreviewPage` | Vista previa de docs generados |
| `/history` | `HistoryPage` | Historial de generaciones anteriores |

---

## Route Structure

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { GeneratorPage } from './pages/GeneratorPage';
import { PreviewPage } from './pages/PreviewPage';
import { HistoryPage } from './pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│                   Header                         │
│  [Logo]              [Generator] [History]       │
├─────────────────────────────────────────────────┤
│                                                  │
│                   <Outlet />                     │
│               (Page Content)                     │
│                                                  │
├─────────────────────────────────────────────────┤
│                   Footer                         │
│           © 2024 DocGen · GitHub                │
└─────────────────────────────────────────────────┘
```

---

## Navigation Items

```typescript
const navItems = [
  { label: 'Generador', path: '/', icon: 'Sparkles' },
  { label: 'Historial', path: '/history', icon: 'Clock' },
];
```

---

## Route Guards / Redirects

| Condición | Acción |
|-----------|--------|
| Acceder a `/preview` sin docs generados | Redirect a `/` |
| Ruta no encontrada (`/*`) | Mostrar 404 o redirect a `/` |

---

## URL State Management

La página de preview usa query params para identificar la sesión:

```
/preview?session=abc123
```

El historial puede filtrar por fecha:

```
/history?from=2024-01-01&to=2024-01-31
```

---

## File Structure

```
src/
├── App.tsx
├── main.tsx
├── pages/
│   ├── GeneratorPage.tsx
│   ├── PreviewPage.tsx
│   └── HistoryPage.tsx
├── components/
│   ├── Layout.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── hooks/
│   └── useDocGenerator.ts
├── stores/
│   └── docsStore.ts
├── types/
│   └── index.ts
└── utils/
    └── ...
```

---

## Navigation Behavior

| Desde | Hacia | Trigger |
|-------|-------|---------|
| `/` | `/preview` | Después de generar docs exitosamente |
| `/preview` | `/` | Click en "Nueva generación" |
| `/history` | `/preview` | Click en item del historial |
| Cualquiera | `/` | Click en logo |
