'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions<T> {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseApiReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useApi<T>({
  url,
  method = 'GET',
  body,
  headers = {},
  enabled = true,
  onSuccess,
  onError
}: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !url) return

    setIsLoading(true)
    setError(null)

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      const result = responseData.data || responseData

      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError(error)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [url, method, body, headers, enabled, onSuccess, onError])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  useEffect(() => {
    if (enabled && url) {
      fetchData()
    }
  }, [enabled, url]) // Remove fetchData from dependencies to prevent infinite loop

  return {
    data,
    isLoading,
    error,
    refetch,
    mutate,
  }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T, R = any>({
  url,
  method = 'POST',
  onSuccess,
  onError,
}: {
  url: string
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  onSuccess?: (data: R) => void
  onError?: (error: Error) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (data?: T): Promise<R | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (data) {
        requestOptions.body = JSON.stringify(data)
      }

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      const result = responseData.data || responseData

      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError(error)
      onError?.(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [url, method, onSuccess, onError])

  return {
    mutate,
    isLoading,
    error,
  }
}
