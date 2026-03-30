'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewJobRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/employer/dashboard')
  }, [router])
  return null
}
