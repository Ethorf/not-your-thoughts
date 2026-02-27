import React, { Suspense, useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'

// Styles
import styles from './GlobalView.module.scss'
import TextButton from '@components/Shared/TextButton/TextButton'
import NodeSearch from '@components/Shared/NodeSearch/NodeSearch'

// Components
import CameraController from './CameraController'
import GradientGlobe from './GradientGlobe'
import GlobalClusterView from './GlobalClusterView'
import FocusedEntryRing from './FocusedEntryRing'
import useGlobalGraphPipeline from './useGlobalGraphPipeline'
import { FaceCameraProvider } from '@components/Spheres/SphereWithEffects'

// Utils
import extractTextFromHTML from '@utils/extractTextFromHTML'
import { buildGlobalHoverInfo } from './hoverInfoHelpers'

const formatHoverDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString()
}

const getWordCount = (content) => {
  if (!content) return 0
  const rawText = Array.isArray(content) ? content.join(' ') : content
  const cleanText = extractTextFromHTML(String(rawText))
  if (!cleanText.trim()) return 0
  return cleanText.trim().split(/\s+/).filter(Boolean).length
}

const SceneDebugReader = ({ hoveredNodeId, debugRef }) => {
  const { camera, scene } = useThree()

  const pos = useMemo(() => {
    if (!hoveredNodeId) return null
    const obj = scene.getObjectByName(`node-sphere-${hoveredNodeId}`)
    if (!obj) return null
    const wp = new THREE.Vector3()
    obj.getWorldPosition(wp)
    return wp
  }, [hoveredNodeId, scene])

  if (debugRef) {
    debugRef.current = {
      cameraPos: camera.position.clone(),
      nodeWorldPos: pos,
    }
  }

  return null
}

const GlobalView = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const { allConnections, connectionsLoading } = useSelector((state) => state.connections)
  const { entryId, entriesLoading } = useSelector((state) => state.currentEntry)
  const { cache: globalViewCache, invalidated: globalViewInvalidated } = useSelector((state) => state.globalViewCache)
  const [hoverInfo, setHoverInfo] = useState(null)
  const [focusDismissSignal, setFocusDismissSignal] = useState(0)
  const controlsRef = useRef()
  const sceneDebugRef = useRef({ cameraPos: null, nodeWorldPos: null })
  const {
    clusterViews,
    nodeTextures,
    allNodesForTextures,
    hasClustersToProcess,
    isPositioningClusters,
    positioningProgress,
  } = useGlobalGraphPipeline({
    nodeEntriesInfo,
    allConnections,
    connectionsLoading,
    globalViewCache,
    globalViewInvalidated,
    dispatch,
  })

  const handleCameraChange = useCallback(() => {
    // Kept for OrbitControls onChange; can extend for camera position display
  }, [])

  const dismissFocusedRing = useCallback(() => {
    setFocusDismissSignal((value) => value + 1)
  }, [])

  const handleNodeClick = useCallback(
    async (nodeId) => {
      dismissFocusedRing()
      await dispatch(setEntryById(nodeId))
      history.push(`/explore?entryId=${nodeId}`)
    },
    [dismissFocusedRing, dispatch, history]
  )

  const handleNodeFocus = useCallback(
    async (nodeId) => {
      if (typeof nodeId !== 'number') return
      dismissFocusedRing()
      await dispatch(setEntryById(nodeId))
    },
    [dismissFocusedRing, dispatch]
  )

  const handleNodeHover = useCallback(
    (info) => {
      if (info) {
        setHoverInfo(info)
      }
    },
    []
  )

  useEffect(() => {
    if (hoverInfo || !entryId || !clusterViews?.length) return

    const entryIdStr = String(entryId)
    for (const view of clusterViews) {
      const mainMatch = view?.mainNode?.node?.id != null && String(view.mainNode.node.id) === entryIdStr
        ? view.mainNode
        : null
      if (mainMatch) {
        setHoverInfo(buildGlobalHoverInfo({
          entry: mainMatch,
          clusterCenterTitle: mainMatch.node?.title,
          connectionType: 'main',
          parentTitle: null,
        }))
        return
      }

      const firstOrderMatch = (view?.firstOrderNodes || []).find(
        (e) => e?.node?.id != null && String(e.node.id) === entryIdStr
      )
      if (firstOrderMatch) {
        setHoverInfo(buildGlobalHoverInfo({
          entry: firstOrderMatch,
          clusterCenterTitle: view?.mainNode?.node?.title,
          connectionType: firstOrderMatch.connectionType || null,
          parentTitle: view?.mainNode?.node?.title || null,
        }))
        return
      }
    }
  }, [entryId, clusterViews, hoverInfo])

  const handleUserCameraInteraction = useCallback(() => {
    dismissFocusedRing()
  }, [dismissFocusedRing])

  // Show loading when fetching data, positioning, or when we have clusters to process but no views yet (prevents first-frame flash)
  const isLoading =
    entriesLoading ||
    (connectionsLoading && (!allConnections?.length || globalViewInvalidated)) ||
    isPositioningClusters ||
    (hasClustersToProcess && clusterViews.length === 0)

  // Loading progress: entries 0%, connections 10%, positioning 0-100%
  const loadingPercent = isLoading
    ? entriesLoading
      ? 0
      : connectionsLoading && (!allConnections?.length || globalViewInvalidated)
        ? 10
        : Math.round(positioningProgress * 100)
    : 100
  const hoverConnectionCount = hoverInfo?.connectionCount ?? 0
  const hoverWordCount = getWordCount(hoverInfo?.content)
  const hoverTitle = hoverInfo?.nodeTitle || hoverInfo?.clusterCenterTitle || 'Untitled'

  const formatVec = (v) => (v ? `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})` : 'N/A')
  const debugData = sceneDebugRef.current

  // Calculate rotation so sphere texture faces the camera
  const getSphereRotation = useCallback((spherePosition) => {
    // Calculate the angle from the sphere to the camera view
    const direction = new THREE.Vector3(spherePosition.x, 0, spherePosition.z).normalize()
    const angle = Math.atan2(direction.x, direction.z)

    return [0, angle + 4.5, 0] // Add base offset of 4.7
  }, [])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>{user.name}'s Global Mind Map</h1>
        <TextButton
          className={styles.backButton}
          onClick={() => history.push('/explore')}
          tooltip="Return to Local View"
        >
          ← Local View
        </TextButton>
        <NodeSearch
          mode="focus"
          placeholder="Search to focus..."
          className={styles.searchComponent}
          onNodeSelect={(node) => handleNodeFocus(node?.id)}
        />
      </div>
      <div className={styles.globeContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <span className={styles.loadingText}>Mapping mind network...</span>
            <div className={styles.loadingBar}>
              <div className={styles.loadingBarFill} style={{ width: `${loadingPercent}%` }} />
            </div>
            <span className={styles.loadingPercent}>{loadingPercent}%</span>
          </div>
        )}
        <Canvas camera={{ position: [0, 0, 5] }} onPointerDown={handleUserCameraInteraction}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />

          <Suspense fallback={null}>
            <FaceCameraProvider>
              <CameraController nodePositions={allNodesForTextures} entryId={entryId} controlsRef={controlsRef} />
              <SceneDebugReader hoveredNodeId={hoverInfo?.nodeId} debugRef={sceneDebugRef} />

              <GradientGlobe isLoading={isLoading} />

              <FocusedEntryRing entryId={entryId} dismissSignal={focusDismissSignal} />

              {clusterViews.map((view, index) => (
                <GlobalClusterView
                  key={view.mainNode?.node?.id ?? `cluster-${index}`}
                  mainNode={view.mainNode}
                  firstOrderNodes={view.firstOrderNodes}
                  firstOrderConnectionsMap={view.firstOrderConnectionsMap}
                  nodeTextures={nodeTextures}
                  onNodeClick={handleNodeClick}
                  onNodeHover={handleNodeHover}
                  getSphereRotation={getSphereRotation}
                />
              ))}
            </FaceCameraProvider>
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={12}
            onChange={handleCameraChange}
            onStart={handleUserCameraInteraction}
          />
        </Canvas>
      </div>

      <div className={`${styles.info} ${hoverInfo ? '' : styles.infoHidden}`}>
        <h2 className={styles.nodeTitle}>{hoverTitle}</h2>
        <div className={styles.nodeInfo}>
          {hoverConnectionCount > 0 && (
            <>
              <p>
                Cluster Center: <span className={styles.infoValue}>{hoverInfo?.clusterCenterTitle || ''}</span>
              </p>
              <p>
                Connections: <span className={styles.infoValue}>{hoverConnectionCount}</span>
              </p>
            </>
          )}
          <p>
            Date Created: <span className={styles.infoValue}>{formatHoverDate(hoverInfo?.dateCreated)}</span>
          </p>
          <p>
            Date Updated: <span className={styles.infoValue}>{formatHoverDate(hoverInfo?.dateUpdated)}</span>
          </p>
          <p>
            Words: <span className={styles.infoValue}>{hoverWordCount}</span>
          </p>
          <p>
            Node World Pos: <span className={styles.infoValue}>{formatVec(debugData?.nodeWorldPos)}</span>
          </p>
          <p>
            Camera Pos: <span className={styles.infoValue}>{formatVec(debugData?.cameraPos)}</span>
          </p>
          {/* <DefaultButton
            tooltip="Open connections menu"
            onClick={() => handleOpenConnectionsModalForNode(hoverNodeId)}
            disabled={!canOpenHoverConnections}
          >
            Connections
          </DefaultButton> */}
        </div>
      </div>
    </div>
  )
}

export default GlobalView
