import React from 'react'
import { SidebarNode } from '@components/SidebarNode/SidebarNode'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './SidebarNodeslist.module.scss'

export const SidebarNodesList = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()

  // Sort nodes with starred first, then pending, then by date_last_modified
  const sortedNodes = [...nodeEntriesInfo].sort((a, b) => {
    if (a.starred && !b.starred) return -1 // a comes first if it's starred
    if (!a.starred && b.starred) return 1 // b comes first if a is not starred but b is
    if (a.pending && !b.pending) return -1 // a comes first if it's pending
    if (!a.pending && b.pending) return 1 // b comes first if a is not pending but b is
    if (new Date(a.date_last_modified) > new Date(b.date_last_modified)) return -1 // a comes first if it is more recently modified
    if (new Date(a.date_last_modified) < new Date(b.date_last_modified)) return 1 // b comes first if it is more recently modified
    return 0 // maintain the order if all conditions are equal
  })

  return (
    <>
      {sortedNodes.length ? (
        <ul className={styles.wrapper}>
          {sortedNodes.map((node) => (
            <SidebarNode nodeEntriesInfo={nodeEntriesInfo} key={node.id} node={node} />
          ))}
        </ul>
      ) : (
        <h3>No nodes created yet...</h3>
      )}
    </>
  )
}
