import React, { useState, useMemo } from 'react'
import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import { DashboardNodeEntry } from '@components/DashboardNodeEntry/DashboardNodeEntry'
import styles from './NodesDashboardList.module.scss'

export const NodesDashboardList = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const [sortBy, setSortBy] = useState('recent')

  const sortedNodes = useMemo(() => {
    const copy = [...nodeEntriesInfo]

    if (sortBy === 'recent') {
      return copy.sort((a, b) => new Date(b.date_last_modified) - new Date(a.date_last_modified))
    }

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
      <div>
        <label>
          Sort:
          <select className={styles.sortControls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="default">Default</option>
            <option value="recent">Recent</option>
          </select>
        </label>
      </div>

      {sortedNodes.length ? (
        <ul className={styles.wrapper}>
          {sortedNodes.map((node) => (
            <DashboardNodeEntry key={node.id} nodeEntriesInfo={nodeEntriesInfo} node={node} />
          ))}
        </ul>
      ) : (
        <h3>No nodes created yet...</h3>
      )}
    </>
  )
}
