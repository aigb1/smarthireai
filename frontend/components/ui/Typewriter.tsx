'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
}

export function Typewriter({ text, speed = 15, delay = 0, className }: TypewriterProps) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let interval: ReturnType<typeof setInterval>
    let i = 0

    const start = () => {
      interval = setInterval(() => {
        setDisplayed(text.slice(0, i))
        i++
        if (i > text.length) clearInterval(interval)
      }, speed)
    }

    if (delay > 0) {
      timeout = setTimeout(start, delay)
    } else {
      start()
    }

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [text, speed, delay])

  return <span className={className}>{displayed}</span>
}
