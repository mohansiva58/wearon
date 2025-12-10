"use client"

import { useState, useEffect } from "react"
import { Database, Trash2, RefreshCw, CheckCircle, XCircle } from "lucide-react"

interface CacheStats {
  success: boolean
  redis: {
    connected: boolean
    url: string
    status: string
  }
  cache: {
    type: string
    size: number
    connected: boolean
    keys?: string[]
    info?: string
    memory?: string
  }
  timestamp: string
}

export default function CacheMonitor() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cache')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch cache stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cache?')) return

    setClearing(true)
    try {
      const res = await fetch('/api/cache', { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        alert('Cache cleared successfully!')
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
      alert('Failed to clear cache')
    } finally {
      setClearing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Redis Cache Monitor</h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={clearCache}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cache
          </button>
        </div>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              {stats.redis.connected ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Connection Status
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${stats.redis.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.redis.status}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Server</p>
                <p className="font-mono text-sm">{stats.redis.url}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Cache Type</p>
                <p className="font-semibold capitalize">{stats.cache.type}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Cached Keys</p>
                <p className="font-semibold text-2xl">{stats.cache.size}</p>
              </div>
            </div>
          </div>

          {/* Cache Keys (if using memory cache) */}
          {stats.cache.keys && stats.cache.keys.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Cached Keys</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {stats.cache.keys.map((key, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-50 px-3 py-2 rounded">
                    {key}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Redis Info */}
          {stats.cache.connected && stats.cache.info && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Redis Stats</h3>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-48">
                {stats.cache.info}
              </pre>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-sm text-gray-500 text-center">
            Last updated: {new Date(stats.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {!stats && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click Refresh to load cache statistics</p>
        </div>
      )}
    </div>
  )
}
