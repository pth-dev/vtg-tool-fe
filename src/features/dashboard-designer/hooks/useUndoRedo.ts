import { useCallback, useState } from 'react'

export function useUndoRedo<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial])
  const [index, setIndex] = useState(0)

  const state = history[index]

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const current = prev[index]
        const next =
          typeof newState === 'function' ? (newState as (prev: T) => T)(current) : newState
        return [...prev.slice(0, index + 1), next].slice(-50) // Keep last 50 states
      })
      setIndex((i) => Math.min(i + 1, 49))
    },
    [index]
  )

  const undo = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const redo = useCallback(
    () => setIndex((i) => Math.min(history.length - 1, i + 1)),
    [history.length]
  )

  return { state, set, undo, redo, canUndo: index > 0, canRedo: index < history.length - 1 }
}
