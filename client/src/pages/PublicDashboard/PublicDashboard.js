import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames'

// Styles
import styles from './PublicDashboard.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Components
import { PublicNodesDashboardList } from '@components/Shared/PublicNodesDashboardList/PublicNodesDashboardList'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'

// Utils
import { checkAndUpdateNodeStatuses } from '@utils/nodeReadStatus'
import { resolvePublicUserId } from '@utils/resolvePublicUserId'

const PublicDashboard = () => {
  const location = useLocation()
  const [nodeEntriesInfo, setNodeEntriesInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const urlParams = new URLSearchParams(location.search)
  const userId = urlParams.get('userId')

  useEffect(() => {
    if (!userId) {
      setError('User ID is required')
      setLoading(false)
      return
    }

    const fetchNodes = async () => {
      try {
        setLoading(true)
        const resolvedUserId = resolvePublicUserId(userId)
        const response = await fetch(`/api/entries/public/node_entries_info/${resolvedUserId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch nodes')
        }
        const data = await response.json()
        const nodeEntries = data.nodeEntries || []

        // Check and update node statuses based on date_last_modified
        checkAndUpdateNodeStatuses(nodeEntries)

        setNodeEntriesInfo(nodeEntries)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNodes()
  }, [userId])

  if (loading) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <PublicLegend />
      <h1 className={styles.title}>Eric Thorfinnson's Nodes</h1>
      <div className={styles.nodesSection}>
        <PublicNodesDashboardList nodeEntriesInfo={nodeEntriesInfo} userId={userId} />
      </div>
    </div>
  )
}

export default PublicDashboard
