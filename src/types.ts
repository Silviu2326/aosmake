export enum View {
  STUDIO = 'Two-Phase Studio',
  PRECRAFTER = 'PreCrafter',
  CRAFTER = 'Crafter',
  SPEC = 'Instructions Spec',
  RUNS = 'Runs',
  EXPERIMENTS = 'Experiments',
  ARTIFACTS = 'Artifacts',
  DATASETS = 'Datasets',
  LIBRARY = 'Library',
  SETTINGS = 'Settings',
  DASHBOARD = 'Dashboard'
}

export interface DashboardMetrics {
  // Total counts
  totalExport: number;
  
  // Verification metrics
  pendingVerification: number;
  sentVerification: number;
  verified: number;
  verifiedWithCompUrl: number;
  verificationRatio: number;
  verifiedWithCompUrlRatio: number;
  
  // CompScrap metrics
  pendingCompScrap: number;
  sentCompScrap: number;
  scraped: number;
  totalWithCompUrl: number;
  compUrlRatio: number;
  compScrapRatio: number;
  
  // Box1 metrics
  pendingBox1: number;
  sentBox1: number;
  dropCount: number;
  dropRatio: number;
  fitCount: number;
  fitRatio: number;
  hitCount: number;
  hitRatio: number;
  noHitFitCount: number;
  storageRatio: number;
  fitHitRatio: number;
  
  // Instantly metrics
  pendingInstantly: number;
  sentInstantly: number;
  repliedCount: number;
  replyRatio: number;
  positiveReplyCount: number;
  positiveReplyRatio: number;
  convertedCount: number;
  conversionRatio: number;
  
  // Estimates (pipeline projections)
  estimatedVerified: number;
  estimatedCompScrap: number;
  estimatedFitHit: number;
  estimatedPositiveReply: number;
  estimatedConversion: number;
}

export enum LeadStep {
  EXPORT = 'export',
  VERIFICATION = 'verification',
  COMPSCRAP = 'compScrap',
  BOX1 = 'box1',
  INSTANTLY = 'instantly'
}

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
  FIT = 'fit',
  DROP = 'drop',
  NO_FIT = 'no_fit',
  HIT = 'hit',
  FAILED = 'failed'
}

export enum InstantlyStatus {
  PENDING = 'pending',
  STOCK = 'stock',  // Leads HIT guardados para enviar después
  SENT = 'sent',
  REPLIED = 'replied',
  POSITIVE_REPLY = 'positive_reply',
  CONVERTED = 'converted',
  BOUNCED = 'bounced'
}

export interface Box1Output {
  promptVersion: string;
  userPrompt: string;
  output: string;
  status: 'hit' | 'fit' | 'drop' | 'no_fit';
}

export interface StepStatus {
  export: boolean;
  verification: VerificationStatus;
  compScrap: CompScrapStatus;
  box1: Box1Status;
  instantly: InstantlyStatus;
}

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
  
  // Datos de Empresa (Prospect - fromP)
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
  instantly_response?: string;
  instantly_conversion?: boolean;
  
  // Box1 Outputs (múltiples prompts)
  box1_outputs?: Box1Output[];
}

export enum NodeStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  WAITING = 'waiting' // Waiting for user selection
}

export interface NodeVariant {
  id: string;
  label: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  recency?: 'month' | 'week' | 'day' | 'hour';
  citations?: boolean;
  output?: any;
  status?: NodeStatus | 'idle' | 'running' | 'success' | 'error' | 'generated' | 'repaired' | 'validated' | 'failed'; // Allow string literals or enum
  schema?: string | object;
  outputMode?: 'structured' | 'free';
}

export interface NodeVersion {
  id: string;
  name: string;
  description?: string;
  timestamp: string;
  // Complete node configuration snapshot
  label: string;
  type: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  recency?: 'month' | 'week' | 'day' | 'hour';
  citations?: boolean;
  schema?: string | object;
  outputMode?: 'structured' | 'free';
  json?: string;
  csv?: string;
  csvMappings?: any[];
  filterCondition?: FilterCondition;
  apiKey?: string;
  statusFilter?: string;
  limit?: number;
  updateField?: string;
  customField?: string;
  markAsSent?: boolean;
  saveToSupabase?: boolean;
  supabaseTargetField?: string;
  customSupabaseField?: string;
}

export interface TestCase {
  id: string;
  name: string;
  inputContext: Record<string, string>;
  expectedContains?: string[];
  expectedNotContains?: string[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  lastResult?: string;
  lastDuration?: number;
  lastError?: string;
}

export interface FilterCondition {
  field: string;           // e.g., "nodeId.fieldName" or just "fieldName"
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string;
}

export interface NodeData {
  id: string;
  type: string;
  label: string;
  status: NodeStatus;
  tokens?: string;
  inputs: string[];
  outputs: string[];
  schema?: string | object; // Allow both string and object for flexibility
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
  outputData?: any;
  temperature?: number;
  recency?: 'month' | 'week' | 'day' | 'hour';
  citations?: boolean;
  x: number;
  y: number;
  // Variant Logic
  variants?: NodeVariant[];
  activeVariantId?: string; // The variant currently being edited
  selectedVariantId?: string; // The "winning" variant selected during execution
  outputMode?: 'structured' | 'free';
  // Version Management
  nodeVersions?: NodeVersion[];
  // Data nodes
  json?: string;
  csv?: string;
  csvMappings?: Array<{
    id: string;
    csvColumn: string;
    sourceNodeId: string;
    sourceField: string;
  }>;
  // Tests
  testCases?: TestCase[];
  // Filter
  filterCondition?: FilterCondition;
  // Lead Input/Output nodes
  statusFilter?: 'pending_verification' | 'pending_compscrap' | 'pending_box1' | 'pending_instantly' | 'all';
  limit?: number;
  updateField?: string;
  customField?: string;
  markAsSent?: boolean;
  updates?: Record<string, any>;
  // AnymailFinder
  apiKey?: string;
  // Supabase persistence for LLM/Perplexity nodes
  saveToSupabase?: boolean;
  supabaseTargetField?: string;
  customSupabaseField?: string;
  // Filter
  filterField?: string;
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
}

export interface LogEntry {
  id: string;
  nodeId: string;
  nodeLabel: string;
  timestamp: string;
  status: 'info' | 'running' | 'success' | 'error' | 'waiting';
  message: string;
  output?: string; // The Gemini response
  input?: string; // The input prompts used
  variants?: NodeVariant[]; // If waiting, provide variants to choose from
}

export interface ProjectState {
  name: string;
  preCrafterVersion: string;
  specVersion: string;
  crafterVersion: string;
}