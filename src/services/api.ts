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

function getLocalDemoUser(emailOverride?: string) {
  const email = emailOverride || 'traveler@orbit.cosmos';
  return {
    id: 'demo_user_traveler',
    name: 'Cosmic Traveler',
    email,
    goals: [
      {
        id: 'goal-1',
        title: 'Master Creative Leadership',
        category: 'career',
        identityStatement: 'I am already becoming the person who leads with calm confidence.',
        vitality: 65,
      },
      {
        id: 'goal-2',
        title: 'Financial Independence & Abundance',
        category: 'wealth',
        identityStatement: 'I live with financial security, mindful stewardship, and freedom.',
        vitality: 50,
      },
      {
        id: 'goal-3',
        title: 'Deep Daily Tranquility',
        category: 'peace',
        identityStatement: 'I am grounded in quiet clarity and unshakeable focus.',
        vitality: 80,
      },
    ],
    preferences: {
      preferredDuration: 15,
      visualizationStyle: 'first-person',
      affirmationStyle: 'declarative',
      preferredMood: 'clarity',
    },
    streak: {
      current: 1,
      longest: 3,
      lastRitualDate: new Date().toISOString().split('T')[0],
    },
    favorites: ['session-wealth-abundance', 'session-theta-clarity'],
    onboarded: true,
  };
}

function handleOfflineFallback(endpoint: string, options: RequestInit = {}): any {
  try {
    const rawBody = options.body ? JSON.parse(options.body as string) : {};

    if (endpoint === '/auth/demo') {
      const user = getLocalDemoUser();
      localStorage.setItem('orbit_offline_current_user', JSON.stringify(user));
      return { token: 'mock_jwt_token_demo_traveler', user };
    }

    if (endpoint === '/auth/login') {
      const email = (rawBody.email || '').toLowerCase().trim();
      if (email === 'traveler@orbit.com' || email === 'traveler@orbit.cosmos') {
        const user = getLocalDemoUser(email);
        localStorage.setItem('orbit_offline_current_user', JSON.stringify(user));
        return { token: 'mock_jwt_token_demo_traveler', user };
      }
      // Check stored offline registered users
      const rawUsers = localStorage.getItem('orbit_offline_users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      const found = users.find((u) => u.email.toLowerCase() === email);
      if (found) {
        localStorage.setItem('orbit_offline_current_user', JSON.stringify(found));
        return { token: 'mock_jwt_token_' + found.id, user: found };
      }
      throw new Error('Invalid email or password.');
    }

    if (endpoint === '/auth/register') {
      const email = (rawBody.email || '').toLowerCase().trim();
      const name = rawBody.name || 'Cosmic Explorer';
      const user = {
        ...getLocalDemoUser(email),
        id: 'user_' + Date.now(),
        name,
        email,
        onboarded: false,
      };
      const rawUsers = localStorage.getItem('orbit_offline_users');
      const users: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      users.push(user);
      localStorage.setItem('orbit_offline_users', JSON.stringify(users));
      localStorage.setItem('orbit_offline_current_user', JSON.stringify(user));
      return { token: 'mock_jwt_token_' + user.id, user };
    }

    if (endpoint === '/auth/me') {
      const raw = localStorage.getItem('orbit_offline_current_user');
      const user = raw ? JSON.parse(raw) : getLocalDemoUser();
      return { user };
    }

    if (endpoint === '/profile') {
      const raw = localStorage.getItem('orbit_offline_current_user');
      const user = raw ? JSON.parse(raw) : getLocalDemoUser();
      return { user };
    }

    if (endpoint === '/profile/goals' && options.method === 'POST') {
      const raw = localStorage.getItem('orbit_offline_current_user');
      const user = raw ? JSON.parse(raw) : getLocalDemoUser();
      const newGoal = {
        id: 'goal_' + Date.now(),
        title: rawBody.title || 'Personal Shift',
        category: rawBody.category || 'wealth',
        identityStatement: rawBody.identityStatement || '',
        vitality: 30,
      };
      user.goals = [...(user.goals || []), newGoal];
      localStorage.setItem('orbit_offline_current_user', JSON.stringify(user));
      return { success: true, goal: newGoal };
    }

    if (endpoint === '/rituals/today') {
      return {
        date: new Date().toISOString().split('T')[0],
        completed: false,
        morning: null,
        evening: null,
      };
    }

    if (endpoint === '/actions') {
      return { actions: [] };
    }

    if (endpoint === '/catalog/sessions') {
      return { sessions: [] };
    }

    return undefined;
  } catch (err: any) {
    if (err.message === 'Invalid email or password.') {
      throw err;
    }
    return undefined;
  }
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (_err) {
    // Network failure (offline, proxy down, or server offline) -> fallback
    const fallback = handleOfflineFallback(endpoint, options);
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error('Network request failed. Please check your connection.');
  }

  if (!response.ok) {
    // Handle proxy / gateway failures (502, 503, 504)
    if (response.status >= 502 && response.status <= 504) {
      const fallback = handleOfflineFallback(endpoint, options);
      if (fallback !== undefined) {
        return fallback;
      }
    }

    let errorMsg = 'Network request failed';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch {
      // Body not JSON (HTML error page from server or proxy)
      const fallback = handleOfflineFallback(endpoint, options);
      if (fallback !== undefined) {
        return fallback;
      }
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
    priority?: string;
    dueDate?: string;
    status?: string;
    vitalityPoints?: number;
  }) {
    return request('/actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAction(id: string, updates: {
    text?: string;
    goalTitle?: string;
    category?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    reflectionNote?: string;
    vitalityPoints?: number;
  }) {
    return request(`/actions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
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

  // Catalog & Content Providers (§3.2 & §3.3)
  async getProviders() {
    return request('/catalog/providers');
  },

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
    const query = theme ? `?theme=${encodeURIComponent(theme)}` : '';
    return request(`/catalog/visuals${query}`);
  },

  async ingestYouTubeTrack(params: {
    url: string;
    title: string;
    creator: string;
    category: string;
    duration?: number;
    description?: string;
    spokenAffirmations?: string[];
    thenAction?: string;
  }) {
    return request('/catalog/youtube-preview', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async uploadUserAudio(data: { sessionData: any; ownershipConfirmed: boolean }) {
    return request('/catalog/user-upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async toggleFavorite(sessionId: string) {
    return request(`/catalog/favorites/${sessionId}/toggle`, { method: 'POST' });
  },
};
