import React, { Suspense, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'
import ConnectionSpheres from '@components/Spheres/ConnectionSpheres.js'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import NodeSearch from '@components/Shared/NodeSearch/NodeSearch'
import TextButton from '@components/Shared/TextButton/TextButton'
import GlobalView from './GlobalView/GlobalView'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { fetchConnections } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/sharedClassnames.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import {
  SPHERE_TYPES,
  LOCAL_SPHERE_SIZES,
  LOCAL_EXPLORE_CONNECTION_DISTANCE_SCALE,
  LOCAL_EXPLORE_CONNECTION_SIZE_SCALE,
  LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET,
  LOCAL_EXPLORE_CHILD_DISTANCE_SCALE,
  LOCAL_EXPLORE_PARENT_DISTANCE_SCALE,
} from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import calculateSpherePositions from '@utils/calculateSpherePositions'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const getConnectionDistanceScale = (connectionType) => {
  if (connectionType === CHILD) return LOCAL_EXPLORE_CHILD_DISTANCE_SCALE
  if (connectionType === PARENT) return LOCAL_EXPLORE_PARENT_DISTANCE_SCALE
  return 1
}

const getLocalNodeRenderKey = (conn, transformed) => {
  if (conn?.connection_type === EXTERNAL) return `external-${conn.id}`
  return transformed?.id != null ? String(transformed.id) : `conn-${conn?.id}`
}
const Explore = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const location = useLocation()
  const dispatch = useDispatch()

  const { content, title, entryId } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  // Check for global view query param
  const urlParams = new URLSearchParams(location.search)
  const isGlobalView = urlParams.get('view') === 'global'

  // *** May not actually need this right now, I think I'm just going to start with filtering the main entryId
  // const [seenNodeIds, setSeenNodeIds] = useState([entryId])

  // --- Positioning logic ---
  const {
    positions,
    center,
    lineExtensionFactor,
    externalDistanceFactor,
    horizontalRotation,
    verticalRotation,
    subConnectionVerticalOffset,
    subConnectionHorizontalOffset,
  } = calculateSpherePositions(connections, {
    PARENT,
    EXTERNAL,
    CHILD,
    SIBLING,
  })
  const mainNodePosition = useMemo(
    () => [center[0], center[1] + LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET, center[2]],
    [center]
  )
  const uniqueConnections = useMemo(() => {
    const seenNodeKeys = new Set()
    return (connections || []).filter((conn) => {
      const transformed = transformConnection(entryId, conn)
      const nodeKey = getLocalNodeRenderKey(conn, transformed)
      if (seenNodeKeys.has(nodeKey)) return false
      seenNodeKeys.add(nodeKey)
      return true
    })
  }, [connections, entryId])
  const renderedFirstOrderNodeIds = useMemo(
    () =>
      uniqueConnections
        .filter((conn) => conn?.connection_type !== EXTERNAL)
        .map((conn) => transformConnection(entryId, conn)?.id)
        .filter((id) => id != null),
    [uniqueConnections, entryId]
  )

  // Create main sphere texture with text + title
  const mainTexture = useMemo(() => {
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
  }, [content, title])

  const handleMainNodeClick = async () => {
    history.push(`/edit-node-entry?entryId=${entryId}`)
  }

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
    // Set most recent node entry if no entryId OR if current entryId is not a Node type
    const shouldSetMostRecent = !entryId || (entryId && !nodeEntriesInfo?.some((node) => node.id === entryId))

    if (shouldSetMostRecent && Array.isArray(nodeEntriesInfo)) {
      const mostRecent = getMostRecentlyModifiedItem(nodeEntriesInfo)
      if (mostRecent?.id) {
        dispatch(setEntryById(mostRecent.id))
      }
    }
  }, [dispatch, entryId, nodeEntriesInfo])

  // Render global view if requested
  if (isGlobalView) {
    return <GlobalView />
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
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
        <NodeSearch mode="navigate" placeholder="Search to explore..." className={styles.searchComponent} />
      </div>
      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            <group>
              {/* Main Node sphere */}
              <SphereWithEffects
                id={entryId}
                pos={mainNodePosition}
                title={title}
                size={LOCAL_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
                mainTexture={mainTexture}
                onClick={handleMainNodeClick}
                rotation={[0, 4.7, 0]}
              />
            </group>

            {/* LINES Connection to main - render first */}
            <group>
              {uniqueConnections?.map((conn) => {
                const pos = positions[conn.id]
                if (!pos) return null

                // Calculate line start/end points to avoid overlapping spheres
                const isExternal = conn.connection_type === EXTERNAL
                const connectionTypeScale = getConnectionDistanceScale(conn.connection_type)
                const extensionFactor =
                  (isExternal ? externalDistanceFactor : lineExtensionFactor) *
                  LOCAL_EXPLORE_CONNECTION_DISTANCE_SCALE *
                  connectionTypeScale
                const endPos = new THREE.Vector3(...pos)
                  .multiplyScalar(extensionFactor)
                  .add(new THREE.Vector3(0, LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET, 0))
                const startPos = new THREE.Vector3(...mainNodePosition)

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
              {uniqueConnections?.map((conn) => {
                const transformed = transformConnection(entryId, conn)
                const pos = positions[conn.id]
                const hRotation = horizontalRotation[conn.id]
                const vRotation = verticalRotation[conn.id]
                if (!pos) return null

                const isExternal = conn.connection_type === EXTERNAL
                const connectionTypeScale = getConnectionDistanceScale(conn.connection_type)
                const extensionFactor =
                  (isExternal ? externalDistanceFactor : lineExtensionFactor) *
                  LOCAL_EXPLORE_CONNECTION_DISTANCE_SCALE *
                  connectionTypeScale
                const endPos = new THREE.Vector3(...pos)
                  .multiplyScalar(extensionFactor)
                  .add(new THREE.Vector3(0, LOCAL_EXPLORE_MAIN_NODE_Y_OFFSET, 0))

                const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)
                const sphereSize = getScaledSphereSize(
                  LOCAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION],
                  nodeInfo?.wdWordCount
                ) * LOCAL_EXPLORE_CONNECTION_SIZE_SCALE

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
                    <ConnectionSpheres
                      conn={conn}
                      connId={transformed.id}
                      position={endPos}
                      size={sphereSize}
                      handleConnectionSphereClick={handleConnectionSphereClick}
                      rotation={[vRotation, hRotation, 0]}
                      verticalOffset={subConnectionVerticalOffset[conn.id] || 0}
                      horizontalOffset={subConnectionHorizontalOffset[conn.id] || 0}
                      excludedNodeIds={[entryId, ...renderedFirstOrderNodeIds]}
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
