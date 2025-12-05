import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageLoader } from './components/ui'

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {useRoutes(routes)}
      </Suspense>
    </ErrorBoundary>
  )
}
