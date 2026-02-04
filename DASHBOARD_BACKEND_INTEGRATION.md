# Dashboard Backend Integration Guide

## Guía Completa de Integración Backend ↔ Frontend Dashboard

**Fecha**: 2026-01-31
**Estado**: Plan de Implementación
**Prioridad**: Alta

---

## 📋 Índice

1. [Estado Actual](#estado-actual)
2. [Arquitectura Propuesta](#arquitectura-propuesta)
3. [Cambios Necesarios en el Backend](#cambios-necesarios-en-el-backend)
4. [Modelo de Datos](#modelo-de-datos)
5. [API Endpoints Requeridos](#api-endpoints-requeridos)
6. [Implementación del Backend](#implementación-del-backend)
7. [Integración del Frontend](#integración-del-frontend)
8. [Flujo de Datos](#flujo-de-datos)
9. [Plan de Migración](#plan-de-migración)
10. [Testing](#testing)

---

## 1. Estado Actual

### Backend Existente
- ✅ Express.js server en puerto 3001
- ✅ PostgreSQL configurado (Supabase)
- ✅ Tablas: `workflow_versions`, `workflow_runs`
- ✅ API para workflows: CRUD, versionado, ejecución
- ✅ Servicios LLM: Gemini + Perplexity
- ✅ Audit logging system

### Frontend Dashboard
- ✅ `DashboardPage.tsx` con UI completa
- ✅ `useDashboardStore` (Zustand) con estado local
- ✅ Componentes: Filters, Table, Charts, Pagination, BulkActions
- ✅ Tipos TypeScript definidos en `types.ts`
- ❌ **NO conectado a backend** (datos simulados/estáticos)

### Brecha de Integración
```
Frontend (React + Zustand)     Backend (Express + PostgreSQL)
        │                              │
        ├─ DashboardLead[]             ├─ workflow_versions
        ├─ DashboardMetrics            ├─ workflow_runs
        ├─ FilterState                 └─ ❌ NO HAY TABLA DE LEADS
        └─ BulkActions

                ❌ NO HAY CONEXIÓN
```

---

## 2. Arquitectura Propuesta

### Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│  DashboardPage.tsx                                          │
│    ↓                                                        │
│  useDashboardStore (Zustand)                                │
│    ├─ leads: DashboardLead[]                                │
│    ├─ metrics: DashboardMetrics                             │
│    ├─ selectedLeadNumbers: string[]                         │
│    └─ Actions: fetch, update, bulkSend, etc.                │
│                       ↓                                     │
│  API Service Layer (nuevo)                                  │
│    ├─ dashboardApi.ts                                       │
│    └─ HTTP calls con fetch/axios                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │ localhost:3001
┌────────────────────────┴────────────────────────────────────┐
│                     BACKEND (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  Routes: /api/leads/*                                       │
│    ↓                                                        │
│  Controllers: leadController.js                             │
│    ↓                                                        │
│  Models: LeadModel.js                                       │
│    ↓                                                        │
│  PostgreSQL Database                                        │
│    ├─ leads (tabla principal)                               │
│    ├─ lead_status_history (auditoría)                       │
│    └─ campaigns (opcional)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18, TypeScript, Zustand, TailwindCSS |
| **HTTP Client** | fetch API (nativo) o Axios |
| **Backend** | Node.js 18+, Express.js 4.18 |
| **Database** | PostgreSQL 15 (Supabase) |
| **ORM** | SQL directo con `pg` (node-postgres) |
| **Validation** | Zod o Joi (backend), TypeScript (frontend) |

---

## 3. Cambios Necesarios en el Backend

### 3.1 Nueva Estructura de Archivos

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                      (existente)
│   │   └── constants.js               (NUEVO - constantes de estados)
│   ├── controllers/
│   │   ├── workflowController.js      (existente)
│   │   └── leadController.js          (NUEVO)
│   ├── models/
│   │   ├── WorkflowModel.js           (existente)
│   │   └── LeadModel.js               (NUEVO)
│   ├── routes/
│   │   ├── workflowRoutes.js          (existente)
│   │   └── leadRoutes.js              (NUEVO)
│   ├── middleware/
│   │   ├── errorHandler.js            (NUEVO)
│   │   └── validation.js              (NUEVO)
│   ├── services/
│   │   ├── llmService.js              (existente)
│   │   ├── csvService.js              (NUEVO)
│   │   └── metricsService.js          (NUEVO)
│   └── server.js                      (modificar)
```

### 3.2 Variables de Entorno Adicionales

Agregar a `.env`:

```env
# Existing
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=...

# NEW for Dashboard
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE_MB=50
CSV_UPLOAD_PATH=./data/uploads
LEADS_PER_PAGE=25
```

---

## 4. Modelo de Datos

### 4.1 Tabla Principal: `leads`

```sql
CREATE TABLE leads (
  -- Primary Keys
  lead_number VARCHAR(50) PRIMARY KEY,
  target_id VARCHAR(100),

  -- Personal Information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  person_title VARCHAR(255),
  person_title_description TEXT,
  person_summary TEXT,
  person_location VARCHAR(255),
  duration_in_role VARCHAR(100),
  duration_in_company VARCHAR(100),
  person_timestamp TIMESTAMP,
  person_linkedin_url TEXT,
  person_sales_url TEXT,

  -- Company Information (from prospect)
  company_name_from_p VARCHAR(255),
  company_linkedin_url_from_p TEXT,
  company_sales_url_from_p TEXT,

  -- Email Data
  email VARCHAR(255) NOT NULL,
  email_validation VARCHAR(50),
  validation_success VARCHAR(50),
  first_name_cleaned VARCHAR(255),
  last_name_cleaned VARCHAR(255),

  -- Company Data (from scraping)
  company_name VARCHAR(255),
  company_description TEXT,
  industry VARCHAR(255),
  employee_count VARCHAR(50),
  company_location VARCHAR(255),
  website TEXT,
  year_founded VARCHAR(4),
  specialties TEXT,
  phone VARCHAR(50),
  min_revenue VARCHAR(50),
  max_revenue VARCHAR(50),
  growth_6mth VARCHAR(50),
  growth_1yr VARCHAR(50),
  growth_2yr VARCHAR(50),
  linkedin_company_url TEXT,
  comp_url TEXT,

  -- Pipeline Status (JSONB for flexibility)
  step_status JSONB NOT NULL DEFAULT '{
    "export": true,
    "verification": "pending",
    "compScrap": "pending",
    "box1": "pending",
    "instantly": "pending"
  }'::jsonb,

  -- Instantly Data
  instantly_body1 TEXT,
  instantly_body2 TEXT,
  instantly_body3 TEXT,
  instantly_body4 TEXT,
  instantly_response TEXT,
  instantly_conversion BOOLEAN DEFAULT false,

  -- Box1 Outputs (multiple variations)
  box1_outputs JSONB,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  campaign_id VARCHAR(100),

  -- Indexes for performance
  CONSTRAINT valid_verification_status CHECK (
    step_status->>'verification' IN ('pending', 'sent', 'verified', 'failed')
  ),
  CONSTRAINT valid_comp_scrap_status CHECK (
    step_status->>'compScrap' IN ('pending', 'sent', 'scraped', 'failed')
  ),
  CONSTRAINT valid_box1_status CHECK (
    step_status->>'box1' IN ('pending', 'sent', 'fit', 'drop', 'no_fit', 'hit', 'failed')
  ),
  CONSTRAINT valid_instantly_status CHECK (
    step_status->>'instantly' IN ('pending', 'sent', 'replied', 'positive_reply', 'converted', 'bounced')
  )
);

-- Indexes for common queries
CREATE INDEX idx_leads_verification_status ON leads ((step_status->>'verification'));
CREATE INDEX idx_leads_comp_scrap_status ON leads ((step_status->>'compScrap'));
CREATE INDEX idx_leads_box1_status ON leads ((step_status->>'box1'));
CREATE INDEX idx_leads_instantly_status ON leads ((step_status->>'instantly'));
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_campaign ON leads (campaign_id);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_comp_url ON leads (comp_url) WHERE comp_url IS NOT NULL;
```

### 4.2 Tabla de Auditoría: `lead_status_history`

```sql
CREATE TABLE lead_status_history (
  id SERIAL PRIMARY KEY,
  lead_number VARCHAR(50) REFERENCES leads(lead_number) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL,  -- 'verification', 'compScrap', 'box1', 'instantly'
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(100),     -- 'system', 'user', 'bulk_action'
  changed_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB                -- Additional context (e.g., error messages)
);

CREATE INDEX idx_history_lead_number ON lead_status_history (lead_number);
CREATE INDEX idx_history_step ON lead_status_history (step);
CREATE INDEX idx_history_changed_at ON lead_status_history (changed_at DESC);
```

### 4.3 Tabla de Campañas (Opcional)

```sql
CREATE TABLE campaigns (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',  -- 'active', 'paused', 'completed'
  metadata JSONB
);

-- Update leads table to use FK
ALTER TABLE leads
  ADD CONSTRAINT fk_campaign
  FOREIGN KEY (campaign_id)
  REFERENCES campaigns(id)
  ON DELETE SET NULL;
```

---

## 5. API Endpoints Requeridos

### 5.1 Endpoints de Leads

| Método | Ruta | Descripción | Params/Body |
|--------|------|-------------|-------------|
| **GET** | `/api/leads` | Listar leads con filtros | Query: `page`, `limit`, `search`, `verificationStatus`, `compScrapStatus`, `box1Status`, `instantlyStatus`, `hasCompUrl`, `campaignId`, `startDate`, `endDate` |
| **GET** | `/api/leads/:leadNumber` | Obtener un lead específico | Param: `leadNumber` |
| **POST** | `/api/leads` | Crear un lead manualmente | Body: `DashboardLead` (partial) |
| **PATCH** | `/api/leads/:leadNumber` | Actualizar un lead | Body: campos a actualizar |
| **DELETE** | `/api/leads/:leadNumber` | Eliminar un lead | Param: `leadNumber` |
| **POST** | `/api/leads/bulk-update` | Actualizar múltiples leads | Body: `{ leadNumbers: string[], updates: Object }` |

### 5.2 Endpoints de Pipeline

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| **POST** | `/api/leads/send-to-verification` | Enviar leads a verificación | `{ leadNumbers: string[] }` |
| **POST** | `/api/leads/send-to-comp-scrap` | Enviar leads a CompScrap | `{ leadNumbers: string[] }` |
| **POST** | `/api/leads/send-to-box1` | Enviar leads a Box1 | `{ leadNumbers: string[] }` |
| **POST** | `/api/leads/send-to-instantly` | Enviar leads a Instantly | `{ leadNumbers: string[] }` |
| **POST** | `/api/leads/mark-as-verified` | Marcar como verificados | `{ leadNumbers: string[], compUrl?: string }` |
| **POST** | `/api/leads/mark-as-scraped` | Marcar como scrapeados | `{ leadNumbers: string[], companyData: Object }` |
| **POST** | `/api/leads/mark-as-fit-drop` | Marcar FIT/DROP | `{ leadNumbers: string[], status: 'fit'|'drop'|'hit' }` |

### 5.3 Endpoints de Métricas

| Método | Ruta | Descripción | Query |
|--------|------|-------------|-------|
| **GET** | `/api/leads/metrics` | Obtener métricas del dashboard | `campaignId?` |
| **GET** | `/api/leads/metrics/history` | Métricas históricas | `startDate`, `endDate`, `interval` |

### 5.4 Endpoints de Importación/Exportación

| Método | Ruta | Descripción | Body/Response |
|--------|------|-------------|---------------|
| **POST** | `/api/leads/import/csv` | Importar CSV | Form-data: `file` (CSV) |
| **POST** | `/api/leads/export/csv` | Exportar a CSV | Body: `{ leadNumbers?: string[], filters?: Object }` |
| **GET** | `/api/leads/export/csv/:jobId` | Descargar CSV exportado | Stream de archivo |

---

## 6. Implementación del Backend

### 6.1 Constants (`backend/src/config/constants.js`)

```javascript
// backend/src/config/constants.js
module.exports = {
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    VERIFIED: 'verified',
    FAILED: 'failed'
  },

  COMP_SCRAP_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    SCRAPED: 'scraped',
    FAILED: 'failed'
  },

  BOX1_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    FIT: 'fit',
    DROP: 'drop',
    NO_FIT: 'no_fit',
    HIT: 'hit',
    FAILED: 'failed'
  },

  INSTANTLY_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    REPLIED: 'replied',
    POSITIVE_REPLY: 'positive_reply',
    CONVERTED: 'converted',
    BOUNCED: 'bounced'
  },

  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100
};
```

### 6.2 Lead Model (`backend/src/models/LeadModel.js`)

```javascript
// backend/src/models/LeadModel.js
const pool = require('../config/db');

class LeadModel {
  // Get all leads with filters and pagination
  static async findAll({
    page = 1,
    limit = 25,
    search = '',
    verificationStatus = null,
    compScrapStatus = null,
    box1Status = null,
    instantlyStatus = null,
    hasCompUrl = null,
    campaignId = null,
    startDate = null,
    endDate = null
  }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause dynamically
    if (search) {
      conditions.push(`(
        lead_number ILIKE $${paramIndex} OR
        first_name ILIKE $${paramIndex} OR
        last_name ILIKE $${paramIndex} OR
        company_name ILIKE $${paramIndex} OR
        company_name_from_p ILIKE $${paramIndex} OR
        email ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (verificationStatus) {
      conditions.push(`step_status->>'verification' = $${paramIndex}`);
      params.push(verificationStatus);
      paramIndex++;
    }

    if (compScrapStatus) {
      conditions.push(`step_status->>'compScrap' = $${paramIndex}`);
      params.push(compScrapStatus);
      paramIndex++;
    }

    if (box1Status) {
      conditions.push(`step_status->>'box1' = $${paramIndex}`);
      params.push(box1Status);
      paramIndex++;
    }

    if (instantlyStatus) {
      conditions.push(`step_status->>'instantly' = $${paramIndex}`);
      params.push(instantlyStatus);
      paramIndex++;
    }

    if (hasCompUrl !== null) {
      if (hasCompUrl) {
        conditions.push('comp_url IS NOT NULL');
      } else {
        conditions.push('comp_url IS NULL');
      }
    }

    if (campaignId) {
      conditions.push(`campaign_id = $${paramIndex}`);
      params.push(campaignId);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM leads ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated leads
    params.push(limit, offset);
    const dataQuery = `
      SELECT
        lead_number AS "LeadNumber",
        target_id AS "TargetID",
        first_name AS "firstName",
        last_name AS "lastName",
        person_title AS "personTitle",
        person_title_description AS "personTitleDescription",
        person_summary AS "personSummary",
        person_location AS "personLocation",
        duration_in_role AS "durationInRole",
        duration_in_company AS "durationInCompany",
        person_timestamp AS "personTimestamp",
        person_linkedin_url AS "personLinkedinUrl",
        person_sales_url AS "personSalesUrl",
        company_name_from_p AS "companyName_fromP",
        company_linkedin_url_from_p AS "companyLinkedinUrl_fromP",
        company_sales_url_from_p AS "companySalesUrl_fromP",
        email,
        email_validation AS "email_validation",
        validation_success AS "validation_success",
        first_name_cleaned AS "firstName_cleaned",
        last_name_cleaned AS "lastName_cleaned",
        company_name AS "companyName",
        company_description AS "companyDescription",
        industry,
        employee_count AS "employeeCount",
        company_location AS "companyLocation",
        website,
        year_founded AS "yearFounded",
        specialties,
        phone,
        min_revenue AS "minRevenue",
        max_revenue AS "maxRevenue",
        growth_6mth AS "growth6Mth",
        growth_1yr AS "growth1Yr",
        growth_2yr AS "growth2Yr",
        linkedin_company_url AS "linkedInCompanyUrl",
        comp_url AS "compUrl",
        step_status AS "stepStatus",
        instantly_body1 AS "instantly_body1",
        instantly_body2 AS "instantly_body2",
        instantly_body3 AS "instantly_body3",
        instantly_body4 AS "instantly_body4",
        instantly_response AS "instantly_response",
        instantly_conversion AS "instantly_conversion",
        box1_outputs AS "box1_outputs",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        campaign_id AS "campaignId"
      FROM leads
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await pool.query(dataQuery, params);

    return {
      leads: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Find one lead by lead number
  static async findByLeadNumber(leadNumber) {
    const query = `
      SELECT
        lead_number AS "LeadNumber",
        target_id AS "TargetID",
        first_name AS "firstName",
        last_name AS "lastName",
        person_title AS "personTitle",
        person_title_description AS "personTitleDescription",
        person_summary AS "personSummary",
        person_location AS "personLocation",
        duration_in_role AS "durationInRole",
        duration_in_company AS "durationInCompany",
        person_timestamp AS "personTimestamp",
        person_linkedin_url AS "personLinkedinUrl",
        person_sales_url AS "personSalesUrl",
        company_name_from_p AS "companyName_fromP",
        company_linkedin_url_from_p AS "companyLinkedinUrl_fromP",
        company_sales_url_from_p AS "companySalesUrl_fromP",
        email,
        email_validation AS "email_validation",
        validation_success AS "validation_success",
        first_name_cleaned AS "firstName_cleaned",
        last_name_cleaned AS "lastName_cleaned",
        company_name AS "companyName",
        company_description AS "companyDescription",
        industry,
        employee_count AS "employeeCount",
        company_location AS "companyLocation",
        website,
        year_founded AS "yearFounded",
        specialties,
        phone,
        min_revenue AS "minRevenue",
        max_revenue AS "maxRevenue",
        growth_6mth AS "growth6Mth",
        growth_1yr AS "growth1Yr",
        growth_2yr AS "growth2Yr",
        linkedin_company_url AS "linkedInCompanyUrl",
        comp_url AS "compUrl",
        step_status AS "stepStatus",
        instantly_body1 AS "instantly_body1",
        instantly_body2 AS "instantly_body2",
        instantly_body3 AS "instantly_body3",
        instantly_body4 AS "instantly_body4",
        instantly_response AS "instantly_response",
        instantly_conversion AS "instantly_conversion",
        box1_outputs AS "box1_outputs",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        campaign_id AS "campaignId"
      FROM leads
      WHERE lead_number = $1
    `;

    const result = await pool.query(query, [leadNumber]);
    return result.rows[0] || null;
  }

  // Create a new lead
  static async create(leadData) {
    const {
      LeadNumber,
      TargetID,
      firstName,
      lastName,
      personTitle,
      email,
      companyName_fromP,
      campaignId,
      stepStatus = {
        export: true,
        verification: 'pending',
        compScrap: 'pending',
        box1: 'pending',
        instantly: 'pending'
      },
      ...otherFields
    } = leadData;

    // Construct field names and values dynamically
    const fields = ['lead_number', 'target_id', 'first_name', 'last_name', 'person_title', 'email', 'company_name_from_p', 'step_status', 'campaign_id'];
    const values = [LeadNumber, TargetID, firstName, lastName, personTitle, email, companyName_fromP, JSON.stringify(stepStatus), campaignId];
    let paramIndex = values.length + 1;

    // Map additional fields from camelCase to snake_case
    const fieldMapping = {
      personTitleDescription: 'person_title_description',
      personSummary: 'person_summary',
      personLocation: 'person_location',
      durationInRole: 'duration_in_role',
      durationInCompany: 'duration_in_company',
      personTimestamp: 'person_timestamp',
      personLinkedinUrl: 'person_linkedin_url',
      personSalesUrl: 'person_sales_url',
      companyLinkedinUrl_fromP: 'company_linkedin_url_from_p',
      companySalesUrl_fromP: 'company_sales_url_from_p',
      email_validation: 'email_validation',
      validation_success: 'validation_success',
      firstName_cleaned: 'first_name_cleaned',
      lastName_cleaned: 'last_name_cleaned',
      companyName: 'company_name',
      companyDescription: 'company_description',
      employeeCount: 'employee_count',
      companyLocation: 'company_location',
      yearFounded: 'year_founded',
      minRevenue: 'min_revenue',
      maxRevenue: 'max_revenue',
      growth6Mth: 'growth_6mth',
      growth1Yr: 'growth_1yr',
      growth2Yr: 'growth_2yr',
      linkedInCompanyUrl: 'linkedin_company_url',
      compUrl: 'comp_url',
      instantly_body1: 'instantly_body1',
      instantly_body2: 'instantly_body2',
      instantly_body3: 'instantly_body3',
      instantly_body4: 'instantly_body4',
      instantly_response: 'instantly_response',
      instantly_conversion: 'instantly_conversion',
      box1_outputs: 'box1_outputs'
    };

    Object.keys(otherFields).forEach(key => {
      if (fieldMapping[key] && otherFields[key] !== undefined) {
        fields.push(fieldMapping[key]);
        values.push(otherFields[key]);
      }
    });

    const placeholders = values.map((_, i) => `$${i + 1}`);

    const query = `
      INSERT INTO leads (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update lead status
  static async updateStatus(leadNumber, step, newStatus, changedBy = 'system', metadata = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current status
      const currentLead = await client.query(
        'SELECT step_status FROM leads WHERE lead_number = $1',
        [leadNumber]
      );

      if (currentLead.rows.length === 0) {
        throw new Error(`Lead ${leadNumber} not found`);
      }

      const currentStepStatus = currentLead.rows[0].step_status;
      const oldStatus = currentStepStatus[step];

      // Update the lead
      const updateQuery = `
        UPDATE leads
        SET step_status = jsonb_set(step_status, '{${step}}', $1, true),
            updated_at = NOW()
        WHERE lead_number = $2
        RETURNING *
      `;

      await client.query(updateQuery, [JSON.stringify(newStatus), leadNumber]);

      // Log status change to history
      await client.query(
        `INSERT INTO lead_status_history (lead_number, step, old_status, new_status, changed_by, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [leadNumber, step, oldStatus, newStatus, changedBy, metadata ? JSON.stringify(metadata) : null]
      );

      await client.query('COMMIT');

      return { success: true, oldStatus, newStatus };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Bulk update leads
  static async bulkUpdateStatus(leadNumbers, step, newStatus, changedBy = 'bulk_action') {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update all leads
      const updateQuery = `
        UPDATE leads
        SET step_status = jsonb_set(step_status, '{${step}}', $1, true),
            updated_at = NOW()
        WHERE lead_number = ANY($2)
        RETURNING lead_number, step_status
      `;

      const result = await client.query(updateQuery, [JSON.stringify(newStatus), leadNumbers]);

      // Log each change to history
      for (const lead of result.rows) {
        await client.query(
          `INSERT INTO lead_status_history (lead_number, step, new_status, changed_by)
           VALUES ($1, $2, $3, $4)`,
          [lead.lead_number, step, newStatus, changedBy]
        );
      }

      await client.query('COMMIT');

      return { success: true, updatedCount: result.rows.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Calculate dashboard metrics
  static async calculateMetrics(campaignId = null) {
    const whereClause = campaignId ? `WHERE campaign_id = $1` : '';
    const params = campaignId ? [campaignId] : [];

    const query = `
      SELECT
        COUNT(*) AS total_export,

        -- Verification metrics
        COUNT(*) FILTER (WHERE step_status->>'verification' = 'pending' AND step_status->>'export' = 'true') AS pending_verification,
        COUNT(*) FILTER (WHERE step_status->>'verification' = 'sent') AS sent_verification,
        COUNT(*) FILTER (WHERE step_status->>'verification' = 'verified') AS verified,
        COUNT(*) FILTER (WHERE step_status->>'verification' = 'verified' AND comp_url IS NOT NULL) AS verified_with_comp_url,

        -- CompScrap metrics
        COUNT(*) FILTER (WHERE step_status->>'verification' = 'verified' AND step_status->>'compScrap' = 'pending') AS pending_comp_scrap,
        COUNT(*) FILTER (WHERE step_status->>'compScrap' = 'sent') AS sent_comp_scrap,
        COUNT(*) FILTER (WHERE step_status->>'compScrap' = 'scraped') AS scraped,
        COUNT(*) FILTER (WHERE comp_url IS NOT NULL) AS total_with_comp_url,

        -- Box1 metrics
        COUNT(*) FILTER (WHERE step_status->>'compScrap' = 'scraped' AND step_status->>'box1' = 'pending') AS pending_box1,
        COUNT(*) FILTER (WHERE step_status->>'box1' = 'sent') AS sent_box1,
        COUNT(*) FILTER (WHERE step_status->>'box1' = 'drop') AS drop_count,
        COUNT(*) FILTER (WHERE step_status->>'box1' = 'fit') AS fit_count,
        COUNT(*) FILTER (WHERE step_status->>'box1' = 'hit') AS hit_count,
        COUNT(*) FILTER (WHERE step_status->>'box1' = 'fit' AND step_status->>'instantly' = 'pending') AS no_hit_fit_count,

        -- Instantly metrics
        COUNT(*) FILTER (WHERE step_status->>'box1' = 'hit' AND step_status->>'instantly' = 'pending') AS pending_instantly,
        COUNT(*) FILTER (WHERE step_status->>'instantly' = 'sent') AS sent_instantly,
        COUNT(*) FILTER (WHERE step_status->>'instantly' = 'replied') AS replied_count,
        COUNT(*) FILTER (WHERE step_status->>'instantly' = 'positive_reply') AS positive_reply_count,
        COUNT(*) FILTER (WHERE step_status->>'instantly' = 'converted' OR instantly_conversion = true) AS converted_count

      FROM leads
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    const data = result.rows[0];

    // Calculate ratios
    const totalExport = parseInt(data.total_export);
    const verified = parseInt(data.verified);
    const sentCompScrap = parseInt(data.sent_comp_scrap);
    const sentBox1 = parseInt(data.sent_box1);
    const sentInstantly = parseInt(data.sent_instantly);
    const repliedCount = parseInt(data.replied_count);
    const positiveReplyCount = parseInt(data.positive_reply_count);

    const metrics = {
      totalExport,
      pendingVerification: parseInt(data.pending_verification),
      sentVerification: parseInt(data.sent_verification),
      verified,
      verificationRatio: totalExport > 0 ? verified / totalExport : 0,
      verifiedWithCompUrl: parseInt(data.verified_with_comp_url),
      verifiedWithCompUrlRatio: verified > 0 ? parseInt(data.verified_with_comp_url) / verified : 0,

      pendingCompScrap: parseInt(data.pending_comp_scrap),
      sentCompScrap,
      scraped: parseInt(data.scraped),
      compScrapRatio: sentCompScrap > 0 ? parseInt(data.scraped) / sentCompScrap : 0,
      totalWithCompUrl: parseInt(data.total_with_comp_url),
      compUrlRatio: totalExport > 0 ? parseInt(data.total_with_comp_url) / totalExport : 0,

      pendingBox1: parseInt(data.pending_box1),
      sentBox1,
      dropCount: parseInt(data.drop_count),
      fitCount: parseInt(data.fit_count),
      hitCount: parseInt(data.hit_count),
      noHitFitCount: parseInt(data.no_hit_fit_count),
      dropRatio: sentBox1 > 0 ? parseInt(data.drop_count) / sentBox1 : 0,
      fitRatio: sentBox1 > 0 ? parseInt(data.fit_count) / sentBox1 : 0,
      fitHitRatio: sentBox1 > 0 ? (parseInt(data.fit_count) + parseInt(data.hit_count)) / sentBox1 : 0,
      storageRatio: sentBox1 > 0 ? parseInt(data.no_hit_fit_count) / sentBox1 : 0,

      pendingInstantly: parseInt(data.pending_instantly),
      sentInstantly,
      repliedCount,
      positiveReplyCount,
      convertedCount: parseInt(data.converted_count),
      replyRatio: sentInstantly > 0 ? repliedCount / sentInstantly : 0,
      positiveReplyRatio: repliedCount > 0 ? positiveReplyCount / repliedCount : 0,
      conversionRatio: positiveReplyCount > 0 ? parseInt(data.converted_count) / positiveReplyCount : 0
    };

    // Calculate estimates
    metrics.estimatedVerified = totalExport * metrics.verificationRatio;
    metrics.estimatedCompScrap = metrics.estimatedVerified * metrics.compScrapRatio;
    metrics.estimatedFitHit = metrics.estimatedCompScrap * metrics.fitHitRatio;
    metrics.estimatedPositiveReply = metrics.estimatedFitHit * metrics.positiveReplyRatio;
    metrics.estimatedConversion = metrics.estimatedPositiveReply * metrics.conversionRatio;

    return metrics;
  }

  // Delete a lead
  static async delete(leadNumber) {
    const query = 'DELETE FROM leads WHERE lead_number = $1 RETURNING *';
    const result = await pool.query(query, [leadNumber]);
    return result.rows[0];
  }
}

module.exports = LeadModel;
```

### 6.3 Lead Controller (`backend/src/controllers/leadController.js`)

```javascript
// backend/src/controllers/leadController.js
const LeadModel = require('../models/LeadModel');
const { VERIFICATION_STATUS, COMP_SCRAP_STATUS, BOX1_STATUS, INSTANTLY_STATUS } = require('../config/constants');

class LeadController {
  // GET /api/leads - List leads with filters
  static async index(req, res, next) {
    try {
      const {
        page = 1,
        limit = 25,
        search = '',
        verificationStatus,
        compScrapStatus,
        box1Status,
        instantlyStatus,
        hasCompUrl,
        campaignId,
        startDate,
        endDate
      } = req.query;

      const result = await LeadModel.findAll({
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // Max 100 per page
        search,
        verificationStatus,
        compScrapStatus,
        box1Status,
        instantlyStatus,
        hasCompUrl: hasCompUrl === 'true' ? true : hasCompUrl === 'false' ? false : null,
        campaignId,
        startDate,
        endDate
      });

      res.json({
        success: true,
        data: result.leads,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/leads/:leadNumber - Get single lead
  static async show(req, res, next) {
    try {
      const { leadNumber } = req.params;
      const lead = await LeadModel.findByLeadNumber(leadNumber);

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/leads - Create new lead
  static async create(req, res, next) {
    try {
      const lead = await LeadModel.create(req.body);

      res.status(201).json({
        success: true,
        data: lead
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/leads/:leadNumber - Update lead
  static async update(req, res, next) {
    try {
      const { leadNumber } = req.params;
      const updates = req.body;

      // Implementation depends on requirements
      // For now, just update specific fields

      res.json({
        success: true,
        message: 'Lead updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/leads/:leadNumber - Delete lead
  static async destroy(req, res, next) {
    try {
      const { leadNumber } = req.params;
      const deleted = await LeadModel.delete(leadNumber);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Lead not found'
        });
      }

      res.json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/leads/send-to-verification
  static async sendToVerification(req, res, next) {
    try {
      const { leadNumbers } = req.body;

      const result = await LeadModel.bulkUpdateStatus(
        leadNumbers,
        'verification',
        VERIFICATION_STATUS.SENT,
        'user'
      );

      res.json({
        success: true,
        message: `${result.updatedCount} leads sent to verification`,
        updatedCount: result.updatedCount
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/leads/send-to-comp-scrap
  static async sendToCompScrap(req, res, next) {
    try {
      const { leadNumbers } = req.body;

      const result = await LeadModel.bulkUpdateStatus(
        leadNumbers,
        'compScrap',
        COMP_SCRAP_STATUS.SENT,
        'user'
      );

      res.json({
        success: true,
        message: `${result.updatedCount} leads sent to CompScrap`,
        updatedCount: result.updatedCount
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/leads/send-to-box1
  static async sendToBox1(req, res, next) {
    try {
      const { leadNumbers } = req.body;

      const result = await LeadModel.bulkUpdateStatus(
        leadNumbers,
        'box1',
        BOX1_STATUS.SENT,
        'user'
      );

      res.json({
        success: true,
        message: `${result.updatedCount} leads sent to Box1`,
        updatedCount: result.updatedCount
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/leads/send-to-instantly
  static async sendToInstantly(req, res, next) {
    try {
      const { leadNumbers } = req.body;

      const result = await LeadModel.bulkUpdateStatus(
        leadNumbers,
        'instantly',
        INSTANTLY_STATUS.SENT,
        'user'
      );

      res.json({
        success: true,
        message: `${result.updatedCount} leads sent to Instantly`,
        updatedCount: result.updatedCount
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/leads/metrics - Calculate metrics
  static async metrics(req, res, next) {
    try {
      const { campaignId } = req.query;
      const metrics = await LeadModel.calculateMetrics(campaignId);

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeadController;
```

### 6.4 Lead Routes (`backend/src/routes/leadRoutes.js`)

```javascript
// backend/src/routes/leadRoutes.js
const express = require('express');
const LeadController = require('../controllers/leadController');

const router = express.Router();

// CRUD endpoints
router.get('/leads', LeadController.index);
router.get('/leads/:leadNumber', LeadController.show);
router.post('/leads', LeadController.create);
router.patch('/leads/:leadNumber', LeadController.update);
router.delete('/leads/:leadNumber', LeadController.destroy);

// Pipeline actions
router.post('/leads/send-to-verification', LeadController.sendToVerification);
router.post('/leads/send-to-comp-scrap', LeadController.sendToCompScrap);
router.post('/leads/send-to-box1', LeadController.sendToBox1);
router.post('/leads/send-to-instantly', LeadController.sendToInstantly);

// Metrics
router.get('/leads/metrics', LeadController.metrics);

module.exports = router;
```

### 6.5 Actualizar `server.js`

```javascript
// backend/src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const workflowRoutes = require('./routes/workflowRoutes');
const leadRoutes = require('./routes/leadRoutes'); // NEW

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', workflowRoutes);
app.use('/api', leadRoutes); // NEW

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
```

---

## 7. Integración del Frontend

### 7.1 API Service (`src/services/dashboardApi.ts`)

```typescript
// src/services/dashboardApi.ts
import { DashboardLead, DashboardMetrics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  verificationStatus?: string;
  compScrapStatus?: string;
  box1Status?: string;
  instantlyStatus?: string;
  hasCompUrl?: boolean;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}

class DashboardApi {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Get leads with filters
  async getLeads(filters: LeadFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return this.request<DashboardLead[]>(`/leads?${params.toString()}`);
  }

  // Get single lead
  async getLead(leadNumber: string) {
    return this.request<DashboardLead>(`/leads/${leadNumber}`);
  }

  // Create lead
  async createLead(lead: Partial<DashboardLead>) {
    return this.request<DashboardLead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  }

  // Update lead
  async updateLead(leadNumber: string, updates: Partial<DashboardLead>) {
    return this.request<DashboardLead>(`/leads/${leadNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Delete lead
  async deleteLead(leadNumber: string) {
    return this.request<void>(`/leads/${leadNumber}`, {
      method: 'DELETE',
    });
  }

  // Send to verification
  async sendToVerification(leadNumbers: string[]) {
    return this.request<{ updatedCount: number }>('/leads/send-to-verification', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send to CompScrap
  async sendToCompScrap(leadNumbers: string[]) {
    return this.request<{ updatedCount: number }>('/leads/send-to-comp-scrap', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send to Box1
  async sendToBox1(leadNumbers: string[]) {
    return this.request<{ updatedCount: number }>('/leads/send-to-box1', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send to Instantly
  async sendToInstantly(leadNumbers: string[]) {
    return this.request<{ updatedCount: number }>('/leads/send-to-instantly', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Get metrics
  async getMetrics(campaignId?: string) {
    const params = campaignId ? `?campaignId=${campaignId}` : '';
    return this.request<DashboardMetrics>(`/leads/metrics${params}`);
  }
}

export const dashboardApi = new DashboardApi();
```

### 7.2 Actualizar `useDashboardStore.ts`

```typescript
// src/stores/useDashboardStore.ts
import { create } from 'zustand';
import { DashboardLead, DashboardMetrics } from '../types';
import { dashboardApi, LeadFilters } from '../services/dashboardApi';

interface DashboardStore {
  // State
  leads: DashboardLead[];
  metrics: DashboardMetrics;
  selectedLeadNumbers: string[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  fetchMetrics: (campaignId?: string) => Promise<void>;
  toggleLeadSelection: (leadNumber: string) => void;
  selectAllLeads: () => void;
  clearSelection: () => void;
  sendToVerification: () => Promise<void>;
  sendToCompScrap: () => Promise<void>;
  sendToBox1: () => Promise<void>;
  sendToInstantly: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const initialMetrics: DashboardMetrics = {
  totalExport: 0,
  pendingVerification: 0,
  sentVerification: 0,
  verified: 0,
  verificationRatio: 0,
  verifiedWithCompUrl: 0,
  verifiedWithCompUrlRatio: 0,
  pendingCompScrap: 0,
  sentCompScrap: 0,
  scraped: 0,
  compScrapRatio: 0,
  totalWithCompUrl: 0,
  compUrlRatio: 0,
  pendingBox1: 0,
  sentBox1: 0,
  dropCount: 0,
  fitCount: 0,
  hitCount: 0,
  noHitFitCount: 0,
  dropRatio: 0,
  fitRatio: 0,
  fitHitRatio: 0,
  storageRatio: 0,
  pendingInstantly: 0,
  sentInstantly: 0,
  repliedCount: 0,
  positiveReplyCount: 0,
  convertedCount: 0,
  replyRatio: 0,
  positiveReplyRatio: 0,
  conversionRatio: 0,
  estimatedVerified: 0,
  estimatedCompScrap: 0,
  estimatedFitHit: 0,
  estimatedPositiveReply: 0,
  estimatedConversion: 0,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  leads: [],
  metrics: initialMetrics,
  selectedLeadNumbers: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  },

  // Fetch leads with filters
  fetchLeads: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await dashboardApi.getLeads(filters);
      set({
        leads: response.data,
        pagination: response.pagination || get().pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch leads',
        isLoading: false,
      });
    }
  },

  // Fetch metrics
  fetchMetrics: async (campaignId) => {
    try {
      const response = await dashboardApi.getMetrics(campaignId);
      set({ metrics: response.data });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  },

  // Toggle lead selection
  toggleLeadSelection: (leadNumber) => {
    set((state) => ({
      selectedLeadNumbers: state.selectedLeadNumbers.includes(leadNumber)
        ? state.selectedLeadNumbers.filter((num) => num !== leadNumber)
        : [...state.selectedLeadNumbers, leadNumber],
    }));
  },

  // Select all leads
  selectAllLeads: () => {
    set((state) => ({
      selectedLeadNumbers: state.leads.map((lead) => lead.LeadNumber),
    }));
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedLeadNumbers: [] });
  },

  // Send to verification
  sendToVerification: async () => {
    const { selectedLeadNumbers } = get();
    try {
      await dashboardApi.sendToVerification(selectedLeadNumbers);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to verification:', error);
      throw error;
    }
  },

  // Send to CompScrap
  sendToCompScrap: async () => {
    const { selectedLeadNumbers } = get();
    try {
      await dashboardApi.sendToCompScrap(selectedLeadNumbers);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to CompScrap:', error);
      throw error;
    }
  },

  // Send to Box1
  sendToBox1: async () => {
    const { selectedLeadNumbers } = get();
    try {
      await dashboardApi.sendToBox1(selectedLeadNumbers);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to Box1:', error);
      throw error;
    }
  },

  // Send to Instantly
  sendToInstantly: async () => {
    const { selectedLeadNumbers } = get();
    try {
      await dashboardApi.sendToInstantly(selectedLeadNumbers);
      await get().refreshData();
      set({ selectedLeadNumbers: [] });
    } catch (error) {
      console.error('Failed to send to Instantly:', error);
      throw error;
    }
  },

  // Refresh data
  refreshData: async () => {
    await Promise.all([
      get().fetchLeads(),
      get().fetchMetrics(),
    ]);
  },
}));
```

### 7.3 Actualizar `DashboardPage.tsx`

```typescript
// src/pages/DashboardPage.tsx
import React, { useEffect } from 'react';
import { useDashboardStore } from '../stores/useDashboardStore';
// ... other imports

const DashboardContent: React.FC = () => {
  const {
    leads,
    metrics,
    selectedLeadNumbers,
    isLoading,
    error,
    fetchLeads,
    fetchMetrics,
    toggleLeadSelection,
    selectAllLeads,
    clearSelection
  } = useDashboardStore();

  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState<'overview' | 'master' | 'verification' | 'compScrap' | 'box1' | 'instantly' | 'analytics'>('overview');

  // ... other state

  // Fetch data on mount
  useEffect(() => {
    fetchLeads();
    fetchMetrics();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchLeads(filters);
  }, [filters]);

  // ... rest of component remains the same

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-background">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-background">
      {isLoading && (
        <div className="fixed top-4 right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg">
          Loading...
        </div>
      )}
      {/* ... rest of JSX */}
    </div>
  );
};
```

### 7.4 Variables de Entorno Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

---

## 8. Flujo de Datos

### Diagrama de Secuencia: Carga Inicial

```
User                DashboardPage       useDashboardStore      dashboardApi       Backend
 │                        │                     │                    │               │
 │ Opens dashboard        │                     │                    │               │
 ├───────────────────────>│                     │                    │               │
 │                        │ useEffect()         │                    │               │
 │                        ├────────────────────>│                    │               │
 │                        │                     │ fetchLeads()       │               │
 │                        │                     ├───────────────────>│               │
 │                        │                     │                    │ GET /api/leads│
 │                        │                     │                    ├──────────────>│
 │                        │                     │                    │               │
 │                        │                     │                    │   SQL Query   │
 │                        │                     │                    │<──────────────┤
 │                        │                     │   leads[]          │               │
 │                        │                     │<───────────────────┤               │
 │                        │   set(leads)        │                    │               │
 │                        │<────────────────────┤                    │               │
 │                        │                     │                    │               │
 │                        │                     │ fetchMetrics()     │               │
 │                        │                     ├───────────────────>│               │
 │                        │                     │                    │GET /api/leads/│
 │                        │                     │                    │    metrics    │
 │                        │                     │                    ├──────────────>│
 │                        │                     │                    │               │
 │                        │                     │                    │SQL Aggregation│
 │                        │                     │                    │<──────────────┤
 │                        │                     │   metrics          │               │
 │                        │                     │<───────────────────┤               │
 │                        │   set(metrics)      │                    │               │
 │                        │<────────────────────┤                    │               │
 │ Render dashboard       │                     │                    │               │
 │<───────────────────────┤                     │                    │               │
```

### Diagrama de Secuencia: Enviar a Verificación

```
User              DashboardPage    useDashboardStore    dashboardApi     Backend
 │                      │                  │                  │             │
 │ Selects 10 leads     │                  │                  │             │
 ├─────────────────────>│                  │                  │             │
 │                      │ toggleSelection()│                  │             │
 │                      ├─────────────────>│                  │             │
 │                      │                  │ set(selected)    │             │
 │                      │<─────────────────┤                  │             │
 │ Clicks "Send"        │                  │                  │             │
 ├─────────────────────>│                  │                  │             │
 │                      │sendToVerification│                  │             │
 │                      ├─────────────────>│                  │             │
 │                      │                  │sendToVerification│             │
 │                      │                  ├─────────────────>│             │
 │                      │                  │                  │POST /api/   │
 │                      │                  │                  │leads/send-  │
 │                      │                  │                  │to-verify    │
 │                      │                  │                  ├────────────>│
 │                      │                  │                  │             │
 │                      │                  │                  │BEGIN TXNBEGIN
 │                      │                  │                  │UPDATE leads │
 │                      │                  │                  │INSERT history│
 │                      │                  │                  │COMMIT       │
 │                      │                  │                  │<────────────┤
 │                      │                  │  { updatedCount} │             │
 │                      │                  │<─────────────────┤             │
 │                      │                  │                  │             │
 │                      │                  │ refreshData()    │             │
 │                      │                  ├─────────────────>│             │
 │                      │                  │                  │GET /api/... │
 │                      │                  │                  ├────────────>│
 │                      │                  │   fresh data     │             │
 │                      │                  │<─────────────────┤             │
 │                      │   re-render      │                  │             │
 │<─────────────────────┤                  │                  │             │
 │ Shows success msg    │                  │                  │             │
```

---

## 9. Plan de Migración

### Fase 1: Setup Backend (Día 1-2)

**Tareas:**
1. ✅ Crear esquema de base de datos
   ```bash
   # Ejecutar script SQL en Supabase
   psql $DATABASE_URL < backend/migrations/001_create_leads_tables.sql
   ```

2. ✅ Implementar modelos y controladores
   - Crear `LeadModel.js`
   - Crear `LeadController.js`
   - Crear `leadRoutes.js`

3. ✅ Actualizar `server.js`
   - Registrar rutas de leads
   - Configurar CORS

4. ✅ Testing manual con Postman/curl
   ```bash
   # Test health check
   curl http://localhost:3001/api/health

   # Test create lead
   curl -X POST http://localhost:3001/api/leads \
     -H "Content-Type: application/json" \
     -d '{"LeadNumber":"TEST001","firstName":"John","lastName":"Doe","email":"test@example.com"}'

   # Test get leads
   curl http://localhost:3001/api/leads

   # Test metrics
   curl http://localhost:3001/api/leads/metrics
   ```

### Fase 2: Frontend Integration (Día 3-4)

**Tareas:**
1. ✅ Crear `dashboardApi.ts`
2. ✅ Actualizar `useDashboardStore.ts`
3. ✅ Modificar `DashboardPage.tsx`
4. ✅ Agregar variables de entorno
5. ✅ Testing en desarrollo

### Fase 3: CSV Import/Export (Día 5-6)

**Tareas:**
1. Implementar `csvService.js`
   - Parseo de CSV
   - Validación de datos
   - Mapeo de columnas

2. Crear endpoints de importación
   ```javascript
   POST /api/leads/import/csv
   POST /api/leads/export/csv
   ```

3. Agregar componente de upload en UI

### Fase 4: Testing & Polish (Día 7)

**Tareas:**
1. Testing end-to-end
2. Performance optimization (indexing, caching)
3. Error handling improvements
4. Documentación de API (Swagger/OpenAPI)

---

## 10. Testing

### Backend Tests

```bash
# En backend/
npm install --save-dev jest supertest

# Crear backend/tests/leads.test.js
```

```javascript
// backend/tests/leads.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Leads API', () => {
  it('GET /api/leads should return leads', async () => {
    const response = await request(app).get('/api/leads');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('POST /api/leads should create a lead', async () => {
    const newLead = {
      LeadNumber: 'TEST123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    };

    const response = await request(app)
      .post('/api/leads')
      .send(newLead);

    expect(response.status).toBe(201);
    expect(response.body.data.LeadNumber).toBe('TEST123');
  });

  it('GET /api/leads/metrics should return metrics', async () => {
    const response = await request(app).get('/api/leads/metrics');
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('totalExport');
  });
});
```

### Frontend Tests

```typescript
// src/services/__tests__/dashboardApi.test.ts
import { dashboardApi } from '../dashboardApi';

describe('Dashboard API', () => {
  it('should fetch leads', async () => {
    const response = await dashboardApi.getLeads({ page: 1, limit: 10 });
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should send leads to verification', async () => {
    const response = await dashboardApi.sendToVerification(['LEAD001', 'LEAD002']);
    expect(response.success).toBe(true);
    expect(response.data.updatedCount).toBeGreaterThan(0);
  });
});
```

---

## 11. Comandos Útiles

### Desarrollo

```bash
# Backend
cd backend
npm install
npm run dev        # Nodemon con hot reload

# Frontend
cd ..
npm install
npm run dev        # Vite dev server

# Ambos simultáneamente (usando concurrently)
npm install -g concurrently
concurrently "cd backend && npm run dev" "npm run dev"
```

### Database

```bash
# Conectar a PostgreSQL
psql $DATABASE_URL

# Ver tablas
\dt

# Ver estructura de tabla
\d leads

# Contar leads
SELECT COUNT(*) FROM leads;

# Ver métricas en tiempo real
SELECT
  COUNT(*) FILTER (WHERE step_status->>'verification' = 'verified') as verified,
  COUNT(*) FILTER (WHERE step_status->>'compScrap' = 'scraped') as scraped
FROM leads;
```

### Debugging

```bash
# Backend logs
tail -f backend/logs/app.log

# Audit logs
tail -f backend/data/audit_logs/audit_$(date +%Y%m%d).json

# Database query profiling
EXPLAIN ANALYZE SELECT * FROM leads WHERE step_status->>'verification' = 'pending';
```

---

## 12. Próximos Pasos

### Funcionalidades Futuras

1. **Autenticación & Autorización**
   - JWT tokens
   - Roles de usuario (admin, viewer, operator)

2. **Real-time Updates**
   - WebSockets para actualizaciones en vivo
   - Notificaciones push

3. **Advanced Analytics**
   - Dashboards personalizables
   - Reportes exportables (PDF)

4. **Integrations**
   - Zapier/Make webhooks
   - API pública con rate limiting

5. **Automation**
   - Scheduled jobs para procesamiento automático
   - Email notifications para estado de pipeline

---

## Resumen

Este documento proporciona una guía completa para integrar el backend de AOS Studio con el Dashboard frontend. La implementación sigue las mejores prácticas de:

- ✅ Separación de responsabilidades (MVC)
- ✅ Type safety (TypeScript)
- ✅ Estado centralizado (Zustand)
- ✅ API RESTful con convenciones claras
- ✅ Transacciones de base de datos (ACID)
- ✅ Auditoría completa de cambios
- ✅ Paginación y filtrado eficiente
- ✅ Manejo robusto de errores

**Tiempo estimado de implementación**: 5-7 días
**Nivel de dificultad**: Intermedio
**Dependencias críticas**: PostgreSQL, Node.js 18+, React 18+

---

**Última actualización**: 2026-01-31
**Autor**: Claude Code Integration Assistant
