import React, { Suspense, useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import ThreeTextSphere from '@components/ThreeTextSphere/ThreeTextSphere.js'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { fetchConnections, fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const Explore = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const { content, title, entryId } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  // State for all visible connections (main + sub-connections)
  const [allVisibleConnections, setAllVisibleConnections] = useState({})
  const [subConnectionsMap, setSubConnectionsMap] = useState({})
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [connectionCache, setConnectionCache] = useState({})

  // Deduplication helper function
  const deduplicateConnections = useCallback(
    (connections, seenIds = new Set(), seenTitles = new Set()) => {
      const unique = []

      connections?.forEach((conn) => {
        const transformed = transformConnection(entryId, conn)
        const id = transformed.id
        const title = transformed.title?.toLowerCase().trim()

        // Skip if we've already seen this ID or title
        if (seenIds.has(id) || (title && seenTitles.has(title))) {
          return
        }

        // Add to unique list and mark as seen
        unique.push(conn)
        seenIds.add(id)
        if (title) {
          seenTitles.add(title)
        }
      })

      return { unique, seenIds, seenTitles }
    },
    [entryId]
  )

  // Optimized connection fetching with caching and parallel processing
  const fetchAllConnections = useCallback(async () => {
    if (!entryId || !connections) return

    setIsLoadingConnections(true)
    const seenIds = new Set()
    const seenTitles = new Set()
    const allConnections = {}
    const subConnections = {}

    // Start with main connections
    const mainResult = deduplicateConnections(connections, seenIds, seenTitles)
    mainResult.unique.forEach((conn) => {
      allConnections[conn.id] = conn
    })

    // Filter out external connections and check cache
    const internalConnections = mainResult.unique.filter((conn) => conn.connection_type !== EXTERNAL)
    const uncachedConnections = internalConnections.filter((conn) => !connectionCache[conn.id])
    const cachedConnections = internalConnections.filter((conn) => connectionCache[conn.id])

    // Process cached connections immediately
    cachedConnections.forEach((conn) => {
      const cachedSubs = connectionCache[conn.id]
      const subDeduped = deduplicateConnections(cachedSubs, seenIds, seenTitles)

      subDeduped.unique.forEach((subConn) => {
        allConnections[subConn.id] = subConn
      })
      subConnections[conn.id] = subDeduped.unique
    })

    // Fetch uncached connections in parallel with batching
    if (uncachedConnections.length > 0) {
      const BATCH_SIZE = 5 // Process 5 connections at a time
      const batches = []

      for (let i = 0; i < uncachedConnections.length; i += BATCH_SIZE) {
        const batch = uncachedConnections.slice(i, i + BATCH_SIZE)
        batches.push(batch)
      }

      // Process batches sequentially but connections within each batch in parallel
      for (const batch of batches) {
        const batchPromises = batch.map(async (conn) => {
          try {
            const subResult = await dispatch(fetchConnectionsDirect(conn.id)).unwrap()
            const subDeduped = deduplicateConnections(subResult, seenIds, seenTitles)

            // Add sub-connections to main list
            subDeduped.unique.forEach((subConn) => {
              allConnections[subConn.id] = subConn
            })

            // Store sub-connections for this parent
            subConnections[conn.id] = subDeduped.unique

            // Cache the result
            setConnectionCache((prev) => ({
              ...prev,
              [conn.id]: subResult,
            }))
          } catch (error) {
            console.error(`Error fetching sub-connections for ${conn.id}:`, error)
          }
        })

        await Promise.all(batchPromises)
      }
    }

    setAllVisibleConnections(allConnections)
    setSubConnectionsMap(subConnections)
    setIsLoadingConnections(false)
  }, [entryId, connections, dispatch, deduplicateConnections, connectionCache])

  // Debounced connection fetching to prevent excessive re-fetches
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAllConnections()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [entryId, connections, fetchAllConnections])

  // Get main connections (direct connections to center sphere)
  const mainConnections = useMemo(() => {
    return connections?.filter((conn) => allVisibleConnections[conn.id]) || []
  }, [connections, allVisibleConnections])

  // **** Handle query parameters for entryId
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(location.search)
  //   const queryEntryId = urlParams.get('entryId')

  //   if (queryEntryId && queryEntryId !== entryId) {
  //     // If there's a query param entryId and it's different from current, set it
  //     dispatch(setEntryById(queryEntryId))
  //   } else if (!queryEntryId && entryId) {
  //     // If there's no query param but we have an entryId, add it to the URL
  //     const newUrl = `${location.pathname}?entryId=${entryId}`
  //     history.replace(newUrl)
  //   }
  // }, [location.search, entryId, dispatch, history, location.pathname])

  const handleMainNodeClick = async () => {
    history.push(`/edit-node-entry?entryId=${entryId}`)
  }

  function extractTextFromHTML(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return doc.body.textContent || ''
  }

  // --- Positioning logic ---
  const center = [0, 0, 0]
  const positions = {}
  const LINE_EXTENSION_FACTOR = 1.5
  const EXTERNAL_DISTANCE_FACTOR = 1.8 // Controls both external sphere distance and line length

  const SPHERE_DIAMETER = 0.5 * 2
  const MIN_SEPARATION = SPHERE_DIAMETER + 0.1

  const SIBLING_DISTANCE_FROM_CENTER_SPHERE = 0.5
  const CHILD_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.6
  const PARENT_DISTANCE_FROM_CENTER_SPHERE = SIBLING_DISTANCE_FROM_CENTER_SPHERE + 0.7

  // Filter connections by type
  const siblings = connections?.filter((c) => c.connection_type === SIBLING) || []
  const parents = connections?.filter((c) => c.connection_type === PARENT) || []
  const children = connections?.filter((c) => c.connection_type === CHILD) || []
  const externals = connections?.filter((c) => c.connection_type === EXTERNAL) || []

  const OUTER_FACTOR = 1.1
  const scaleFromOrigin = (pos, factor) => {
    const v = new THREE.Vector3(...pos)
    return v.multiplyScalar(factor).toArray()
  }

  // Position siblings
  siblings.forEach((s, i) => {
    // Alternate left and right sides
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (SPHERE_DIAMETER + SIBLING_DISTANCE_FROM_CENTER_SPHERE)
    const y = Math.floor(i / 2) * MIN_SEPARATION * (i % 2 === 0 ? 1 : -1)
    positions[s.id] = scaleFromOrigin([x, y, 0], OUTER_FACTOR)
  })

  // Position externals - closer to pointing directly up
  externals.forEach((e, i) => {
    const baseVerticalDistance = SPHERE_DIAMETER * 2.5 // Distance above center
    const horizontalOffset = (i % 2 === 0 ? -1 : 1) * SPHERE_DIAMETER * 0.8 // Small left/right offset
    const verticalOffset = Math.floor(i / 2) * SPHERE_DIAMETER * 0.6 // Stack vertically

    const x = horizontalOffset
    const y = baseVerticalDistance + verticalOffset

    positions[e.id] = [x, y, 0]
  })

  // Position parents
  parents.forEach((p, i) => {
    positions[p.id] = [0, SPHERE_DIAMETER + MIN_SEPARATION * PARENT_DISTANCE_FROM_CENTER_SPHERE, 0]
  })

  // Position children
  children.forEach((c, i) => {
    const x = (i - (children.length - 1) / 2) * MIN_SEPARATION
    const y = -2
    positions[c.id] = scaleFromOrigin([x, y, 0], CHILD_DISTANCE_FROM_CENTER_SPHERE)
  })

  useEffect(() => {
    if (entryId) {
      dispatch(fetchConnections(entryId))
    }
  }, [dispatch, entryId])

  const handleConnectionSphereClick = async (id, conn) => {
    if (conn.connection_type === EXTERNAL) {
      window.open(conn.foreign_source, '_blank')
    } else {
      await dispatch(setEntryById(id))
      // Update the query parameter when switching to a different entry
      const newUrl = `${location.pathname}?entryId=${id}`
      history.replace(newUrl)
    }
  }

  function getMostRecentlyModifiedItem(items) {
    if (!Array.isArray(items) || items.length === 0) return null
    const validItems = items.filter((item) => item && item.date_last_modified)
    if (validItems.length === 0) return null
    return validItems.reduce((latest, current) =>
      new Date(current.date_last_modified) > new Date(latest.date_last_modified) ? current : latest
    )
  }

  function getScaledSphereSize(baseSize, wordCount) {
    if (!wordCount || wordCount <= 0) return baseSize
    const factor = Math.log10(wordCount + 1) / 5
    const delta = Math.min(Math.max(factor, -0.5), 0.2)
    return baseSize * (1 + delta)
  }

  useEffect(() => {
    if (!entryId && Array.isArray(nodeEntriesInfo)) {
      const mostRecent = getMostRecentlyModifiedItem(nodeEntriesInfo)
      if (mostRecent?.id) {
        dispatch(setEntryById(mostRecent.id))
      }
    }
  }, [dispatch, entryId, nodeEntriesInfo])

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Explore</h1>
      {isLoadingConnections && <div className={styles.loadingIndicator}>Loading connections...</div>}
      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            {/* Main node - render on top */}
            <group>
              <ThreeTextSphere
                text={extractTextFromHTML(content)}
                title={title}
                position={center}
                sphereType={SPHERE_TYPES.MAIN}
                size={DEFAULT_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
                onClick={handleMainNodeClick}
              />
            </group>

            {/* Connection lines to main - render first */}
            <group>
              {mainConnections?.map((conn) => {
                const pos = positions[conn.id]
                if (!pos) return null

                // Calculate line start/end points to avoid overlapping spheres
                const isExternal = conn.connection_type === EXTERNAL
                const extensionFactor = isExternal ? EXTERNAL_DISTANCE_FACTOR : LINE_EXTENSION_FACTOR
                const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)
                const startPos = new THREE.Vector3(...center)

                // line geometry from main -> connection
                const points = [startPos, endPos]
                const geometry = new THREE.BufferGeometry().setFromPoints(points)

                return (
                  <line
                    key={`line-${conn.id}`}
                    geometry={geometry}
                    dashed={isExternal}
                    onUpdate={(line) => {
                      if (isExternal && line.computeLineDistances) {
                        line.computeLineDistances()
                      }
                    }}
                    renderOrder={0}
                  >
                    {isExternal ? (
                      <lineDashedMaterial
                        color="white"
                        dashSize={0.3}
                        gapSize={0.2}
                        linewidth={1}
                        depthWrite={false}
                        depthTest={false}
                      />
                    ) : (
                      <lineBasicMaterial color="white" linewidth={1} depthWrite={false} depthTest={false} />
                    )}
                  </line>
                )
              })}
            </group>

            {/* Connection spheres + their sub spheres - render second */}
            <group>
              {mainConnections?.map((conn) => {
                const transformed = transformConnection(entryId, conn)
                const pos = positions[conn.id]
                if (!pos) return null

                const isExternal = conn.connection_type === EXTERNAL
                const extensionFactor = isExternal ? EXTERNAL_DISTANCE_FACTOR : LINE_EXTENSION_FACTOR
                const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)

                const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)
                const sphereSize = getScaledSphereSize(
                  DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION],
                  nodeInfo?.wdWordCount
                )

                return (
                  <React.Fragment key={conn.id}>
                    {/* PARENT connection sphere */}
                    <ThreeTextSphere
                      conn={conn}
                      connId={transformed.id}
                      title={transformed.title}
                      position={endPos}
                      sphereType={SPHERE_TYPES.CONNECTION}
                      size={sphereSize}
                      onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                      subConnections={subConnectionsMap[conn.id] || []}
                    />
                  </React.Fragment>
                )
              })}
            </group>
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default Explore
