"use client"

import { useEffect, useState } from "react"

type FetchOptions<TBody> = {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: TBody
  headers?: Record<string, string>
}

export function useApi<TResponse = any, TBody = any>(
  url: string | null,
  options?: FetchOptions<TBody>,
  deps: any[] = []
) {
  const [data, setData] = useState<TResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(!!url)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return

    let isCancelled = false
    setLoading(true)
    setError(null)

    async function run() {
      try {
        const res = await fetch(url as string, {
          method: options?.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          cache: "no-store",
        })
        const json = await res.json()
        if (!isCancelled) setData(json)
      } catch (e: any) {
        if (!isCancelled) setError(e?.message || "Request failed")
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    run()
    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
