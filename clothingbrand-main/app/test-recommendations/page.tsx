'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function TestRecommendations() {
  const { user } = useAuth()
  const [log, setLog] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testViewTracking = async () => {
    addLog(`Testing view tracking for user: ${user?.uid || 'GUEST'}`)
    
    try {
      const response = await fetch('/api/recommendations/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid || 'guest',
          productId: 'test-product-123'
        })
      })
      
      const data = await response.json()
      addLog(`View tracking response: ${JSON.stringify(data)}`)
    } catch (error) {
      addLog(`❌ View tracking error: ${error}`)
    }
  }

  const testGetRecommendations = async () => {
    addLog(`Fetching recommendations for user: ${user?.uid || 'guest'}`)
    
    try {
      const response = await fetch(`/api/recommendations?userId=${user?.uid || 'guest'}`)
      const data = await response.json()
      addLog(`✅ Got ${data.products?.length || 0} recommendations`)
      addLog(`Strategies: ${JSON.stringify(data.strategies || {})}`)
    } catch (error) {
      addLog(`❌ Recommendations error: ${error}`)
    }
  }

  const checkMicroservice = async () => {
    addLog('Checking if microservice is running...')
    
    try {
      const response = await fetch('http://localhost:4000/recommendations/health')
      const data = await response.json()
      addLog(`✅ Microservice is ${data.status}`)
    } catch (error) {
      addLog(`❌ Microservice is DOWN: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 Recommendation System Test</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current User:</h2>
        <p className="font-mono text-sm">
          {user ? `${user.email} (${user.uid})` : '❌ NOT LOGGED IN'}
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <button 
          onClick={checkMicroservice}
          className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          1️⃣ Check Microservice Health
        </button>
        
        <button 
          onClick={testViewTracking}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          2️⃣ Test View Tracking
        </button>
        
        <button 
          onClick={testGetRecommendations}
          className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
        >
          3️⃣ Get Recommendations
        </button>
        
        <button 
          onClick={() => setLog([])}
          className="w-full bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
        >
          Clear Log
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
        {log.length === 0 ? (
          <p className="text-gray-500">Click buttons above to run tests...</p>
        ) : (
          log.map((entry, i) => (
            <p key={i} className="mb-1">{entry}</p>
          ))
        )}
      </div>
    </div>
  )
}
