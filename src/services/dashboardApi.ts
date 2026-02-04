import { DashboardLead, DashboardMetrics } from '../types';

const API_BASE_URL = 'https://backendaos-production.up.railway.app/api';

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
  message?: string;
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

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Get leads with filters
  async getLeads(filters: LeadFilters = {}): Promise<ApiResponse<DashboardLead[]>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return this.request<DashboardLead[]>(`/leads${queryString ? `?${queryString}` : ''}`);
  }

  // Get single lead
  async getLead(leadNumber: string): Promise<ApiResponse<DashboardLead>> {
    return this.request<DashboardLead>(`/leads/${leadNumber}`);
  }

  // Create lead
  async createLead(lead: Partial<DashboardLead>): Promise<ApiResponse<DashboardLead>> {
    return this.request<DashboardLead>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  }

  // Create multiple leads
  async createLeads(leads: Partial<DashboardLead>[]): Promise<ApiResponse<DashboardLead[]>> {
    const createPromises = leads.map(lead => this.createLead(lead));
    const results = await Promise.all(createPromises);

    return {
      success: true,
      data: results.map(r => r.data)
    };
  }

  // Update lead
  async updateLead(leadNumber: string, updates: Partial<DashboardLead>): Promise<ApiResponse<DashboardLead>> {
    return this.request<DashboardLead>(`/leads/${leadNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Delete lead
  async deleteLead(leadNumber: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/leads/${leadNumber}`, {
      method: 'DELETE',
    });
  }

  // Send to verification
  async sendToVerification(leadNumbers: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.request<{ updatedCount: number }>('/leads/send-to-verification', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send to CompScrap
  async sendToCompScrap(leadNumbers: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.request<{ updatedCount: number }>('/leads/send-to-compscrape', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Get verification input
  async getVerificationInput(limit?: number): Promise<ApiResponse<DashboardLead[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<DashboardLead[]>(`/leads/input/verification${params}`);
  }

  // Get compScrap input
  async getCompScrapInput(limit?: number): Promise<ApiResponse<DashboardLead[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<DashboardLead[]>(`/leads/input/compscrape${params}`);
  }

  // Get box1 input
  async getBox1Input(limit?: number): Promise<ApiResponse<DashboardLead[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<DashboardLead[]>(`/leads/input/box1${params}`);
  }

  // Get instantly input
  async getInstantlyInput(limit?: number): Promise<ApiResponse<DashboardLead[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<DashboardLead[]>(`/leads/input/instantly${params}`);
  }

  // Export leads by step
  async exportLeads(step?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (step) params.append('step', step);
    params.append('format', 'csv');
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${API_BASE_URL}/leads/export${queryString}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  // Import verification output
  async importVerificationOutput(file: File): Promise<ApiResponse<{ count: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/leads/import-verification`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Import failed');
    }
    
    return data;
  }

  // Import compScrap output
  async importCompScrapOutput(file: File): Promise<ApiResponse<{ count: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/leads/import-compscrape`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Import failed');
    }
    
    return data;
  }

  // Import box1 output
  async importBox1Output(file: File): Promise<ApiResponse<{ count: number }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/leads/import-box1`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Import failed');
    }
    
    return data;
  }

  // Send to Box1
  async sendToBox1(leadNumbers: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.request<{ updatedCount: number }>('/leads/send-to-box1', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send to Instantly
  async sendToInstantly(leadNumbers: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.request<{ updatedCount: number }>('/leads/send-to-instantly', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send to Instantly Stock (save for later)
  async sendToInstantlyStock(leadNumbers: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.request<{ updatedCount: number }>('/leads/send-to-instantly-stock', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Send from Stock to Instantly (send now)
  async sendFromStockToInstantly(leadNumbers: string[]): Promise<ApiResponse<{ updatedCount: number }>> {
    return this.request<{ updatedCount: number }>('/leads/send-from-stock-to-instantly', {
      method: 'POST',
      body: JSON.stringify({ leadNumbers }),
    });
  }

  // Get instantly stock input
  async getInstantlyStockInput(limit?: number): Promise<ApiResponse<DashboardLead[]>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<DashboardLead[]>(`/leads/input/instantly-stock${params}`);
  }

  // Get metrics
  async getMetrics(campaignId?: string): Promise<ApiResponse<DashboardMetrics>> {
    const params = campaignId ? `?campaignId=${campaignId}` : '';
    return this.request<DashboardMetrics>(`/leads/metrics${params}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

export const dashboardApi = new DashboardApi();
