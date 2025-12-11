import React, { Suspense, useEffect, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import PublicConnectionSpheres from '@components/Spheres/PublicConnectionSpheres.js'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'

// Redux
import { fetchPublicNodeEntriesInfo, fetchPublicEntry } from '@redux/reducers/currentEntryReducer'
import { fetchPublicConnections } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './ViewNetwork.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import calculateSpherePositions from '@utils/calculateSpherePositions'
import { getNodeStatus, checkAndUpdateNodeStatuses } from '@utils/nodeReadStatus'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const ViewNetwork = () => {
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const entryIdFromUrl = urlParams.get('entryId')
  const userId = urlParams.get('userId')

  const { nodeEntriesInfo, entryId, title, content, entriesLoading } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  // Fetch node entries info
  useEffect(() => {
    if (!userId) {
      return
    }
    // Only fetch if we don't have nodeEntriesInfo
    if (!nodeEntriesInfo || nodeEntriesInfo.length === 0) {
      dispatch(fetchPublicNodeEntriesInfo(userId)).catch((err) => {
        console.error('Error fetching node entries:', err)
      })
    }
  }, [dispatch, userId, nodeEntriesInfo])

  // Fetch current entry data and handle most recent entry logic
  useEffect(() => {
    if (!userId) {
      return
    }

    // If no entryId, use the most recently modified one
    if (!entryIdFromUrl && nodeEntriesInfo.length > 0) {
      const mostRecent = nodeEntriesInfo.reduce((latest, current) => {
        if (!latest) return current
        const latestDate = new Date(latest.date_last_modified || latest.date_created || 0)
        const currentDate = new Date(current.date_last_modified || current.date_created || 0)
        return currentDate > latestDate ? current : latest
      }, null)

      if (mostRecent?.id) {
        history.replace(`/view-network?userId=${userId}&entryId=${mostRecent.id}`)
        return
      }
    }

    if (!entryIdFromUrl) {
      return
    }

    // Only fetch if we don't already have this entry loaded
    if (entryId === entryIdFromUrl && title && content) {
      // Already have this entry, just fetch connections in case they changed
      dispatch(fetchPublicConnections({ entryId: entryIdFromUrl, userId })).catch((err) => {
        console.error('Error fetching connections:', err)
      })
      return
    }

    // Fetch entry data
    dispatch(fetchPublicEntry({ entryId: entryIdFromUrl, userId }))
      .unwrap()
      .then(() => {
        // Fetch connections after entry is loaded
        dispatch(fetchPublicConnections({ entryId: entryIdFromUrl, userId })).catch((err) => {
          console.error('Error fetching connections:', err)
          // Don't fail the whole component if connections fail
        })
      })
      .catch((err) => {
        console.error('Error fetching entry:', err)
      })
  }, [dispatch, entryIdFromUrl, userId, nodeEntriesInfo, history, entryId, title, content])

  // Check and update node statuses
  const nodeStatuses = useMemo(() => {
    if (!nodeEntriesInfo || nodeEntriesInfo.length === 0) return {}
    return checkAndUpdateNodeStatuses(nodeEntriesInfo)
  }, [nodeEntriesInfo])

  // Positioning logic
  const {
    positions,
    lineExtensionFactor,
    externalDistanceFactor,
    horizontalRotation,
    verticalRotation,
    subConnectionVerticalOffset,
    subConnectionHorizontalOffset,
  } = useMemo(() => {
    if (!connections || connections.length === 0) {
      return {
        positions: {},
        lineExtensionFactor: 1,
        externalDistanceFactor: 1,
        horizontalRotation: {},
        verticalRotation: {},
        subConnectionVerticalOffset: {},
        subConnectionHorizontalOffset: {},
      }
    }

    // Filter out invalid connections
    const validConnections = connections.filter((conn) => conn && conn.id && conn.connection_type)

    try {
      const result = calculateSpherePositions(validConnections, {
        PARENT,
        EXTERNAL,
        CHILD,
        SIBLING,
      })
      // Main node is always at [0, 0, 0], so we don't need center from the calculation
      const { center, ...rest } = result
      return rest
    } catch (err) {
      console.error('Error calculating sphere positions:', err)
      return {
        positions: {},
        lineExtensionFactor: 1,
        externalDistanceFactor: 1,
        horizontalRotation: {},
        verticalRotation: {},
        subConnectionVerticalOffset: {},
        subConnectionHorizontalOffset: {},
      }
    }
  }, [connections])

  // Get entry data from Redux state
  const entryData = useMemo(() => {
    if (!entryId) return null
    return {
      id: entryId,
      title: title || 'Untitled',
      content: content ? [content] : [],
    }
  }, [entryId, title, content])

  // Create main sphere texture with text + title
  const mainTexture = useMemo(() => {
    if (!entryData) return null

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      canvas.width = 1024
      canvas.height = 512

      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (entryData?.content && Array.isArray(entryData.content) && entryData.content[0]) {
        try {
          const text = extractTextFromHTML(entryData.content[0] || '')
          ctx.fillStyle = 'silver'
          ctx.font = '12px Syncopate'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          const words = text.split(' ')
          let line = ''
          const maxWidth = canvas.width - 100
          const lines = []

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' '
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && i > 0) {
              lines.push(line.trim())
              line = words[i] + ' '
            } else {
              line = testLine
            }
          }
          lines.push(line.trim())

          const lineHeight = 40
          let y = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2

          lines.forEach((l) => {
            if (l && typeof l === 'string') {
              ctx.fillText(l, canvas.width / 2, y)
            }
            y += lineHeight
          })
        } catch (err) {
          console.error('Error rendering content in texture:', err)
        }
      }

      if (entryData?.title) {
        ctx.font = 'bold 28px Syncopate'
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const titleText = typeof entryData.title === 'string' ? entryData.title : 'Untitled'
        ctx.fillText(titleText, canvas.width / 2, canvas.height / 2)
      }

      const tex = new THREE.CanvasTexture(canvas)
      tex.wrapS = THREE.ClampToEdgeWrapping
      tex.wrapT = THREE.ClampToEdgeWrapping
      return tex
    } catch (err) {
      console.error('Error creating main texture:', err)
      return null
    }
  }, [entryData])

  const handleMainNodeClick = () => {
    if (entryIdFromUrl && userId) {
      history.push(`/show-node-entry?userId=${userId}&entryId=${entryIdFromUrl}`)
    }
  }

  const handleConnectionSphereClick = (connection) => {
    if (!connection) {
      return
    }

    if (connection.connection_type === EXTERNAL) {
      if (connection.foreign_source) {
        window.open(connection.foreign_source, '_blank')
      }
      return
    }

    if (!entryData?.id || !userId) {
      return
    }

    const targetNode = transformConnection(entryData.id, connection)
    if (targetNode?.id) {
      history.push(`/view-network?userId=${userId}&entryId=${targetNode.id}`)
    } else {
      console.warn('Unable to determine target node for connection:', connection)
    }
  }

  function getScaledSphereSize(baseSize, wordCount) {
    if (!wordCount || wordCount <= 0) return baseSize
    const factor = Math.log10(wordCount + 1) / 5
    const delta = Math.min(Math.max(factor, -0.5), 0.2)
    return baseSize * (1 + delta)
  }

  if (!userId) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.error}>User ID is required</div>
      </div>
    )
  }

  if (entriesLoading) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.loading}>
          <SmallSpinner />
        </div>
      </div>
    )
  }

  if (!entryData || !entryId) {
    return (
      <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
        <div className={styles.error}>No entry found</div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <PublicLegend />
      <div className={styles.topBar}>
        <h1>Network View</h1>
        <div className={styles.topBarSearch}>
          <PublicNodeSearch
            mode="navigate"
            placeholder="Search to explore..."
            className={styles.searchComponent}
            nodeEntriesInfo={nodeEntriesInfo}
            userId={userId}
            collapsible
            navigateToNetwork={true}
          />
        </div>
      </div>

      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            <group>
              {/* Main Node sphere - always at center [0, 0, 0] */}
              {entryData && entryData.id && mainTexture && (
                <SphereWithEffects
                  id={entryData.id}
                  pos={new THREE.Vector3(0, 0, 0)}
                  title={entryData.title || 'Untitled'}
                  size={DEFAULT_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
                  mainTexture={mainTexture}
                  onClick={handleMainNodeClick}
                  rotation={[0, 4.7, 0]}
                  nodeStatus={getNodeStatus(entryData.id)}
                />
              )}
            </group>

            {/* LINES Connection to main - render first */}
            <group>
              {connections?.map((conn) => {
                if (!conn || !conn.id) return null

                const pos = positions[conn.id]
                if (!pos || !Array.isArray(pos) || pos.length !== 3) return null

                try {
                  const isExternal = conn.connection_type === EXTERNAL
                  const extensionFactor = isExternal ? externalDistanceFactor : lineExtensionFactor
                  const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)
                  const startPos = new THREE.Vector3(0, 0, 0) // Main node is always at center

                  const points = [startPos, endPos]

                  if (isExternal) {
                    const geometry = new THREE.BufferGeometry().setFromPoints(points)

                    return (
                      <line
                        key={`line-${conn.id}`}
                        geometry={geometry}
                        dashed={true}
                        onUpdate={(line) => {
                          if (line.computeLineDistances) {
                            line.computeLineDistances()
                          }
                        }}
                        renderOrder={0}
                      >
                        <lineDashedMaterial
                          color="white"
                          dashSize={0.5}
                          gapSize={0.2}
                          linewidth={1}
                          depthWrite={false}
                          depthTest={false}
                        />
                      </line>
                    )
                  } else {
                    const curve = new THREE.CatmullRomCurve3(points)
                    const geometry = new THREE.TubeGeometry(curve, 8, 0.02, 4, false)

                    return (
                      <mesh key={`line-${conn.id}`} geometry={geometry} renderOrder={0}>
                        <meshBasicMaterial color="white" depthWrite={false} depthTest={false} />
                      </mesh>
                    )
                  }
                } catch (err) {
                  console.error('Error rendering connection line:', err, conn)
                  return null
                }
              })}
            </group>

            {/* CONNECTION SPHERES + their sub spheres - render second */}
            <group>
              {connections?.map((conn) => {
                if (!conn || !conn.id) return null

                try {
                  const transformed = transformConnection(entryData.id, conn)
                  if (!transformed || !transformed.id) return null

                  const pos = positions[conn.id]
                  if (!pos || !Array.isArray(pos) || pos.length !== 3) return null

                  const hRotation = horizontalRotation[conn.id] ?? 4.7
                  const vRotation = verticalRotation[conn.id] ?? 0

                  const isExternal = conn.connection_type === EXTERNAL
                  const extensionFactor = isExternal ? externalDistanceFactor : lineExtensionFactor
                  const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)

                  const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)
                  const sphereSize = getScaledSphereSize(
                    DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION],
                    nodeInfo?.wdWordCount
                  )
                  const nodeStatus = nodeStatuses[String(transformed.id)] || getNodeStatus(transformed.id)

                  return (
                    <React.Fragment key={conn.id}>
                      <SphereWithEffects
                        id={transformed.id}
                        pos={endPos}
                        title={transformed.title || 'Untitled'}
                        size={sphereSize}
                        conn={conn}
                        onClick={() => handleConnectionSphereClick(conn)}
                        rotation={[vRotation, hRotation, 0]}
                        nodeStatus={nodeStatus}
                      />

                      <PublicConnectionSpheres
                        conn={conn}
                        connId={transformed.id}
                        userId={userId}
                        position={endPos}
                        size={sphereSize}
                        handleConnectionSphereClick={handleConnectionSphereClick}
                        rotation={[vRotation, hRotation, 0]}
                        verticalOffset={subConnectionVerticalOffset[conn.id] || 0}
                        horizontalOffset={subConnectionHorizontalOffset[conn.id] || 0}
                        currentEntryId={entryData?.id || null}
                      />
                    </React.Fragment>
                  )
                } catch (err) {
                  console.error('Error rendering connection sphere:', err, conn)
                  return null
                }
              })}
            </group>
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={12}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default ViewNetwork
