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
  SETTINGS = 'Settings'
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
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  recency?: 'month' | 'week' | 'day' | 'hour';
  citations?: boolean;
  output?: any;
  status?: 'idle' | 'running' | 'success' | 'error';
}

export interface NodeData {
  id: string;
  type: string;
  label: string;
  status: NodeStatus;
  tokens?: string;
  inputs: string[];
  outputs: string[];
  schema?: string;
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