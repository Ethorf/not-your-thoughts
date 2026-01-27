import React, { Suspense, useEffect, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import PublicConnectionSpheres from '@components/Spheres/PublicConnectionSpheres.js'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import PublicNodeSearch from '@components/Shared/PublicNodeSearch/PublicNodeSearch'
import SmallSpinner from '@components/Shared/SmallSpinner/SmallSpinner'
import PublicLegend from '@components/Shared/PublicLegend/PublicLegend'
import PublicModalsContainer from '@components/Shared/PublicModalsContainer/PublicModalsContainer'

// Redux
import { fetchPublicNodeEntriesInfo, fetchPublicEntry } from '@redux/reducers/currentEntryReducer'
import { fetchPublicConnections } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './ViewNetwork.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, LOCAL_SPHERE_SIZES } from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import calculateSpherePositions from '@utils/calculateSpherePositions'

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

  // Positioning logic - same as Explore local view
  const {
    positions,
    center,
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
        center: [0, 0, 0],
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
      return calculateSpherePositions(validConnections, {
        PARENT,
        EXTERNAL,
        CHILD,
        SIBLING,
      })
    } catch (err) {
      console.error('Error calculating sphere positions:', err)
      return {
        positions: {},
        center: [0, 0, 0],
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

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 512

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (content) {
      const text = extractTextFromHTML(content)
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
        ctx.fillText(l, canvas.width / 2, y)
        y += lineHeight
      })
    }

    if (title) {
      ctx.font = 'bold 28px Syncopate'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(title, canvas.width / 2, canvas.height / 2)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    return tex
  }, [entryData, content, title])

  const handleMainNodeClick = () => {
    if (entryIdFromUrl && userId) {
      history.push(`/show-node-entry?userId=${userId}&entryId=${entryIdFromUrl}`)
    }
  }

  const handleConnectionSphereClick = async (id, conn) => {
    if (conn.connection_type === EXTERNAL) {
      if (conn.foreign_source) {
        window.open(conn.foreign_source, '_blank')
      }
      return
    }

    if (userId && id) {
      history.push(`/view-network?userId=${userId}&entryId=${id}`)
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
      <PublicModalsContainer />
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
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            <group>
              {/* Main Node sphere - positioned at calculated center like Explore local view */}
              <SphereWithEffects
                id={entryId}
                pos={center}
                title={title}
                size={LOCAL_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
                mainTexture={mainTexture}
                onClick={handleMainNodeClick}
                rotation={[0, 4.7, 0]}
              />
            </group>

            {/* LINES Connection to main - render first */}
            <group>
              {connections?.map((conn) => {
                const pos = positions[conn.id]
                if (!pos) return null

                // Calculate line start/end points to avoid overlapping spheres
                const isExternal = conn.connection_type === EXTERNAL
                const extensionFactor = isExternal ? externalDistanceFactor : lineExtensionFactor
                const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)
                const startPos = new THREE.Vector3(...center)

                // Use different geometry based on connection type
                const points = [startPos, endPos]

                if (isExternal) {
                  // Use regular line geometry for external connections (dashed)
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
                  // Use tube geometry for internal connections (solid)
                  const curve = new THREE.CatmullRomCurve3(points)
                  const geometry = new THREE.TubeGeometry(curve, 8, 0.02, 4, false)

                  return (
                    <mesh key={`line-${conn.id}`} geometry={geometry} renderOrder={0}>
                      <meshBasicMaterial color="white" depthWrite={false} depthTest={false} />
                    </mesh>
                  )
                }
              })}
            </group>

            {/* CONNECTION SPHERES + their sub spheres - render second */}
            <group>
              {connections?.map((conn) => {
                const transformed = transformConnection(entryId, conn)
                const pos = positions[conn.id]
                const hRotation = horizontalRotation[conn.id]
                const vRotation = verticalRotation[conn.id]
                if (!pos) return null

                const isExternal = conn.connection_type === EXTERNAL
                const extensionFactor = isExternal ? externalDistanceFactor : lineExtensionFactor
                const endPos = new THREE.Vector3(...pos).multiplyScalar(extensionFactor)

                const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)
                const sphereSize = getScaledSphereSize(
                  LOCAL_SPHERE_SIZES[SPHERE_TYPES.CONNECTION],
                  nodeInfo?.wdWordCount
                )

                return (
                  <React.Fragment key={conn.id}>
                    {/* Connected Node Spheres */}
                    <SphereWithEffects
                      id={transformed.id}
                      pos={endPos}
                      title={transformed.title}
                      size={sphereSize}
                      conn={conn}
                      onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                      rotation={[vRotation, hRotation, 0]}
                    />

                    {/* Sub-connections for this sphere */}
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
                      currentEntryId={entryId}
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

export default ViewNetwork
