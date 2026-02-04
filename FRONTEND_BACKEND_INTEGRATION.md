# Frontend-Backend Integration Guide

## 📊 AOS Studio - Arquitectura Full-Stack

Este documento explica cómo está conectada la aplicación frontend (React/Vite) con el backend (Node.js/Express).

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Pages: DashboardPage, LeadsPage, ImportPage, etc.      │    │
│  │  Components: DashboardLeadTable, DashboardCharts, etc.  │    │
│  │  Stores: useDashboardStore (Zustand)                    │    │
│  │  Services: dashboardApi.ts                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                    fetch/axios API calls                        │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API Base URL: http://localhost:3001/api               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST API
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Routes: /api/leads, /api/workflows                     │    │
│  │  Controllers: leadController.js, workflowController.js  │    │
│  │  Models: LeadModel.js (PostgreSQL)                      │    │
│  │  Services: llmService.js                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                  │
│                    PostgreSQL Database                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Host: aws-1-eu-central-2.pooler.supabase.com:6543     │    │
│  │  Database: postgres                                     │    │
│  │  Tables: leads, workflows                              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Conexión Principal: Dashboard

### Flujo de datos del Dashboard:

```
Frontend (DashboardPage.tsx)
         │
         ▼ useDashboardStore()
┌─────────────────────────┐
│  fetchLeads(filters)    │ ──► dashboardApi.getLeads(filters)
│  fetchMetrics()         │ ──► dashboardApi.getMetrics()
└─────────────────────────┘
         │
         ▼
Backend (src/server.js)
         │
         ▼ Routes
┌─────────────────────────────────────┐
│  GET /api/leads      → leadRoutes   │
│  GET /api/leads/metrics              │
└─────────────────────────────────────┘
         │
         ▼ Controllers
┌─────────────────────────────────────┐
│  leadController.index()             │
│  leadController.metrics()           │
└─────────────────────────────────────┘
         │
         ▼ Models
┌─────────────────────────────────────┐
│  LeadModel.findAll(filters)         │
│  LeadModel.calculateMetrics()       │
└─────────────────────────────────────┘
         │
         ▼
    PostgreSQL Database
```

---

## 📁 Estructura de Archivos

### Frontend

```
src/
├── pages/
│   └── DashboardPage.tsx          # Página principal del dashboard
├── components/dashboard/
│   ├── DashboardLeadTable.tsx     # Tabla de leads
│   ├── DashboardCharts.tsx        # Gráficos
│   ├── DashboardFilters.tsx       # Filtros
│   ├── DashboardPagination.tsx    # Paginación
│   └── DashboardBulkActions.tsx   # Acciones masivas
├── stores/
│   └── useDashboardStore.ts       # Zustand store global
└── services/
    └── dashboardApi.ts            # API service layer
```

### Backend

```
backend/src/
├── server.js                       # Entry point
├── routes/
│   ├── leadRoutes.js              # /api/leads endpoints
│   └── workflowRoutes.js          # /api/workflows endpoints
├── controllers/
│   ├── leadController.js          # Lógica de leads
│   └── workflowController.js      # Lógica de workflows
├── models/
│   ├── LeadModel.js               # PostgreSQL queries
│   └── WorkflowModel.js
└── services/
    └── llmService.js              # Integración IA
```

---

## 🔌 API Endpoints

### Leads API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/leads` | Obtener leads con filtros |
| `GET` | `/api/leads/:LeadNumber` | Obtener un lead específico |
| `POST` | `/api/leads` | Crear un lead |
| `PATCH` | `/api/leads/:LeadNumber` | Actualizar un lead |
| `DELETE` | `/api/leads/:LeadNumber` | Eliminar un lead |
| `POST` | `/api/leads/send-to-verification` | Enviar a verificación |
| `POST` | `/api/leads/send-to-comp-scrap` | Enviar a CompScrap |
| `POST` | `/api/leads/send-to-box1` | Enviar a Box1 |
| `POST` | `/api/leads/send-to-instantly` | Enviar a Instantly |
| `GET` | `/api/leads/metrics` | Obtener métricas |
| `POST` | `/api/leads/export-csv` | Exportar a CSV |

### Workflows API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/workflows` | Listar workflows |
| `POST` | `/api/workflows` | Crear workflow |
| `GET` | `/api/workflows/:id` | Obtener workflow |
| `POST` | `/api/workflows/:id/run` | Ejecutar workflow |

---

## 🎯 Tipos de Datos (TypeScript)

### LeadFilters (Frontend → Backend)

```typescript
interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: string;  // 'pending', 'sent', 'verified', 'failed'
  compScrapStatus?: string;     // 'pending', 'sent', 'scraped', 'failed'
  box1Status?: string;          // 'pending', 'sent', 'fit', 'hit', 'drop', 'no_fit', 'failed'
  instantlyStatus?: string;     // 'pending', 'sent', 'replied', 'positive_reply', 'converted', 'bounced'
  hasCompUrl?: boolean;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}
```

### DashboardLead

```typescript
interface DashboardLead {
  LeadNumber: string;
  TargetID: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  compUrl?: string;
  stepStatus: {
    export: boolean;
    verification: VerificationStatus;
    compScrap: CompScrapStatus;
    box1: Box1Status;
    instantly: InstantlyStatus;
  };
  // ... más campos
}
```

### DashboardMetrics

```typescript
interface DashboardMetrics {
  // Totales
  totalExport: number;
  
  // Verification
  pendingVerification: number;
  sentVerification: number;
  verified: number;
  verificationRatio: number;
  
  // CompScrap
  pendingCompScrap: number;
  sentCompScrap: number;
  scraped: number;
  compScrapRatio: number;
  
  // Box1
  pendingBox1: number;
  dropCount: number;
  fitCount: number;
  hitCount: number;
  fitHitRatio: number;
  
  // Instantly
  pendingInstantly: number;
  replyRatio: number;
  positiveReplyRatio: number;
  conversionRatio: number;
}
```

---

## 🔄 Ciclo de Vida de una Petición

### Ejemplo: Obtener leads con filtros

```
1. User cambia filtros en DashboardFilters.tsx
   └─► setFilters() actualiza estado local

2. useEffect detecta cambio en [filters]
   └─► fetchLeads(leadFilters) desde useDashboardStore

3. useDashboardStore llama a dashboardApi.getLeads(filters)
   └─► Construye query params: ?search=test&verificationStatus=pending

4. dashboardApi hace fetch() a http://localhost:3001/api/leads?search=test&...

5. Backend recibe petición
   └─► leadRoutes → leadController.index()

6. LeadModel.findAll(filters) ejecuta SQL
   └─► SELECT * FROM leads WHERE ...

7. Backend responde con JSON
   └─► { success: true, data: [...], pagination: {...} }

8. useDashboardStore actualiza estado
   └─► leads, isLoading, pagination

9. DashboardPage re-renderiza con nuevos datos
   └─► Tabla, métricas, charts actualizados
```

---

## ⚙️ Configuración de Conexión

### Variables de Entorno (Backend)

```env
# Backend (.env)
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000          # ← Frontend URL
DATABASE_URL=postgresql://...              # ← PostgreSQL connection
```

### API Base URL (Frontend)

```typescript
// src/services/dashboardApi.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

---

## 🚀 Cómo Iniciar la Aplicación

### 1. Iniciar Backend

```bash
cd backend
npm install
npm run dev  # o: node src/server.js
```

El backend estará disponible en: `http://localhost:3001`

### 2. Iniciar Frontend

```bash
npm install
npm run dev  # Vite dev server
```

El frontend estará disponible en: `http://localhost:3000`

### 3. Verificar Conexión

```bash
# Health check del backend
curl http://localhost:3001/api/health

# Respuesta esperada:
# {"status":"ok","timestamp":"..."}
```

---

## 🔧 Solución de Problemas

### Error CORS

```
Access to fetch at 'http://localhost:3001/api/leads' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solución:** Verificar que `CORS_ORIGIN` en `backend/.env` coincida con la URL del frontend:

```
CORS_ORIGIN=http://localhost:3000
```

Luego reiniciar el backend.

### Error: relation "leads" does not exist

```
Error: relation "leads" does not exist
```

**Solución:** Ejecutar las migraciones de la base de datos:

```bash
cd backend
psql "postgresql://..." -f migrations/001_create_leads_tables.sql
psql "postgresql://..." -f migrations/002_insert_sample_data.sql
```

### Error: Network Error

```
TypeError: Network Error
```

**Solución:**
1. Verificar que el backend esté ejecutándose
2. Verificar la URL del API en `dashboardApi.ts`
3. Verificar el archivo `.env` del backend

---

## 📊 Pipeline de Procesamiento

El sistema implementa un pipeline de 5 pasos para cada lead:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   EXPORT     │ ─► │ VERIFICATION │ ─► │  COMPSCRAP   │ ─► │    BOX1      │ ─► │  INSTANTLY   │
│              │    │              │    │              │    │              │    │              │
│ • Import CSV │    │ • Validate   │    │ • Scrape     │    │ • FIT/HIT    │    │ • Email      │
│ • Raw data   │    │ • Email check│    │ • Comp URL   │    │ • DROP       │    │ • Response   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     pending ──►     pending ──►        pending ──►         pending ──►        pending
                     sent                 sent               sent              sent
                   verified             scraped              fit              replied
                   failed               failed              hit              positive_reply
                                                              drop             converted
                                                              no_fit           bounced
```

---

## 🛠️ Tecnologías Usadas

### Frontend
- **React 18** - UI framework
- **TypeScript** - Tipado estático
- **Zustand** - State management
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Iconos

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Base de datos
- **pg** - PostgreSQL client

### DevOps
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **concurrently** - Run multiple commands

---

## 📝 Notas

- El frontend usa `zustand` para estado global
- El backend usa `pg` para conexiones a PostgreSQL
- Las métricas se calculan en tiempo real desde la base de datos
- Los filtros se pasan como query params al backend
- La paginación es manejada tanto por frontend como backend
