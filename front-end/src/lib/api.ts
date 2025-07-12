const API_BASE_URL = 'http://localhost:8001/api/v1';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || 'An error occurred',
          message: data.message,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    location?: string;
    photo_path?: string;
    availability?: string;
    is_public?: boolean;
  }) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/me');
  }

  async getUserStats() {
    return this.request('/me/stats');
  }

  async updateProfileVisibility(isPublic: boolean) {
    return this.request('/me/visibility', {
      method: 'PUT',
      body: JSON.stringify({ is_public: isPublic }),
    });
  }

  async updateAvailability(availability: string) {
    return this.request('/me/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  }

  async uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    const url = `${this.baseURL}/upload-photo`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: data.detail || 'An error occurred',
          message: data.message,
        };
      }
      
      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Skills endpoints
  async createSkill(skillData: {
    name: string;
    type: string;
    level: string;
  }) {
    return this.request('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async getMySkills() {
    return this.request('/skills');
  }

  // Public users endpoint for browse page
  async getPublicUsers() {
    return this.request('/public-users');
  }

  // Swaps endpoints
  async createSwap(swapData: {
    to_user_id: number;
    skill_offered_id: number;
    skill_requested_id: number;
  }) {
    return this.request('/swaps', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  }

  async getMySwaps() {
    return this.request('/swaps');
  }

  async acceptSwap(swapId: number) {
    return this.request(`/swaps/${swapId}/accept`, {
      method: 'PUT',
    });
  }

  async rejectSwap(swapId: number) {
    return this.request(`/swaps/${swapId}/reject`, {
      method: 'PUT',
    });
  }

  async completeSwap(swapId: number) {
    return this.request(`/swaps/${swapId}/complete`, {
      method: 'PUT',
    });
  }

  async rateSwap(swapId: number, ratingData: {
    to_user_id: number;
    stars: number;
    feedback?: string;
  }) {
    return this.request(`/swaps/${swapId}/rate`, {
      method: 'POST',
      body: JSON.stringify(ratingData),
    });
  }

  async getSwapRatings(swapId: number) {
    return this.request(`/swaps/${swapId}/ratings`);
  }

  async deleteSwap(swapId: number) {
    return this.request(`/swaps/${swapId}`, {
      method: 'DELETE',
    });
  }

  // Swap Coins endpoints
  async getUserCoins() {
    return this.request('/coins');
  }

  async addCoins(amount: number) {
    return this.request('/coins/add', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async deductCoins(amount: number) {
    return this.request('/coins/deduct', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async checkSwapBonus() {
    return this.request('/coins/check-swap-bonus', {
      method: 'POST',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAllUsers(params?: { skip?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    return this.request(endpoint);
  }

  async banUser(userId: number, reason: string) {
    return this.request('/admin/users/ban', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, reason }),
    });
  }

  async unbanUser(userId: number) {
    return this.request('/admin/users/unban', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getAllSkills(params?: { skip?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/skills?${queryString}` : '/admin/skills';
    return this.request(endpoint);
  }

  async rejectSkill(skillId: number, reason: string) {
    return this.request('/admin/skills/reject', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId, reason }),
    });
  }

  async approveSkill(skillId: number) {
    return this.request('/admin/skills/approve', {
      method: 'POST',
      body: JSON.stringify({ skill_id: skillId }),
    });
  }

  async getAllSwaps(params?: { skip?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/swaps?${queryString}` : '/admin/swaps';
    return this.request(endpoint);
  }

  async createPlatformMessage(messageData: {
    title: string;
    message: string;
    message_type?: string;
  }) {
    return this.request('/admin/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getPlatformMessages(params?: { skip?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/messages?${queryString}` : '/admin/messages';
    return this.request(endpoint);
  }

  async deletePlatformMessage(messageId: number) {
    return this.request(`/admin/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async generateReport(reportData: {
    report_type: string;
    start_date?: string;
    end_date?: string;
    format?: string;
  }) {
    return this.request('/admin/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 