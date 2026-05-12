import React, { useEffect, useMemo, useCallback, useRef } from 'react'
import { unwrapResult } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation, Link } from 'react-router-dom'
import classNames from 'classnames'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import NodeSearch from '@components/Shared/NodeSearch/NodeSearch'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import TextButton from '@components/Shared/TextButton/TextButton'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'
import PublicModalsContainer from '@components/Shared/PublicModalsContainer/PublicModalsContainer'
import GlobalView from './GlobalView/GlobalView'
import LocalNodeNetworkView from './LocalNodeNetworkView'

// Redux
import {
  setEntryById,
  fetchPublicNodeEntriesInfo,
  fetchPublicEntry,
} from '@redux/reducers/currentEntryReducer'
import { fetchConnections, fetchPublicConnections, getSelectedText } from '@redux/reducers/connectionsReducer'
import { openModal } from '@redux/reducers/modalsReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'

const { PRIMARY } = CONNECTION_ENTRY_SOURCES

function getMostRecentlyModifiedItem(items) {
  if (!Array.isArray(items) || items.length === 0) return null
  const validItems = items.filter((item) => item && item.date_last_modified)
  if (validItems.length === 0) return null
  return validItems.reduce((latest, current) =>
    new Date(current.date_last_modified) > new Date(latest.date_last_modified) ? current : latest
  )
}

const Explore = () => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const isGlobalView = urlParams.get('view') === 'global'
  const publicUserId = urlParams.get('userId')
  const entryIdFromUrl = urlParams.get('entryId')
  const isPublicNetworkMode = Boolean(publicUserId)

  const nodeEntriesInfo = useNodeEntriesInfo(!isPublicNetworkMode)
  const { content, title, entryId, entriesLoading } = useSelector((state) => state.currentEntry)
  const { connections, connectionsLoading } = useSelector((state) => state.connections)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const mainNodeGoesToEdit = Boolean(
    isAuthenticated && (!isPublicNetworkMode || (user?.id && publicUserId === user.id))
  )

  const hasFetchedNodeEntriesRef = useRef(false)
  const lastEntryIdParamRef = useRef(null)
  const lastUserIdParamRef = useRef(null)

  // Public network: load node list for search (same idea as ViewNetwork)
  useEffect(() => {
    if (!isPublicNetworkMode || !publicUserId) {
      return
    }
    const userIdChanged = lastUserIdParamRef.current !== publicUserId
    if (userIdChanged) {
      hasFetchedNodeEntriesRef.current = false
      lastUserIdParamRef.current = publicUserId
    }
    const hasNodeEntries = nodeEntriesInfo && nodeEntriesInfo.length > 0
    if ((!hasFetchedNodeEntriesRef.current && !hasNodeEntries) || userIdChanged) {
      hasFetchedNodeEntriesRef.current = true
      dispatch(fetchPublicNodeEntriesInfo(publicUserId)).catch((err) => {
        console.error('Error fetching public node entries:', err)
        hasFetchedNodeEntriesRef.current = false
      })
    }
  }, [dispatch, isPublicNetworkMode, publicUserId, nodeEntriesInfo])

  // Public network: default to most recent entry when no entryId in URL
  useEffect(() => {
    if (!isPublicNetworkMode || !publicUserId || !nodeEntriesInfo?.length) {
      return
    }
    if (entryIdFromUrl) {
      return
    }
    const mostRecent = nodeEntriesInfo.reduce((latest, current) => {
      if (!latest) return current
      const latestDate = new Date(latest.date_last_modified || latest.date_created || 0)
      const currentDate = new Date(current.date_last_modified || current.date_created || 0)
      return currentDate > latestDate ? current : latest
    }, null)
    if (mostRecent?.id) {
      history.replace(`/explore?userId=${publicUserId}&entryId=${mostRecent.id}`)
    }
  }, [isPublicNetworkMode, publicUserId, nodeEntriesInfo, entryIdFromUrl, history])

  // Public network: load entry + connections
  useEffect(() => {
    if (!isPublicNetworkMode || !publicUserId || !entryIdFromUrl) {
      return
    }

    const entryChanged = lastEntryIdParamRef.current !== entryIdFromUrl || lastUserIdParamRef.current !== publicUserId

    if (!entryChanged && entryId === entryIdFromUrl && title && content) {
      dispatch(fetchPublicConnections({ entryId: entryIdFromUrl, userId: publicUserId })).catch((err) => {
        console.error('Error fetching public connections:', err)
      })
      lastEntryIdParamRef.current = entryIdFromUrl
      lastUserIdParamRef.current = publicUserId
      return
    }

    lastEntryIdParamRef.current = entryIdFromUrl
    lastUserIdParamRef.current = publicUserId

    dispatch(fetchPublicEntry({ entryId: entryIdFromUrl, userId: publicUserId }))
      .unwrap()
      .then(() => {
        dispatch(fetchPublicConnections({ entryId: entryIdFromUrl, userId: publicUserId })).catch((err) => {
          console.error('Error fetching public connections:', err)
        })
      })
      .catch((err) => {
        console.error('Error fetching public entry:', err)
      })
  }, [dispatch, isPublicNetworkMode, publicUserId, entryIdFromUrl, entryId, title, content])

  // Private network: refresh connections when entry changes
  useEffect(() => {
    if (isPublicNetworkMode || !entryId) {
      return
    }
    dispatch(fetchConnections(entryId))
  }, [dispatch, isPublicNetworkMode, entryId])

  const handleOpenConnectionsWithSelectedText = useCallback(async () => {
    if (!entryId || isPublicNetworkMode) return

    const handleOpenConnectionsModal = async () => {
      try {
        const fetchConnRes = await dispatch(fetchConnections(entryId))
        unwrapResult(fetchConnRes)
        dispatch(openModal(MODAL_NAMES.CONNECTIONS))
      } catch (error) {
        console.error('Failed to fetch connections:', error)
      }
    }

    try {
      dispatch(getSelectedText(PRIMARY))
      await handleOpenConnectionsModal()
    } catch (error) {
      console.error('Get selected text failure', error)
    }
  }, [dispatch, entryId, isPublicNetworkMode])

  useEffect(() => {
    if (isPublicNetworkMode) {
      return
    }
    const shouldSetMostRecent = !entryId || (entryId && !nodeEntriesInfo?.some((node) => node.id === entryId))

    if (shouldSetMostRecent && Array.isArray(nodeEntriesInfo)) {
      const mostRecent = getMostRecentlyModifiedItem(nodeEntriesInfo)
      if (mostRecent?.id) {
        dispatch(setEntryById(mostRecent.id))
      }
    }
  }, [dispatch, entryId, nodeEntriesInfo, isPublicNetworkMode])

  if (isGlobalView) {
    return <GlobalView />
  }

  if (!isPublicNetworkMode && !isAuthenticated) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <h1>Explore</h1>
        <p className={styles.loggedOutHint}>Sign in to explore your node network, or open a shared network link.</p>
        <Link to="/login" className={styles.loginLink}>
          Log in
        </Link>
      </div>
    )
  }

  if (isPublicNetworkMode && !publicUserId) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.error}>User ID is required</div>
      </div>
    )
  }

  if (isPublicNetworkMode && (entriesLoading || connectionsLoading) && (!entryId || !title)) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  if (isPublicNetworkMode && !entriesLoading && entryIdFromUrl && (!entryId || !title)) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.error}>No entry found</div>
      </div>
    )
  }

  if (!isPublicNetworkMode && !entryId) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      {isPublicNetworkMode ? (
        <>
          <PublicModalsContainer />
          <PublicLegend />
          <h1>Explore</h1>
          <div className={styles.viewToggle}>
            <TextButton
              className={classNames(styles.toggleButton, { [styles.active]: !isGlobalView })}
              onClick={() => {
                const q = new URLSearchParams()
                q.set('userId', publicUserId)
                if (entryIdFromUrl) q.set('entryId', entryIdFromUrl)
                history.replace(`/explore?${q.toString()}`)
              }}
              tooltip="Switch to Local View"
            >
              Local View
            </TextButton>
            <TextButton
              className={classNames(styles.toggleButton, { [styles.active]: isGlobalView })}
              onClick={() => {
                const q = new URLSearchParams({ view: 'global', userId: publicUserId })
                if (entryIdFromUrl) q.set('entryId', entryIdFromUrl)
                history.push(`/explore?${q.toString()}`)
              }}
              tooltip="Switch to Global View"
            >
              Global View
            </TextButton>
          </div>
          <div className={styles.publicNetworkSearchRow}>
            <PublicNodeSearch
              mode="navigate"
              placeholder="Search to explore..."
              className={styles.searchComponent}
              nodeEntriesInfo={nodeEntriesInfo || []}
              userId={publicUserId}
              collapsible
              navigateToNetwork
            />
          </div>
        </>
      ) : (
        <>
          <h1>Explore</h1>
          <div className={styles.viewToggle}>
            <TextButton
              className={classNames(styles.toggleButton, { [styles.active]: !isGlobalView })}
              onClick={() => history.push('/explore')}
              tooltip="Switch to Local View"
            >
              Local View
            </TextButton>
            <TextButton
              className={classNames(styles.toggleButton, { [styles.active]: isGlobalView })}
              onClick={() => history.push('/explore?view=global')}
              tooltip="Switch to Global View"
            >
              Global View
            </TextButton>
            <NodeSearch
              mode="navigate"
              placeholder="Search to explore..."
              className={styles.searchComponent}
              isGlobalMode={true}
            />
            <DefaultButton tooltip="Open connections menu" onClick={handleOpenConnectionsWithSelectedText}>
              Connections
            </DefaultButton>
          </div>
        </>
      )}

      <LocalNodeNetworkView
        entryId={entryId}
        title={title}
        content={content}
        connections={connections}
        nodeEntriesInfo={nodeEntriesInfo || []}
        publicOwnerUserId={isPublicNetworkMode ? publicUserId : null}
        mainNodeGoesToEdit={mainNodeGoesToEdit}
      />
    </div>
  )
}

export default Explore
