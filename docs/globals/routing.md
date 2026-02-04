# Routing Configuration - AOS Studio

## Tech Stack

| Categoria | Tecnologia | Version |
|-----------|------------|---------|
| Framework | React | 18.x |
| Router | react-router-dom | 6.x |
| Styling | Tailwind CSS | 3.x |
| Build Tool | Vite | 5.x |
| Language | TypeScript | 5.x |
| Node Editor | React Flow | 11.x |
| Icons | Lucide React | latest |

**IMPORTANTE**: No usar Next.js, Remix ni otros frameworks. Solo React + Vite.

---

## Route Map

| Ruta | Componente | Descripcion |
|------|------------|-------------|
| `/leads` | `LeadsPage` | Lista principal de leads |
| `/leads/:id` | `LeadDetailPage` | Ficha detallada del lead |
| `/import` | `LeadImportPage` | Wizard de importacion CSV |
| `/flows` | `FlowsPage` | Biblioteca de flujos |
| `/runs` | `RunsPage` | Cola de ejecuciones |
| `/sandbox` | `SandboxPage` | Laboratorio de pruebas |

---

## Route Structure

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { LeadImportPage } from './pages/LeadImportPage';
import { FlowsPage } from './pages/FlowsPage';
import { RunsPage } from './pages/RunsPage';
import { SandboxPage } from './pages/SandboxPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/import" element={<LeadImportPage />} />
          <Route path="/flows" element={<FlowsPage />} />
          <Route path="/flows/:id" element={<FlowsPage />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/sandbox" element={<SandboxPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo AOS]    Leads  Flows  Runs  Sandbox     [User] [Settings]│
├────────┬────────────────────────────────────────────────────────┤
│        │                                                        │
│  Nav   │                    <Outlet />                          │
│  Bar   │                  (Page Content)                        │
│        │                                                        │
│ Leads  │                                                        │
│ Import │                                                        │
│ Flows  │                                                        │
│ Runs   │                                                        │
│Sandbox │                                                        │
│        │                                                        │
└────────┴────────────────────────────────────────────────────────┘
```

---

## Navigation Items

```typescript
const navItems = [
  { label: 'Leads', path: '/leads', icon: 'Users' },
  { label: 'Import', path: '/import', icon: 'Upload' },
  { label: 'Flows', path: '/flows', icon: 'GitBranch' },
  { label: 'Runs', path: '/runs', icon: 'Play' },
  { label: 'Sandbox', path: '/sandbox', icon: 'FlaskConical' },
];
```

---

## Route Guards / Redirects

| Condicion | Accion |
|-----------|--------|
| Acceder a `/leads/:id` con ID inexistente | Mostrar 404 o redirect a `/leads` |
| Acceder a `/flows/:id` sin flujo | Redirect a `/flows` |
| Ruta no encontrada (`/*`) | Redirect a `/leads` |

---

## URL State Management

La pagina de leads usa query params para filtros:

```
/leads?status=verified&source=linkedin&page=2
```

La pagina de runs filtra por tipo:

```
/runs?type=precrafter&status=success
```

El sandbox puede recibir un flujo para cargar:

```
/sandbox?flow=abc123&mode=test
```

---

## File Structure

```
src/
├── App.tsx
├── main.tsx
├── pages/
│   ├── LeadsPage.tsx
│   ├── LeadDetailPage.tsx
│   ├── LeadImportPage.tsx
│   ├── FlowsPage.tsx
│   ├── RunsPage.tsx
│   └── SandboxPage.tsx
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── leads/
│   │   ├── LeadTable.tsx
│   │   ├── LeadFilters.tsx
│   │   ├── LeadCard.tsx
│   │   └── BulkActions.tsx
│   ├── flows/
│   │   ├── FlowList.tsx
│   │   ├── FlowEditor.tsx
│   │   └── FlowCard.tsx
│   ├── import/
│   │   ├── ImportWizard.tsx
│   │   ├── ColumnMapper.tsx
│   │   └── DuplicateResolver.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Table.tsx
├── hooks/
│   ├── useLeads.ts
│   ├── useFlows.ts
│   └── useRuns.ts
├── stores/
│   └── appStore.ts
├── types/
│   └── index.ts
├── utils/
│   └── ...
└── api/
    └── endpoints.ts
```

---

## Navigation Behavior

| Desde | Hacia | Trigger |
|-------|-------|---------|
| `/leads` | `/leads/:id` | Click en fila de lead |
| `/leads` | `/import` | Click en "Import CSV" |
| `/leads/:id` | `/leads` | Click en "Back" o breadcrumb |
| `/flows` | `/sandbox` | Click en "Test Flow" |
| `/runs` | `/leads/:id` | Click en lead de un run |
| `/import` | `/leads` | Importacion completada |
| Cualquiera | `/leads` | Click en logo |
