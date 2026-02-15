/**
 * Stage Automation API Service
 * Handles communication with the backend for stage automation settings
 * Base URL: /api/stage-automation
 */

const API_URL = 'https://backendaos-production.up.railway.app/api';

// Types matching the backend schema
export interface StageAutomationSetting {
  id?: string;
  stage_id: string;
  stage_name: string;
  worrisome_leads: number;
  is_automated: boolean;
  automation_config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface StageAutomationResponse {
  success: boolean;
  data: StageAutomationSetting | StageAutomationSetting[];
  message?: string;
}

/**
 * Get all stage automation settings
 */
export const getAllStageAutomationSettings = async (): Promise<StageAutomationSetting[]> => {
  try {
    const response = await fetch(`${API_URL}/stage-automation`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: StageAutomationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to get stage automation settings');
    }
    
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error('[StageAutomationApi] Error getting settings:', error);
    throw error;
  }
};

/**
 * Get stage automation setting by stage_id
 */
export const getStageAutomationSetting = async (stageId: string): Promise<StageAutomationSetting | null> => {
  try {
    const response = await fetch(`${API_URL}/stage-automation/${stageId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: StageAutomationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to get stage automation setting');
    }
    
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    console.error('[StageAutomationApi] Error getting setting:', error);
    throw error;
  }
};

/**
 * Create or update stage automation setting
 */
export const upsertStageAutomationSetting = async (
  setting: Omit<StageAutomationSetting, 'id' | 'created_at' | 'updated_at'>
): Promise<StageAutomationSetting> => {
  try {
    const response = await fetch(`${API_URL}/stage-automation`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(setting)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: StageAutomationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to save stage automation setting');
    }
    
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    console.error('[StageAutomationApi] Error saving setting:', error);
    throw error;
  }
};

/**
 * Update specific stage automation setting by stage_id
 */
export const updateStageAutomationSetting = async (
  stageId: string,
  updates: Partial<Omit<StageAutomationSetting, 'id' | 'stage_id' | 'created_at' | 'updated_at'>>
): Promise<StageAutomationSetting> => {
  try {
    const response = await fetch(`${API_URL}/stage-automation/${stageId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: StageAutomationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to update stage automation setting');
    }
    
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    console.error('[StageAutomationApi] Error updating setting:', error);
    throw error;
  }
};

/**
 * Delete stage automation setting by stage_id
 */
export const deleteStageAutomationSetting = async (stageId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/stage-automation/${stageId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to delete stage automation setting');
    }
  } catch (error) {
    console.error('[StageAutomationApi] Error deleting setting:', error);
    throw error;
  }
};

/**
 * Batch save multiple stage automation settings
 */
export const batchUpsertStageAutomationSettings = async (
  settings: Omit<StageAutomationSetting, 'id' | 'created_at' | 'updated_at'>[]
): Promise<StageAutomationSetting[]> => {
  try {
    const response = await fetch(`${API_URL}/stage-automation/batch`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ settings })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result: StageAutomationResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to batch save stage automation settings');
    }
    
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    console.error('[StageAutomationApi] Error batch saving settings:', error);
    throw error;
  }
};
