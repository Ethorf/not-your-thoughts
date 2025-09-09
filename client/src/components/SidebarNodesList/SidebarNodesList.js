import React, { useMemo } from 'react'
import { SidebarNode } from '@components/SidebarNode/SidebarNode'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './SidebarNodeslist.module.scss'

export const SidebarNodesList = ({ sortBy }) => {
  const nodeEntriesInfo = useNodeEntriesInfo()

  const sortedNodes = useMemo(() => {
    const copy = [...nodeEntriesInfo]

    if (sortBy === 'recent') {
      return copy.sort((a, b) => new Date(b.date_last_modified) - new Date(a.date_last_modified))
    }

    // Default sorting: starred first, then pending, then by date_last_modified
    return copy.sort((a, b) => {
      if (a.starred && !b.starred) return -1
      if (!a.starred && b.starred) return 1
      if (a.pending && !b.pending) return -1
      if (!a.pending && b.pending) return 1
      return new Date(b.date_last_modified) - new Date(a.date_last_modified)
    })
  }, [nodeEntriesInfo, sortBy])

  return (
    <>
      {sortedNodes.length ? (
        <ul className={styles.wrapper}>
          {sortedNodes.map((node) => (
            <SidebarNode nodeEntriesInfo={nodeEntriesInfo} node={node} />
          ))}
        </ul>
      ) : (
        <h3>No nodes created yet...</h3>
      )}
    </>
  )
}
