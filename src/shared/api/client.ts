import { API_CONFIG } from './config';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

// Obtener token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Configurar headers por defecto
const getHeaders = (customHeaders?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Cliente HTTP genérico
export const apiClient = {
  async request<T>(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: unknown;
      headers?: Record<string, string>;
    }
  ): Promise<T> {
    const method = options?.method || 'GET';
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(options?.headers),
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || `Error ${response.status}`,
          status: response.status,
          data: errorData,
        } as ApiError;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const responseText = await response.text();
      if (!responseText) {
        return undefined as T;
      }

      return JSON.parse(responseText) as T;
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error as ApiError;
      }
      throw {
        message: error instanceof Error ? error.message : 'Error desconocido',
        status: 0,
      } as ApiError;
    }
  },

  // Métodos específicos
  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  },

  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  },

  put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  },

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  },
};
