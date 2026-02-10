/**
 * Centralized API Configuration
 * Single source of truth for API endpoints
 */

// Get API URL from environment variable
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: `${API_URL}/api/auth/register`,
    LOGIN: `${API_URL}/api/auth/login`,
    ME: `${API_URL}/api/auth/me`,
    PROFILE: `${API_URL}/api/auth/profile`,
    STATS: `${API_URL}/api/auth/stats`,
  },
  
  // Contests (✅ Fixed)
  CONTESTS: {
    BASE: `${API_URL}/api/contests`,
    LIVE: `${API_URL}/api/contests/live`,
    STATS: `${API_URL}/api/contests/stats`,
    BY_ID: (id: string) => `${API_URL}/api/contests/${id}`,
    SUBSCRIBE: (id: string) => `${API_URL}/api/contests/${id}/subscribe`,
    UNSUBSCRIBE: (id: string) => `${API_URL}/api/contests/${id}/unsubscribe`,
    USER_SUBSCRIPTIONS: `${API_URL}/api/reminders/subscriptions`,
  },
  
  // Reminders
  REMINDERS: {
    BASE: `${API_URL}/api/reminders`,
    BY_ID: (id: string) => `${API_URL}/api/reminders/${id}`,
    PREFERENCES: `${API_URL}/api/reminders/preferences`,
  },
  
  // Battles
  BATTLES: {
    BASE: `${API_URL}/api/battles`,
    CREATE: `${API_URL}/api/battles/create`,
    BY_ID: (id: string) => `${API_URL}/api/battles/${id}`,
    JOIN: (id: string) => `${API_URL}/api/battles/${id}/join`,
  },
  
  // Problems
  PROBLEMS: {
    BASE: `${API_URL}/api/problems`,
    BY_ID: (id: string) => `${API_URL}/api/problems/${id}`,
    RANDOM: `${API_URL}/api/problems/random`,
  },
  
  // Leaderboard
  LEADERBOARD: {
    BASE: `${API_URL}/api/leaderboard`,
  },
  
  // Health
  HEALTH: `${API_URL}/health`,
  STATUS: `${API_URL}/api/status`,
};

// Feature flags from environment
export const FEATURES = {
  BATTLES: import.meta.env.VITE_ENABLE_BATTLES !== 'false',
  CONTESTS: import.meta.env.VITE_ENABLE_CONTESTS !== 'false',
  WHATSAPP: import.meta.env.VITE_ENABLE_WHATSAPP === 'true',
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default {
  API_URL,
  API_ENDPOINTS,
  FEATURES,
  getAuthHeaders,
};
