import { useEffect, useState } from 'react'

export const useMinDelay = (ready: boolean, ms = 500) => {
  const [delayed, setDelayed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setDelayed(true), ms)
    return () => clearTimeout(timer)
  }, [ms])
  return ready && delayed
}
