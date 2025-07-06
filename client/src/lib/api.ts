// API Configuration for Flask Backend
export const API_BASE_URL = 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
  },
  
  // Users
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    USER_JOBS: `${API_BASE_URL}/users/jobs`,
    USER_APPLICATIONS: `${API_BASE_URL}/users/applications`,
  },
  
  // Jobs
  JOBS: {
    LIST: `${API_BASE_URL}/jobs`,
    CREATE: `${API_BASE_URL}/jobs`,
    DETAILS: (id: string) => `${API_BASE_URL}/jobs/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/jobs/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/jobs/${id}`,
  },
  
  // Applications
  APPLICATIONS: {
    CREATE: `${API_BASE_URL}/applications`,
    DETAILS: (id: string) => `${API_BASE_URL}/applications/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/applications/${id}`,
  },
  
  // Messages
  MESSAGES: {
    LIST: `${API_BASE_URL}/messages`,
    CREATE: `${API_BASE_URL}/messages`,
    CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    JOBS: `${API_BASE_URL}/admin/jobs`,
  },
  
  // Analytics
  ANALYTICS: {
    USER: `${API_BASE_URL}/analytics/user`,
    JOB: `${API_BASE_URL}/analytics/job`,
  },
};

// API request helper
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {};

  // Only set Content-Type if not sending FormData
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data
      ? isFormData
        ? (data as FormData)
        : JSON.stringify(data)
      : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response;
} 