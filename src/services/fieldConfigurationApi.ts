/**
 * Field Configuration API Service
 * Handles communication with the normalized field_configurations table
 * Base URL: /api/field-configurations
 */

const API_URL = 'https://backendaos-production.up.railway.app/api';

export interface FieldConfiguration {
  id: number;
  user_id: string;
  field_id: string;
  field_label: string;
  field_type: 'text' | 'number' | 'json' | 'date' | 'boolean' | 'url';
  scope: 'dashboard' | 'table' | 'page' | 'all';
  category?: 'personal' | 'company' | 'email' | 'status' | 'other' | 'custom';
  is_visible: boolean;
  is_locked?: boolean;
  is_custom?: boolean;
  is_required?: boolean;
  display_order: number;
  source_field?: string;
  transform_type?: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'none';
  json_schema?: Record<string, any>;
  default_value?: string;
  validation_rules?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FieldConfigurationInput {
  field_id: string;
  field_label: string;
  field_type?: 'text' | 'number' | 'json' | 'date' | 'boolean' | 'url';
  category?: 'personal' | 'company' | 'email' | 'status' | 'other' | 'custom';
  is_visible?: boolean;
  is_locked?: boolean;
  is_custom?: boolean;
  is_required?: boolean;
  display_order?: number;
  source_field?: string;
  transform_type?: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'none';
  json_schema?: Record<string, any>;
  default_value?: string;
  validation_rules?: Record<string, any>;
}

export interface VisibilityUpdate {
  field_id: string;
  is_visible: boolean;
}

// Helper to convert old format to new format
export function convertToNewFormat(oldField: {
  id: string;
  label: string;
  visible: boolean;
  locked?: boolean;
  category?: string;
  custom?: boolean;
  sourceField?: string;
  transform?: string;
}): FieldConfigurationInput {
  return {
    field_id: oldField.id,
    field_label: oldField.label,
    is_visible: oldField.visible,
    is_locked: oldField.locked,
    category: oldField.category as any,
    is_custom: oldField.custom,
    source_field: oldField.sourceField,
    transform_type: oldField.transform,
    field_type: 'text'
  };
}

/**
 * Get field configurations by scope
 */
export const getFieldConfigurations = async (
  scope: 'dashboard' | 'table' | 'page'
): Promise<FieldConfiguration[]> => {
  const response = await fetch(`${API_URL}/field-configurations?scope=${scope}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to get field configurations');
  }
  
  return result.data || [];
};

/**
 * Get all field configurations for current user
 */
export const getAllFieldConfigurations = async (): Promise<FieldConfiguration[]> => {
  const response = await fetch(`${API_URL}/field-configurations`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to get field configurations');
  }
  
  return result.data || [];
};

/**
 * Get custom fields only
 */
export const getCustomFieldConfigurations = async (
  scope?: 'dashboard' | 'table' | 'page'
): Promise<FieldConfiguration[]> => {
  const url = scope 
    ? `${API_URL}/field-configurations/custom?scope=${scope}`
    : `${API_URL}/field-configurations/custom`;
  
  const response = await fetch(url);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to get custom fields');
  }
  
  return result.data || [];
};

/**
 * Save a single field configuration
 */
export const saveFieldConfiguration = async (
  scope: string,
  field: FieldConfigurationInput
): Promise<FieldConfiguration> => {
  const response = await fetch(`${API_URL}/field-configurations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...field, scope })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to save field configuration');
  }
  
  return result.data;
};

/**
 * Save multiple field configurations (bulk)
 */
export const saveBulkFieldConfigurations = async (
  scope: 'dashboard' | 'table' | 'page',
  fields: FieldConfigurationInput[]
): Promise<FieldConfiguration[]> => {
  const response = await fetch(`${API_URL}/field-configurations/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, fields })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to save field configurations');
  }
  
  return result.data;
};

/**
 * Update visibility for multiple fields
 */
export const updateFieldsVisibility = async (
  scope: 'dashboard' | 'table' | 'page',
  fields: VisibilityUpdate[]
): Promise<FieldConfiguration[]> => {
  const response = await fetch(`${API_URL}/field-configurations/visibility`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope, fields })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update visibility');
  }
  
  return result.data;
};

/**
 * Delete a field configuration
 */
export const deleteFieldConfiguration = async (
  fieldId: string,
  scope: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/field-configurations/${fieldId}?scope=${scope}`,
    { method: 'DELETE' }
  );
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete field configuration');
  }
};

/**
 * Migrate from old user_settings format to new field_configurations format
 */
export const migrateFromOldFormat = async (
  scope: 'dashboard' | 'table' | 'page',
  oldFormatFields: Array<{
    id: string;
    label: string;
    visible: boolean;
    locked?: boolean;
    category?: string;
    custom?: boolean;
  }>
): Promise<FieldConfiguration[]> => {
  const convertedFields = oldFormatFields.map(convertToNewFormat);
  return saveBulkFieldConfigurations(scope, convertedFields);
};
