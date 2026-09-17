/**
 * Orbit Client API Service
 * Interacts with the Express + MongoDB backend (/api)
 */

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('orbit_jwt_token');
}

export function setToken(token: string) {
  localStorage.setItem('orbit_jwt_token', token);
}

export function removeToken() {
  localStorage.removeItem('orbit_jwt_token');
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'Network request failed';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (res.token) setToken(res.token);
    return res;
  },

  async login(email: string, password: string) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) setToken(res.token);
    return res;
  },

  async guestDemo() {
    const res = await request('/auth/demo', { method: 'POST' });
    if (res.token) setToken(res.token);
    return res;
  },

  async getMe() {
    return request('/auth/me');
  },

  logout() {
    removeToken();
  },

  // Profile & Goals
  async getProfile() {
    return request('/profile');
  },

  async updateProfile(name?: string, preferences?: any) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, preferences }),
    });
  },

  async addGoal(title: string, category: string, identityStatement?: string) {
    return request('/profile/goals', {
      method: 'POST',
      body: JSON.stringify({ title, category, identityStatement }),
    });
  },

  async updateGoal(id: string, updates: { title?: string; identityStatement?: string; vitality?: number }) {
    return request(`/profile/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // AI Personalization Proxy (Server-side only — never called directly to AI vendor from browser)
  async personalize(input: {
    goal: string;
    category?: string;
    desiredLifestyle?: string;
    currentMood?: string;
    preferredMood?: string;
    durationMinutes?: number;
    visualizationStyle?: string;
    affirmationStyle?: string;
  }) {
    return request('/ai/personalize', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async reframe(statement: string) {
    return request('/ai/reframe', {
      method: 'POST',
      body: JSON.stringify({ statement }),
    });
  },

  // Rituals
  async getTodayRitual() {
    return request('/rituals/today');
  },

  async submitMorningRitual(data: {
    goalId?: string;
    goalTitle?: string;
    affirmation: string;
    visualization: string;
    plannedAction: string;
  }) {
    return request('/rituals/morning', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitEveningRitual(data: {
    completedAction: string;
    reflection: string;
    gratitudeList: string[];
    tomorrowIntention?: string;
  }) {
    return request('/rituals/evening', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Aligned Actions
  async getActions() {
    return request('/actions');
  },

  async createAction(data: {
    goalId?: string;
    goalTitle?: string;
    category?: string;
    text: string;
    vitalityPoints?: number;
  }) {
    return request('/actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleAction(id: string, reflectionNote?: string) {
    return request(`/actions/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ reflectionNote }),
    });
  },

  async deleteAction(id: string) {
    return request(`/actions/${id}`, { method: 'DELETE' });
  },

  // Catalog
  async getSessions(params?: { category?: string; mode?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.mode) query.set('mode', params.mode);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return request(`/catalog/sessions${qs ? `?${qs}` : ''}`);
  },

  async getSessionById(id: string) {
    return request(`/catalog/sessions/${id}`);
  },

  async getVisuals(theme?: string) {
    return request(`/catalog/visuals${theme ? `?theme=${theme}` : ''}`);
  },

  async toggleFavorite(sessionId: string) {
    return request(`/catalog/favorites/${sessionId}/toggle`, { method: 'POST' });
  },
};
