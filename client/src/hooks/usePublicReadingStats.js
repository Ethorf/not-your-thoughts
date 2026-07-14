import { useEffect, useMemo, useState } from 'react'

import calculateWordCount from '@utils/calculateWordCount'

const stripHtml = (html) => {
  if (typeof html !== 'string') {
    return ''
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
}

const SCROLL_THRESHOLD_PX = 1

export const usePublicReadingStats = (content, scrollContainerRef, visible = true) => {
  const [readPercent, setReadPercent] = useState(0)
  const [requiresScroll, setRequiresScroll] = useState(false)

  const wordCount = useMemo(() => calculateWordCount(stripHtml(content)), [content])

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current
    if (!scrollContainer || !visible) {
      setReadPercent(0)
      setRequiresScroll(false)
      return undefined
    }

    const updateReadPercent = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const maxScroll = scrollHeight - clientHeight
      const needsScroll = maxScroll > SCROLL_THRESHOLD_PX

      setRequiresScroll((prev) => (prev === needsScroll ? prev : needsScroll))

      if (!needsScroll) {
        setReadPercent((prev) => (prev === 100 ? prev : 100))
        return
      }

      const nextPercent = Math.min(100, Math.round((scrollTop / maxScroll) * 100))
      setReadPercent((prev) => (prev === nextPercent ? prev : nextPercent))
    }

    let rafId = null
    const scheduleUpdate = () => {
      if (rafId != null) {
        return
      }
      rafId = requestAnimationFrame(() => {
        rafId = null
        updateReadPercent()
      })
    }

    updateReadPercent()

    scrollContainer.addEventListener('scroll', updateReadPercent, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(scrollContainer)

    return () => {
      scrollContainer.removeEventListener('scroll', updateReadPercent)
      window.removeEventListener('resize', scheduleUpdate)
      if (rafId != null) {
        cancelAnimationFrame(rafId)
      }
      resizeObserver.disconnect()
    }
  }, [scrollContainerRef, content, visible])

  const showReadProgress = visible && requiresScroll && readPercent < 100
  const isFullyRead = visible && (!requiresScroll || readPercent >= 100)

  return { wordCount, readPercent, requiresScroll, showReadProgress, isFullyRead }
}
