import { useEffect, useRef, useState } from 'react'

export function useAutoSave<T>(data: T, saveFn: (data: T) => Promise<void>, delay = 5000) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const dataRef = useRef(data)

  useEffect(() => { dataRef.current = data }, [data])

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await saveFn(dataRef.current)
        setLastSaved(new Date())
      } catch (e) {
        console.error('Auto-save failed:', e)
      } finally {
        setIsSaving(false)
      }
    }, delay)

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [data, delay])

  return { isSaving, lastSaved }
}
