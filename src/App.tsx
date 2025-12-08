import { Suspense, useEffect, useState } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageLoader } from './components/ui'
import { useAuthStore } from './stores/authStore'

export default function App() {
  const [isReady, setIsReady] = useState(false)
  
  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true)
    })
    
    // If already hydrated (happens on fast loads)
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true)
    }
    
    return () => unsubscribe()
  }, [])

  // Show loader until auth state is hydrated
  if (!isReady) {
    return <PageLoader />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {useRoutes(routes)}
      </Suspense>
    </ErrorBoundary>
  )
}
