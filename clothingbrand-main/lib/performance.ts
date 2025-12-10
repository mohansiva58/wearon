/**
 * Performance Monitoring Utilities
 * 
 * Track and log performance metrics for optimization
 */

// Track page load performance
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const connectTime = perfData.responseEnd - perfData.requestStart
    const renderTime = perfData.domComplete - perfData.domLoading
    const dnsTime = perfData.domainLookupEnd - perfData.domainLookupStart

    console.log('⚡ Performance Metrics:', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`,
      dnsTime: `${dnsTime}ms`,
    })

    // Log to analytics if needed
    if (pageLoadTime > 3000) {
      console.warn('⚠️ Slow page load detected:', pageLoadTime, 'ms')
    }
  })
}

// Measure API call performance
export function measureApiCall(url: string, startTime: number) {
  const duration = performance.now() - startTime
  console.log(`📡 API Call [${url}]:`, `${duration.toFixed(2)}ms`)
  
  if (duration > 1000) {
    console.warn(`⚠️ Slow API call [${url}]:`, `${duration.toFixed(2)}ms`)
  }
  
  return duration
}

// Measure component render time
export function measureRender(componentName: string, callback: () => void) {
  const startTime = performance.now()
  callback()
  const duration = performance.now() - startTime
  
  console.log(`🎨 Render [${componentName}]:`, `${duration.toFixed(2)}ms`)
  
  if (duration > 100) {
    console.warn(`⚠️ Slow render [${componentName}]:`, `${duration.toFixed(2)}ms`)
  }
  
  return duration
}

// Get Web Vitals
export function reportWebVitals(metric: any) {
  const { name, value, id } = metric
  
  console.log('📊 Web Vitals:', {
    name,
    value: Math.round(value),
    id,
  })

  // Thresholds (Google recommendations)
  const thresholds: Record<string, number> = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    TTFB: 800, // Time to First Byte
  }

  if (thresholds[name] && value > thresholds[name]) {
    console.warn(`⚠️ Poor ${name}:`, Math.round(value), `(threshold: ${thresholds[name]})`)
  }

  // Send to analytics endpoint if needed
  // sendToAnalytics({ name, value, id })
}

// Memory usage tracking
export function trackMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return

  const memory = (performance as any).memory
  
  console.log('💾 Memory Usage:', {
    used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
    total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
    limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
  })
}

// Image loading performance
export function trackImageLoad(src: string, startTime: number) {
  const duration = performance.now() - startTime
  console.log(`🖼️ Image Loaded [${src.substring(0, 50)}...]:`, `${duration.toFixed(2)}ms`)
  
  if (duration > 2000) {
    console.warn(`⚠️ Slow image load:`, src, `${duration.toFixed(2)}ms`)
  }
}

// Bundle size reporter
export function logBundleInfo() {
  if (typeof window === 'undefined') return

  const scripts = Array.from(document.querySelectorAll('script[src]'))
  let totalSize = 0

  console.log('📦 Loaded Scripts:')
  scripts.forEach((script) => {
    const src = (script as HTMLScriptElement).src
    console.log(`  - ${src}`)
  })
}

// Cache performance tracking
export function trackCachePerformance(cacheHit: boolean, key: string) {
  if (cacheHit) {
    console.log(`✅ Cache HIT: ${key}`)
  } else {
    console.log(`❌ Cache MISS: ${key}`)
  }
}
