/**
 * Generic API client for making HTTP requests to the backend.
 * Automatically injects the JWT token from localStorage.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers, ...restOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Inject JWT token if it exists
  const token = localStorage.getItem('medipredict_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null as any;
    }

    const responseData = await response.json();

    if (!response.ok) {
      // If 401, token might be expired. Let the AppContext handle logout, 
      // but we can throw an error here.
      throw new APIError(response.status, responseData.detail || 'An error occurred');
    }

    return responseData;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Network error or JSON parsing error
    console.error('API Request failed:', error);
    throw new Error('Failed to connect to the server. Please check your internet connection.');
  }
}
