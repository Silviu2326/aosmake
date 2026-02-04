# Plan de Implementación del Dashboard

## Análisis del Estado Actual

### Archivos Revisados
- `dashboard.md` - Especificaciones de requisitos
- `src/pages/DashboardPage.tsx` - Implementación actual
- `src/stores/useDashboardStore.ts` - Store de datos
- `src/types.ts` - Tipos TypeScript

---

## Resumen de la Implementación Actual

La implementación actual (`DashboardPage.tsx`) ya incluye:
- ✅ UI completa con pestañas (overview, master, verification, compScrap, box1, instantly)
- ✅ Componentes de métricas por sección
- ✅ Tablas para cada tipo de input
- ✅ Datos de ejemplo (sample data)
- ✅ Selector de campañas

**LO QUE FALTA PARA HACERLO FUNCIONAL:**

---

## 1. Store (`src/stores/useDashboardStore.ts`)

### Estado Actual vs Requerido

```typescript
// LO QUE HAY - Simplificado
interface DashboardState {
  leads: DashboardLead[];
  metrics: DashboardMetrics;
  setLeads: (leads: DashboardLead[]) => void;
  // Faltan: métodos CRUD
}

// LO QUE SE REQUIERE
interface DashboardState {
  leads: DashboardLead[];
  metrics: DashboardMetrics;
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  addLead: (lead: DashboardLead) => void;
  updateLead: (LeadNumber: string, updates: Partial<DashboardLead>) => void;
  deleteLead: (LeadNumber: string) => void;
  
  // Step Operations
  sendToVerification: (LeadNumbers: string[]) => void;
  sendToCompScrap: (LeadNumbers: string[]) => void;
  sendToBox1: (LeadNumbers: string[]) => void;
  sendToInstantly: (LeadNumbers: string[]) => void;
  
  // Batch Operations
  batchUpdateStatus: (LeadNumbers: string[], step: StepType, status: string) => void;
  importLeads: (csvData: any[]) => void;
  exportLeads: () => void;
  
  // Metrics
  recalculateMetrics: () => void;
}
```

---

## 2. Tipos (`src/types.ts`)

### Añadir tipos de pasos y estados

```typescript
// Estados existentes (revisar y completar)
export enum VerificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VERIFIED = 'verified',
  FAILED = 'failed'
}

export enum CompScrapStatus {
  PENDING = 'pending',
  SENT = 'sent',
  SCRAPED = 'scraped',
  FAILED = 'failed'
}

export enum Box1Status {
  PENDING = 'pending',
  SENT = 'sent',
  HIT = 'hit',
  FIT = 'fit',
  NO_HIT = 'no_hit',
  DROP = 'drop',
  FAILED = 'failed'
}

export enum InstantlyStatus {
  PENDING = 'pending',
  SENT = 'sent',
  REPLIED = 'replied',
  POSITIVE_REPLY = 'positive_reply',
  CONVERTED = 'converted',
  BOUNCED = 'bounced'
}

// Step Status completo
export interface StepStatus {
  export: boolean;
  verification: VerificationStatus;
  compScrap: CompScrapStatus;
  box1: Box1Status;
  instantly: InstantlyStatus;
}

// Dashboard Lead - COMPLETO según spec
export interface DashboardLead {
  // Identificadores
  LeadNumber: string;
  TargetID: string;
  
  // Datos Personales
  firstName: string;
  lastName: string;
  personTitle: string;
  personTitleDescription: string;
  personSummary: string;
  personLocation: string;
  durationInRole: string;
  durationInCompany: string;
  personTimestamp: string;
  personLinkedinUrl: string;
  personSalesUrl: string;
  
  // Datos de Empresa (Prospect)
  companyName_fromP: string;
  companyLinkedinUrl_fromP: string;
  companySalesUrl_fromP: string;
  
  // Datos de Email
  email: string;
  email_validation: string;
  validation_succes: string;
  firstName_cleaned: string;
  lastName_cleaned: string;
  
  // Datos de Empresa (Scraped)
  companyName?: string;
  companyDescription?: string;
  companyTagLine?: string;
  industry?: string;
  employeeCount?: string;
  companyLocation?: string;
  website?: string;
  domain?: string;
  yearFounded?: string;
  specialties?: string;
  phone?: string;
  minRevenue?: string;
  maxRevenue?: string;
  growth6Mth?: string;
  growth1Yr?: string;
  growth2Yr?: string;
  companyTimestampSN?: string;
  companyTimestampLN?: string;
  linkedInCompanyUrl?: string;
  salesNavigatorCompanyUrl?: string;
  
  // CompScrap URL
  compUrl?: string;
  
  // Step Status
  stepStatus: StepStatus;
  
  // Instantly Data
  instantly_body1?: string;
  instantly_body2?: string;
  instantly_body3?: string;
  instantly_body4?: string;
  
  // Box1 Output (por cada prompt)
  box1_outputs?: Box1Output[];
}

export interface Box1Output {
  promptVersion: string;
  userPrompt: string;
  output: string;
  status: 'hit' | 'fit' | 'drop';
}
```

---

## 3. Componente de Metrics (`DashboardPage.tsx`)

### Añadir cálculos de métricas completos

```typescript
// En useDashboardStore - calcular métricas
const calculateMetrics = (leads: DashboardLead[]): DashboardMetrics => {
  const totalExport = leads.filter(l => l.stepStatus.export).length;
  
  // Verification
  const pendingVerification = leads.filter(l => 
    l.stepStatus.export && l.stepStatus.verification === 'pending'
  ).length;
  const sentVerification = leads.filter(l => 
    l.stepStatus.verification === 'sent'
  ).length;
  const verified = leads.filter(l => 
    l.stepStatus.verification === 'verified'
  ).length;
  const verifiedWithCompUrl = leads.filter(l => 
    l.stepStatus.verification === 'verified' && l.compUrl
  ).length;
  
  // CompScrap
  const pendingCompScrap = leads.filter(l => 
    l.stepStatus.verification === 'verified' && l.stepStatus.compScrap === 'pending'
  ).length;
  const sentCompScrap = leads.filter(l => 
    l.stepStatus.compScrap === 'sent'
  ).length;
  const scraped = leads.filter(l => 
    l.stepStatus.compScrap === 'scraped'
  ).length;
  const totalWithCompUrl = leads.filter(l => l.compUrl).length;
  
  // Box1
  const pendingBox1 = leads.filter(l => 
    l.stepStatus.compScrap === 'scraped' && l.stepStatus.box1 === 'pending'
  ).length;
  const sentBox1 = leads.filter(l => l.stepStatus.box1 === 'sent').length;
  const dropCount = leads.filter(l => l.stepStatus.box1 === 'drop').length;
  const fitCount = leads.filter(l => l.stepStatus.box1 === 'fit').length;
  const hitCount = leads.filter(l => l.stepStatus.box1 === 'hit').length;
  const noHitFitCount = leads.filter(l => 
    l.stepStatus.box1 === 'fit' && !l.box1_outputs?.some(o => o.status === 'hit')
  ).length;
  
  // Instantly
  const pendingInstantly = leads.filter(l => 
    l.stepStatus.box1 === 'hit' && l.stepStatus.instantly === 'pending'
  ).length;
  const sentInstantly = leads.filter(l => l.stepStatus.instantly === 'sent').length;
  const repliedCount = leads.filter(l => 
    ['replied', 'positive_reply', 'converted'].includes(l.stepStatus.instantly)
  ).length;
  const positiveReplyCount = leads.filter(l => 
    ['positive_reply', 'converted'].includes(l.stepStatus.instantly)
  ).length;
  const convertedCount = leads.filter(l => 
    l.stepStatus.instantly === 'converted'
  ).length;
  
  // Ratios
  const verificationRatio = totalExport > 0 ? verified / totalExport : 0;
  const verifiedWithCompUrlRatio = verified > 0 ? verifiedWithCompUrl / verified : 0;
  const compUrlRatio = totalExport > 0 ? totalWithCompUrl / totalExport : 0;
  const compScrapRatio = sentCompScrap > 0 ? scraped / sentCompScrap : 0;
  const dropRatio = sentBox1 > 0 ? dropCount / sentBox1 : 0;
  const fitRatio = sentBox1 > 0 ? fitCount / sentBox1 : 0;
  const hitRatio = sentBox1 > 0 ? hitCount / sentBox1 : 0;
  const fitHitRatio = (fitCount + hitCount) / sentBox1 || 0;
  const storageRatio = sentBox1 > 0 ? noHitFitCount / sentBox1 : 0;
  const replyRatio = sentInstantly > 0 ? repliedCount / sentInstantly : 0;
  const positiveReplyRatio = repliedCount > 0 ? positiveReplyCount / repliedCount : 0;
  const conversionRatio = positiveReplyCount > 0 ? convertedCount / positiveReplyCount : 0;
  
  // Estimates
  const estimatedVerified = totalExport * verificationRatio;
  const estimatedCompScrap = estimatedVerified * compScrapRatio;
  const estimatedFitHit = estimatedCompScrap * fitHitRatio;
  const estimatedPositiveReply = estimatedFitHit * positiveReplyRatio;
  const estimatedConversion = estimatedPositiveReply * conversionRatio;
  
  return {
    totalExport,
    pendingVerification,
    sentVerification,
    verified,
    verifiedWithCompUrl,
    verifiedWithCompUrlRatio,
    pendingCompScrap,
    sentCompScrap,
    scraped,
    totalWithCompUrl,
    compUrlRatio,
    compScrapRatio,
    pendingBox1,
    sentBox1,
    dropCount,
    dropRatio,
    fitCount,
    fitRatio,
    hitCount,
    hitRatio,
    noHitFitCount,
    storageRatio,
    fitHitRatio,
    pendingInstantly,
    sentInstantly,
    repliedCount,
    replyRatio,
    positiveReplyCount,
    positiveReplyRatio,
    convertedCount,
    conversionRatio,
    estimatedVerified,
    estimatedCompScrap,
    estimatedFitHit,
    estimatedPositiveReply,
    estimatedConversion
  };
};
```

---

## 4. Integración con Backend

### API Endpoints necesarios

```javascript
// backend/src/routes/dashboardRoutes.js

GETapi/d /ashboard/leads          // Obtener todos los leads
GET /api/dashboard/leads/:id      // Obtener un lead específico
POST /api/dashboard/leads         // Crear lead individual
PUT /api/dashboard/leads/:id      // Actualizar lead
DELETE /api/dashboard/leads/:id   // Eliminar lead

POST /api/dashboard/leads/batch   // Batch operations
POST /api/dashboard/leads/import  // Importar desde CSV

GET /api/dashboard/metrics        // Obtener métricas
POST /api/dashboard/metrics/recalc // Recalcular métricas

// Step transitions
POST /api/dashboard/steps/verification/send
POST /api/dashboard/steps/compScrap/send
POST /api/dashboard/steps/box1/send
POST /api/dashboard/steps/instantly/send

GET /api/dashboard/export         // Exportar a CSV
```

---

## 5. Funcionalidades a Implementar

### Prioridad Alta (Core)
- [ ] Conectar `DashboardPage.tsx` con `useDashboardStore` real
- [ ] Implementar método `recalculateMetrics()` en el store
- [ ] Añadir datos de verdad (no sample data)
- [ ] Conectar con backend API

### Prioridad Media (UI)
- [ ] Mejorar filtrado en las tablas
- [ ] Añadir búsqueda por LeadNumber/companyName
- [ ] Implementar paginación
- [ ] Añadir acciones de bulk (seleccionar múltiples)

### Prioridad Baja (Features)
- [ ] Exportar a CSV/Excel
- [ ] Filtros avanzados por estado
- [ ] Gráficos de evolución temporal
- [ ] Notificaciones de progreso

---

## 6. Estructura de Datos para Almacenamiento

```typescript
// Formato de almacenamiento recomendado (JSON)
interface CampaignData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  totalLeads: number;
  leads: DashboardLead[];
  metrics: DashboardMetrics;
  metadata: {
    source: string;
    importDate: string;
    notes: string;
  };
}
```

---

## 7. Próximos Pasos Inmediatos

### Paso 1: Actualizar `src/types.ts`
Añadir los tipos completos de DashboardLead y estados.

### Paso 2: Actualizar `src/stores/useDashboardStore.ts`
- Añadir estado de loading/error
- Implementar métodos CRUD
- Implementar cálculo de métricas
- Añadir integración con API (opcional)

### Paso 3: Actualizar `src/pages/DashboardPage.tsx`
- Quitar sample data
- Conectar con store real
- Añadir handlers para acciones de usuario

### Paso 4: Testing
- Verificar que las métricas se calculan correctamente
- Verificar filtros de leads por estado
- Probar navegación entre pestañas

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/types.ts` | Añadir tipos DashboardLead, StepStatus, estados |
| `src/stores/useDashboardStore.ts` | Implementar store completo con métricas |
| `src/pages/DashboardPage.tsx` | Conectar con store real, quitar sample data |
| `backend/src/routes/dashboardRoutes.js` | Crear API endpoints (opcional) |

---

## Notas

1. **Sample Data**: El sample data actual genera leads con estados aleatorios para demo. En producción, esto vendrá del backend o CSV import.

2. **Filtros en Tablas**: Cada tabla ya tiene filtros básicos (`.filter()`), pero podrían mejorarse con filtros de UI más sofisticados.

3. **Persistencia**: Para datos persistentes, usar localStorage inicialmente o conectar con backend.

4. **Rendimiento**: Con muchos leads (1000+), considerar virtualización de tablas o paginación.

---

## Estado de Completion

- [x] Revisar archivos existentes
- [x] Analizar requisitos de dashboard.md
- [x] Identificar gaps en implementación actual
- [x] Crear plan de implementación

**Próximo paso**: Comenzar implementación siguiendo este plan.
