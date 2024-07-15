import React from 'react'
import { DashboardNodeEntry } from '@components/DashboardNodeEntry/DashboardNodeEntry'

// Hooks
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import styles from './NodesDashboardList.module.scss'

export const NodesDashboardList = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()

  // Sort custom prompts with starred prompts first
  const sortedNodes = [...nodeEntriesInfo].sort((a, b) => {
    if (a.starred && !b.starred) return -1 // a comes first if it's starred
    if (!a.starred && b.starred) return 1 // b comes first if a is not starred but b is
    return 0 // maintain the order for non-starred prompts
  })

  return (
    <>
      {sortedNodes.length ? (
        <ul className={styles.wrapper}>
          {sortedNodes.map((node) => (
            <DashboardNodeEntry nodeEntriesInfo={nodeEntriesInfo} key={node.id} node={node} />
          ))}
        </ul>
      ) : (
        <h3>No prompts created yet...</h3>
      )}
    </>
  )
}
