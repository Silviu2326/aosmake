# Dashboard Backend Integration - Setup Instructions

## 🚀 Quick Start Guide

Esta guía te ayudará a configurar la integración completa entre el backend y el frontend del Dashboard en menos de 10 minutos.

---

## 📋 Requisitos Previos

- **Node.js** 18+ instalado
- **PostgreSQL** (Supabase configurado)
- **npm** o **yarn**
- Acceso a la base de datos de Supabase

---

## 🔧 Paso 1: Configurar la Base de Datos

### 1.1 Ejecutar Migración de Tablas

Conéctate a tu base de datos PostgreSQL de Supabase y ejecuta el script de migración:

```bash
# Opción 1: Usando psql
psql $DATABASE_URL < backend/migrations/001_create_leads_tables.sql

# Opción 2: Copiar y pegar en Supabase SQL Editor
# Abre: https://app.supabase.com/project/YOUR_PROJECT/editor
# Copia el contenido de backend/migrations/001_create_leads_tables.sql
# Pega y ejecuta
```

**Resultado esperado:**
```
NOTICE:  Migration completed successfully!
NOTICE:  Tables created: leads, lead_status_history, campaigns
NOTICE:  Indexes created: 8 indexes on leads, 3 indexes on lead_status_history
```

### 1.2 Insertar Datos de Prueba (Opcional)

Para probar el dashboard con datos de ejemplo:

```bash
psql $DATABASE_URL < backend/migrations/002_insert_sample_data.sql
```

**Resultado esperado:**
```
NOTICE:  Sample data inserted successfully!
NOTICE:  30 sample leads created with various statuses
```

---

## 🔧 Paso 2: Configurar el Backend

### 2.1 Instalar Dependencias

```bash
cd backend
npm install
```

### 2.2 Verificar Variables de Entorno

El archivo `backend/.env` ya está configurado con:

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
DATABASE_URL=your_database_url_here

# Dashboard Configuration
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE_MB=50
CSV_UPLOAD_PATH=./data/uploads
LEADS_PER_PAGE=25
```

✅ **No necesitas modificar nada aquí.**

### 2.3 Iniciar el Backend

```bash
npm run dev
```

**Salida esperada:**
```
Server is running on port 3001
Health check: http://localhost:3001/api/health
Environment: development
```

### 2.4 Verificar que el Backend está funcionando

Abre una nueva terminal y ejecuta:

```bash
# Test health check
curl http://localhost:3001/api/health

# Deberías ver:
# {"status":"ok","timestamp":"2026-01-31T..."}

# Test leads endpoint
curl http://localhost:3001/api/leads

# Deberías ver:
# {"success":true,"data":[...],"pagination":{...}}

# Test metrics endpoint
curl http://localhost:3001/api/leads/metrics

# Deberías ver:
# {"success":true,"data":{"totalExport":30,...}}
```

---

## 🔧 Paso 3: Configurar el Frontend

### 3.1 Instalar Dependencias (si no lo has hecho)

```bash
cd ..  # Volver al directorio raíz
npm install
```

### 3.2 Verificar Variables de Entorno

El archivo `.env.local` ya está configurado con:

```env
GEMINI_API_KEY=PLACEHOLDER_API_KEY

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

✅ **No necesitas modificar nada aquí.**

### 3.3 Iniciar el Frontend

```bash
npm run dev
```

**Salida esperada:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🎉 Paso 4: Probar la Integración

### 4.1 Abrir el Dashboard

1. Abre tu navegador en: **http://localhost:5173**
2. Navega a la página del Dashboard (debería estar en el menú)

### 4.2 Verificar que los Datos se Cargan

Deberías ver:

- **Tab "Resumen"**: Métricas calculadas desde el backend
  - Total Leads: 30
  - Verificados: ~8
  - Scraped: ~4
  - Converted: ~2

- **Tab "Tabla Master"**: Lista de todos los leads
  - 30 leads visibles
  - Paginación funcionando
  - Filtros activos

### 4.3 Probar Funcionalidades

**Test 1: Seleccionar y Enviar Leads**
1. Ve al tab "Input Verificación"
2. Selecciona 2-3 leads con estado "pending"
3. Haz clic en "Enviar a Verificación"
4. ✅ Deberías ver una notificación de éxito
5. Los leads cambian a estado "sent"

**Test 2: Filtros**
1. En "Tabla Master", usa la búsqueda
2. Busca "John"
3. ✅ Solo debería aparecer "John Doe"

**Test 3: Métricas en Tiempo Real**
1. Envía algunos leads al siguiente paso
2. Ve al tab "Resumen"
3. ✅ Las métricas se actualizan automáticamente

---

## 🛠️ Solución de Problemas

### Problema 1: Backend no se conecta a la base de datos

**Síntoma:**
```
Error: Connection terminated unexpectedly
```

**Solución:**
1. Verifica que el `DATABASE_URL` en `backend/.env` sea correcto
2. Verifica que tu IP esté en la whitelist de Supabase
3. Intenta conectarte manualmente:
   ```bash
   psql postgresql://postgres.ckwmnxbkdfybaurvploa:Millonarios123@aws-1-eu-central-2.pooler.supabase.com:6543/postgres
   ```

### Problema 2: Frontend no se conecta al backend

**Síntoma:**
```
Failed to fetch leads
CORS error
```

**Solución:**
1. Verifica que el backend esté corriendo en puerto 3001
2. Verifica que `VITE_API_BASE_URL` esté configurado en `.env.local`
3. Verifica que CORS esté habilitado en `backend/src/server.js`

### Problema 3: Las tablas no existen

**Síntoma:**
```
relation "leads" does not exist
```

**Solución:**
1. Ejecuta la migración de nuevo:
   ```bash
   psql $DATABASE_URL < backend/migrations/001_create_leads_tables.sql
   ```
2. Verifica que se crearon las tablas:
   ```sql
   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
   ```

### Problema 4: No hay datos en el dashboard

**Síntoma:**
- Dashboard vacío
- Métricas en 0

**Solución:**
1. Inserta los datos de prueba:
   ```bash
   psql $DATABASE_URL < backend/migrations/002_insert_sample_data.sql
   ```
2. O crea un lead manualmente vía API:
   ```bash
   curl -X POST http://localhost:3001/api/leads \
     -H "Content-Type: application/json" \
     -d '{
       "LeadNumber": "TEST-001",
       "firstName": "Test",
       "lastName": "User",
       "email": "test@example.com",
       "personTitle": "CEO",
       "companyName_fromP": "Test Company"
     }'
   ```

---

## 📊 Endpoints Disponibles

### Leads CRUD

```bash
# Listar todos los leads
GET http://localhost:3001/api/leads

# Obtener un lead específico
GET http://localhost:3001/api/leads/LEAD-001

# Crear un lead
POST http://localhost:3001/api/leads
Body: { "LeadNumber": "...", "firstName": "...", ... }

# Actualizar un lead
PATCH http://localhost:3001/api/leads/LEAD-001
Body: { "personTitle": "New Title" }

# Eliminar un lead
DELETE http://localhost:3001/api/leads/LEAD-001
```

### Pipeline Actions

```bash
# Enviar leads a verificación
POST http://localhost:3001/api/leads/send-to-verification
Body: { "leadNumbers": ["LEAD-001", "LEAD-002"] }

# Enviar leads a CompScrap
POST http://localhost:3001/api/leads/send-to-comp-scrap
Body: { "leadNumbers": ["LEAD-006", "LEAD-007"] }

# Enviar leads a Box1
POST http://localhost:3001/api/leads/send-to-box1
Body: { "leadNumbers": ["LEAD-011", "LEAD-012"] }

# Enviar leads a Instantly
POST http://localhost:3001/api/leads/send-to-instantly
Body: { "leadNumbers": ["LEAD-017", "LEAD-018"] }
```

### Métricas

```bash
# Obtener métricas generales
GET http://localhost:3001/api/leads/metrics

# Obtener métricas de una campaña específica
GET http://localhost:3001/api/leads/metrics?campaignId=default
```

### Filtros

```bash
# Filtrar por estado de verificación
GET http://localhost:3001/api/leads?verificationStatus=verified

# Filtrar por búsqueda
GET http://localhost:3001/api/leads?search=john

# Filtrar con compUrl
GET http://localhost:3001/api/leads?hasCompUrl=true

# Combinar filtros
GET http://localhost:3001/api/leads?verificationStatus=verified&compScrapStatus=scraped&page=1&limit=10
```

---

## 🎯 Siguiente Paso: Importar tus Datos Reales

### Opción 1: Importar desde CSV (Manual en PostgreSQL)

```sql
COPY leads (
  lead_number,
  target_id,
  first_name,
  last_name,
  email,
  person_title,
  company_name_from_p
  -- agregar más columnas según tu CSV
)
FROM '/path/to/your/file.csv'
DELIMITER ','
CSV HEADER;
```

### Opción 2: Usar el Import CSV (API - Por implementar en Fase 3)

```bash
curl -X POST http://localhost:3001/api/leads/import/csv \
  -F "file=@/path/to/your/leads.csv"
```

### Opción 3: Script de Node.js

Crea un script `import-leads.js`:

```javascript
const fs = require('fs');
const csv = require('csv-parser');
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/leads';

fs.createReadStream('your-leads.csv')
  .pipe(csv())
  .on('data', async (row) => {
    const lead = {
      LeadNumber: row['Lead Number'],
      firstName: row['First Name'],
      lastName: row['Last Name'],
      email: row['Email'],
      // mapear más campos...
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      console.log(`✓ Imported ${lead.LeadNumber}`);
    } catch (error) {
      console.error(`✗ Failed to import ${lead.LeadNumber}:`, error);
    }
  })
  .on('end', () => {
    console.log('CSV import completed');
  });
```

Ejecuta:
```bash
node import-leads.js
```

---

## 📝 Notas Finales

### Estructura de Archivos Creados/Modificados

**Backend:**
```
backend/
├── migrations/
│   ├── 001_create_leads_tables.sql          ✅ NUEVO
│   └── 002_insert_sample_data.sql           ✅ NUEVO
├── src/
│   ├── config/
│   │   └── constants.js                     ✅ NUEVO
│   ├── controllers/
│   │   └── leadController.js                ✅ NUEVO
│   ├── models/
│   │   └── LeadModel.js                     ✅ NUEVO
│   ├── routes/
│   │   └── leadRoutes.js                    ✅ NUEVO
│   └── server.js                            ✏️ MODIFICADO
└── .env                                     ✏️ MODIFICADO
```

**Frontend:**
```
src/
├── services/
│   └── dashboardApi.ts                      ✅ NUEVO
├── stores/
│   └── useDashboardStore.ts                 ✏️ MODIFICADO
└── pages/
    └── DashboardPage.tsx                    ✏️ MODIFICADO
.env.local                                   ✏️ MODIFICADO
```

**Documentación:**
```
DASHBOARD_BACKEND_INTEGRATION.md             ✅ NUEVO (Guía completa)
INTEGRATION_SETUP.md                         ✅ NUEVO (Esta guía)
```

### Recursos Adicionales

- **Documentación completa**: Ver `DASHBOARD_BACKEND_INTEGRATION.md`
- **API Reference**: Ver sección "6. API Endpoints Requeridos" en `DASHBOARD_BACKEND_INTEGRATION.md`
- **Modelo de Datos**: Ver sección "4. Modelo de Datos" en `DASHBOARD_BACKEND_INTEGRATION.md`

### Soporte

Si encuentras problemas:
1. Revisa los logs del backend
2. Revisa la consola del navegador (F12)
3. Verifica que ambos servicios estén corriendo
4. Consulta la documentación completa

---

## ✅ Checklist de Integración

- [ ] Base de datos migrada (tablas creadas)
- [ ] Datos de prueba insertados
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Health check exitoso (`/api/health`)
- [ ] Leads endpoint funcionando (`/api/leads`)
- [ ] Métricas endpoint funcionando (`/api/leads/metrics`)
- [ ] Dashboard carga correctamente
- [ ] Métricas se visualizan
- [ ] Tabla Master muestra leads
- [ ] Filtros funcionan
- [ ] Acciones de pipeline funcionan (enviar a verificación, etc.)
- [ ] Notificaciones se muestran correctamente

**Si todos están marcados, ¡la integración está completa! 🎉**

---

**Fecha**: 2026-01-31
**Versión**: 1.0.0
**Estado**: Implementación Completa
