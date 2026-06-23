import { useEffect, useMemo, useState } from 'react'

import calculateWordCount from '@utils/calculateWordCount'

const stripHtml = (html) => {
  if (typeof html !== 'string') {
    return ''
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
}

export const usePublicReadingStats = (content, scrollContainerRef, visible = true) => {
  const [readPercent, setReadPercent] = useState(0)

  const wordCount = useMemo(() => calculateWordCount(stripHtml(content)), [content])

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current
    if (!scrollContainer || !visible) {
      setReadPercent(0)
      return undefined
    }

    const updateReadPercent = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const maxScroll = scrollHeight - clientHeight

      if (maxScroll <= 0) {
        setReadPercent(100)
        return
      }

      setReadPercent(Math.min(100, Math.round((scrollTop / maxScroll) * 100)))
    }

    updateReadPercent()

    scrollContainer.addEventListener('scroll', updateReadPercent, { passive: true })
    window.addEventListener('resize', updateReadPercent)

    const resizeObserver = new ResizeObserver(updateReadPercent)
    resizeObserver.observe(scrollContainer)

    return () => {
      scrollContainer.removeEventListener('scroll', updateReadPercent)
      window.removeEventListener('resize', updateReadPercent)
      resizeObserver.disconnect()
    }
  }, [scrollContainerRef, content, visible])

  return { wordCount, readPercent }
}
