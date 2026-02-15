/**
 * Settings API Service
 * Handles communication with the backend for user settings persistence
 * Base URL: /api/settings
 */

const API_URL = 'https://backendaos-production.up.railway.app/api';

// Types matching the backend schema
export interface FieldConfig {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean;
  category?: 'personal' | 'company' | 'email' | 'status' | 'other';
  custom?: boolean;
  sourceField?: string;
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'none';
}

export interface DataTransformRule {
  id: string;
  sourceField: string;
  targetField: string;
  action: 'copy' | 'replace';
  transform?: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'none';
  enabled: boolean;
  description?: string;
}

export interface SettingsResponse<T> {
  success: boolean;
  type: string;
  user_id: string;
  data: T;
  updated_at: string | null;
}

// Simple FieldConfig for leads table/page (without dashboard-specific fields)
export interface SimpleFieldConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface StageAutomationConfig {
  stageId: string;
  stageName: string;
  worrisomeLeads: number;
  isAutomated: boolean;
  automationConfig?: Record<string, unknown>;
}

export interface AllSettingsResponse {
  success: boolean;
  user_id: string;
  settings: {
    field_config?: {
      data: FieldConfig[];
      updated_at: string;
    };
    transform_rules?: {
      data: DataTransformRule[];
      updated_at: string;
    };
    table_fields?: {
      data: SimpleFieldConfig[];
      updated_at: string;
    };
    page_fields?: {
      data: SimpleFieldConfig[];
      updated_at: string;
    };
    preferences?: {
      data: Record<string, unknown>;
      updated_at: string;
    };
    stage_automation?: {
      data: StageAutomationConfig[];
      updated_at: string;
    };
  };
}

/**
 * Get field configuration from server
 * Falls back to empty array if not found
 */
export const getFieldConfig = async (): Promise<FieldConfig[]> => {
  try {
    const response = await fetch(`${API_URL}/settings/field_config`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: SettingsResponse<FieldConfig[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get field config');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('[SettingsApi] Error getting field config:', error);
    throw error;
  }
};

/**
 * Save field configuration to server
 */
export const saveFieldConfig = async (fields: FieldConfig[]): Promise<SettingsResponse<FieldConfig[]>> => {
  try {
    const response = await fetch(`${API_URL}/settings/field_config`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: fields })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save field config');
    }
    
    return result;
  } catch (error) {
    console.error('[SettingsApi] Error saving field config:', error);
    throw error;
  }
};

/**
 * Get transform rules from server
 */
export const getTransformRules = async (): Promise<DataTransformRule[]> => {
  try {
    const response = await fetch(`${API_URL}/settings/transform_rules`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: SettingsResponse<DataTransformRule[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get transform rules');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('[SettingsApi] Error getting transform rules:', error);
    throw error;
  }
};

/**
 * Save transform rules to server
 */
export const saveTransformRules = async (rules: DataTransformRule[]): Promise<SettingsResponse<DataTransformRule[]>> => {
  try {
    const response = await fetch(`${API_URL}/settings/transform_rules`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: rules })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save transform rules');
    }
    
    return result;
  } catch (error) {
    console.error('[SettingsApi] Error saving transform rules:', error);
    throw error;
  }
};

/**
 * Get all settings at once
 */
export const getAllSettings = async (): Promise<AllSettingsResponse> => {
  try {
    const response = await fetch(`${API_URL}/settings`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: AllSettingsResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to get all settings');
    }
    
    return result;
  } catch (error) {
    console.error('[SettingsApi] Error getting all settings:', error);
    throw error;
  }
};

/**
 * Delete specific settings type
 */
export const deleteSettings = async (type: 'field_config' | 'transform_rules' | 'preferences'): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/settings/${type}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete settings');
    }
  } catch (error) {
    console.error('[SettingsApi] Error deleting settings:', error);
    throw error;
  }
};

/**
 * Get table fields configuration from server
 */
export const getTableFields = async (): Promise<SimpleFieldConfig[]> => {
  try {
    const response = await fetch(`${API_URL}/settings/table_fields`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: SettingsResponse<SimpleFieldConfig[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get table fields');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('[SettingsApi] Error getting table fields:', error);
    throw error;
  }
};

/**
 * Save table fields configuration to server
 */
export const saveTableFields = async (fields: SimpleFieldConfig[]): Promise<SettingsResponse<SimpleFieldConfig[]>> => {
  try {
    const response = await fetch(`${API_URL}/settings/table_fields`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: fields })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save table fields');
    }
    
    return result;
  } catch (error) {
    console.error('[SettingsApi] Error saving table fields:', error);
    throw error;
  }
};

/**
 * Get page fields configuration from server
 */
export const getPageFields = async (): Promise<SimpleFieldConfig[]> => {
  try {
    const response = await fetch(`${API_URL}/settings/page_fields`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: SettingsResponse<SimpleFieldConfig[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get page fields');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('[SettingsApi] Error getting page fields:', error);
    throw error;
  }
};

/**
 * Save page fields configuration to server
 */
export const savePageFields = async (fields: SimpleFieldConfig[]): Promise<SettingsResponse<SimpleFieldConfig[]>> => {
  try {
    const response = await fetch(`${API_URL}/settings/page_fields`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: fields })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save page fields');
    }
    
    return result;
  } catch (error) {
    console.error('[SettingsApi] Error saving page fields:', error);
    throw error;
  }
};

/**
 * Get stage automation configuration from server
 */
export const getStageAutomationConfig = async (): Promise<StageAutomationConfig[]> => {
  try {
    const response = await fetch(`${API_URL}/settings/stage_automation`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: SettingsResponse<StageAutomationConfig[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get stage automation config');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('[SettingsApi] Error getting stage automation config:', error);
    throw error;
  }
};

/**
 * Save stage automation configuration to server
 */
export const saveStageAutomationConfig = async (configs: StageAutomationConfig[]): Promise<SettingsResponse<StageAutomationConfig[]>> => {
  try {
    const response = await fetch(`${API_URL}/settings/stage_automation`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: configs })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save stage automation config');
    }
    
    return result;
  } catch (error) {
    console.error('[SettingsApi] Error saving stage automation config:', error);
    throw error;
  }
};
