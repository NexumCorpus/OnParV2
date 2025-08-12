'use client'

import { measureAsync } from './performance-monitor'

// Centralized API client with error handling, retries, and performance monitoring

interface ApiClientOptions {
  baseUrl?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

class ApiClient {
  private baseUrl: string
  private timeout: number
  private retries: number
  private retryDelay: number
  private defaultHeaders: Record<string, string>

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.timeout = options.timeout || 10000
    this.retries = options.retries || 3
    this.retryDelay = options.retryDelay || 1000
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const timeout = options.timeout || this.timeout
    const retries = options.retries ?? this.retries
    const retryDelay = options.retryDelay || this.retryDelay

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    }

    return measureAsync(
      async () => {
        let lastError: Error

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)

            const response = await fetch(url, {
              ...requestOptions,
              signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new ApiError(
                errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorData
              )
            }

            const contentType = response.headers.get('content-type')
            if (contentType?.includes('application/json')) {
              return await response.json()
            } else {
              return await response.text() as T
            }
          } catch (error) {
            lastError = error as Error

            // Don't retry on client errors (4xx) or abort errors
            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
              throw error
            }

            if (error.name === 'AbortError') {
              throw new ApiError('Request timeout', 408)
            }

            // Wait before retrying
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
            }
          }
        }

        throw lastError!
      },
      `api-${options.method || 'GET'}-${endpoint}`,
      { endpoint, method: options.method || 'GET' }
    )
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Upload file with progress tracking
  async upload<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
    options?: RequestOptions
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()
      formData.append('file', file)

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            resolve(xhr.responseText as T)
          }
        } else {
          reject(new ApiError(`Upload failed: ${xhr.statusText}`, xhr.status))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0))
      })

      xhr.addEventListener('timeout', () => {
        reject(new ApiError('Upload timeout', 408))
      })

      xhr.timeout = options?.timeout || this.timeout
      xhr.open('POST', `${this.baseUrl}${endpoint}`)

      // Add custom headers
      Object.entries({ ...this.defaultHeaders, ...options?.headers }).forEach(([key, value]) => {
        if (key !== 'Content-Type') { // Let browser set Content-Type for FormData
          xhr.setRequestHeader(key, value)
        }
      })

      xhr.send(formData)
    })
  }

  // Batch requests
  async batch<T>(requests: Array<{
    endpoint: string
    method?: string
    data?: any
    options?: RequestOptions
  }>): Promise<T[]> {
    const promises = requests.map(({ endpoint, method = 'GET', data, options }) => {
      switch (method.toUpperCase()) {
        case 'POST':
          return this.post<T>(endpoint, data, options)
        case 'PUT':
          return this.put<T>(endpoint, data, options)
        case 'PATCH':
          return this.patch<T>(endpoint, data, options)
        case 'DELETE':
          return this.delete<T>(endpoint, options)
        default:
          return this.get<T>(endpoint, options)
      }
    })

    return Promise.all(promises)
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Remove authentication token
  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
  }

  // Update default headers
  setHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers }
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isTimeout(): boolean {
    return this.status === 408
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  baseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
})

// Specialized API clients for different services
export const inventoryApi = {
  getAll: () => apiClient.get<{ data: any[] }>('/api/inventory'),
  getById: (id: string) => apiClient.get<{ data: any }>(`/api/inventory/${id}`),
  create: (data: any) => apiClient.post<{ data: any }>('/api/inventory', data),
  update: (id: string, data: any) => apiClient.put<{ data: any }>(`/api/inventory/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/inventory/${id}`),
  bulkUpdate: (updates: any[]) => apiClient.post<{ data: any[] }>('/api/inventory/bulk', { updates }),
  getLowStock: () => apiClient.get<{ data: any[] }>('/api/inventory/low-stock'),
  getExpiring: (days?: number) => apiClient.get<{ data: any[] }>(`/api/inventory/expiring${days ? `?days=${days}` : ''}`)
}

export const menuApi = {
  getAll: () => apiClient.get<{ data: any[] }>('/api/menu'),
  getById: (id: string) => apiClient.get<{ data: any }>(`/api/menu/${id}`),
  create: (data: any) => apiClient.post<{ data: any }>('/api/menu', data),
  update: (id: string, data: any) => apiClient.put<{ data: any }>(`/api/menu/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/menu/${id}`),
  getByCategory: (category: string) => apiClient.get<{ data: any[] }>(`/api/menu/category/${category}`)
}

export const recipeApi = {
  getAll: () => apiClient.get<{ data: any[] }>('/api/recipes'),
  getById: (id: string) => apiClient.get<{ data: any }>(`/api/recipes/${id}`),
  create: (data: any) => apiClient.post<{ data: any }>('/api/recipes', data),
  update: (id: string, data: any) => apiClient.put<{ data: any }>(`/api/recipes/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/recipes/${id}`),
  checkAvailability: (id: string, servings: number) => 
    apiClient.get<{ available: boolean; missing: string[] }>(`/api/recipes/${id}/availability?servings=${servings}`)
}

export const supplierApi = {
  getAll: () => apiClient.get<{ data: any[] }>('/api/suppliers'),
  getById: (id: string) => apiClient.get<{ data: any }>(`/api/suppliers/${id}`),
  create: (data: any) => apiClient.post<{ data: any }>('/api/suppliers', data),
  update: (id: string, data: any) => apiClient.put<{ data: any }>(`/api/suppliers/${id}`, data),
  delete: (id: string) => apiClient.delete<{ success: boolean }>(`/api/suppliers/${id}`),
  getReorderList: () => apiClient.get<{ data: any[] }>('/api/suppliers/reorder-list')
}

export const notificationApi = {
  getAll: () => apiClient.get<{ data: any[] }>('/api/notifications'),
  markAsRead: (id: string) => apiClient.post<{ success: boolean }>('/api/notifications/read', { id }),
  markAllAsRead: () => apiClient.post<{ success: boolean }>('/api/notifications/read-all'),
  dismiss: (id: string) => apiClient.post<{ success: boolean }>('/api/notifications/dismiss', { id })
}

export const reportApi = {
  generate: (config: any) => apiClient.post<{ data: any }>('/api/reports/generate', config),
  getHistory: () => apiClient.get<{ data: any[] }>('/api/reports/history'),
  download: (id: string, format: string) => apiClient.get<Blob>(`/api/reports/${id}/download?format=${format}`)
}

// Error handling utilities
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return 'Network error. Please check your connection.'
    }
    if (error.isTimeout) {
      return 'Request timed out. Please try again.'
    }
    if (error.isClientError) {
      return error.message || 'Invalid request.'
    }
    if (error.isServerError) {
      return 'Server error. Please try again later.'
    }
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred.'
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return !error.isClientError && error.status !== 408
  }
  return true
}