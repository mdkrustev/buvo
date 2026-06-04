// src/shared/utils/apiFetch.ts

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export class BaseApi {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    if (!baseUrl) {
      // Във production може да искаш да хвърлиш грешка вместо warning
      console.warn('BaseApi: No base URL provided. Requests may fail.');
      this.baseUrl = '';
    } else {
      this.baseUrl = baseUrl;
    }
  }

  /**
   * Основен метод за изпълнение на HTTP заявки
   */
  protected async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include', // Критично за Cookie-based auth
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = 'Request failed';
        let errorData: any = null;

        try {
          errorData = await response.json();
          errorMessage = errorData.message || response.statusText;
        } catch {
          errorMessage = response.statusText || `Error ${response.status}`;
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          data: errorData,
        };

        throw error;
      }

      // Обработка на 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      // Ако е вече наша ApiError грешка, я връщаме
      if (error.status !== undefined) {
        throw error;
      }
      // Мрежова грешка или друг проблем
      throw {
        message: 'Network error or server unreachable',
        status: 0,
        data: null,
      } as ApiError;
    }
  }

  // --- Helper методи за чист синтаксис при наследяване ---

  protected get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  protected post<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, 'POST', body, headers);
  }

  protected put<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, 'PUT', body, headers);
  }

  protected patch<T>(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, 'PATCH', body, headers);
  }

  protected delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }
}