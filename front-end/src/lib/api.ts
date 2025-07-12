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

  async updateProfileVisibility(isPublic: boolean) {
    return this.request('/me/visibility', {
      method: 'PUT',
      body: JSON.stringify({ is_public: isPublic }),
    });
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
  async getAllUsers() {
    return this.request('/admin/users');
  }

  async getAllSwaps() {
    return this.request('/admin/swaps');
  }

  async getAllSkills() {
    return this.request('/admin/skills');
  }

  async getAllRatings() {
    return this.request('/admin/ratings');
  }

  async banUser(userId: number) {
    return this.request(`/admin/ban/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 