'use client'

import { useEffect, useRef } from 'react'

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(0)
  const mountTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const totalTime = performance.now() - startTime.current
      console.log(`${componentName} total lifecycle: ${totalTime.toFixed(2)}ms`)
    }
  }, [componentName])

  useEffect(() => {
    mountTime.current = performance.now()
    const loadTime = mountTime.current - startTime.current
    
    console.log(`${componentName} mounted in ${loadTime.toFixed(2)}ms`)
    
    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_load_time', {
        component_name: componentName,
        load_time: Math.round(loadTime),
        custom_parameter: 'performance_monitoring'
      })
    }
  }, [componentName])

  return {
    startTime: startTime.current,
    mountTime: mountTime.current,
    getLoadTime: () => mountTime.current - startTime.current
  }
}



