import React, { Suspense, useMemo, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import ConnectionSpheres from '@components/Spheres/ConnectionSpheres.js'
import PublicConnectionSpheres from '@components/Spheres/PublicConnectionSpheres.js'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'

import { setEntryById } from '@redux/reducers/currentEntryReducer'

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

import { transformConnection } from '@utils/transformConnection'
import extractTextFromHTML from '@utils/extractTextFromHTML'
import calculateSpherePositions from '@utils/calculateSpherePositions'

import styles from './Explore.module.scss'

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

function getScaledSphereSize(baseSize, wordCount) {
  if (!wordCount || wordCount <= 0) return baseSize
  const factor = Math.log10(wordCount + 1) / 5
  const delta = Math.min(Math.max(factor, -0.5), 0.2)
  return baseSize * (1 + delta)
}

/**
 * Single local 3D node network scene (same layout as authenticated Explore).
 *
 * @param {string|null} publicOwnerUserId – When set, sub-connection orbs use the public API and
 *   internal navigation keeps `?userId=` on `/explore`.
 * @param {boolean} mainNodeGoesToEdit – When true, main sphere opens private edit; otherwise public read view.
 */
const LocalNodeNetworkView = ({
  entryId,
  title,
  content,
  connections,
  nodeEntriesInfo = [],
  publicOwnerUserId = null,
  mainNodeGoesToEdit,
}) => {
  const history = useHistory()
  const dispatch = useDispatch()

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

  const handleMainNodeClick = useCallback(() => {
    if (!entryId) return
    if (mainNodeGoesToEdit) {
      history.push(`/edit-node-entry?entryId=${entryId}`)
      return
    }
    if (publicOwnerUserId) {
      history.push(`/show-node-entry?userId=${publicOwnerUserId}&entryId=${entryId}`)
    }
  }, [entryId, history, mainNodeGoesToEdit, publicOwnerUserId])

  const handleConnectionSphereClick = useCallback(
    async (id, conn) => {
      if (conn.connection_type === EXTERNAL) {
        if (conn.foreign_source) {
          window.open(conn.foreign_source, '_blank', 'noopener,noreferrer')
        }
        return
      }
      if (publicOwnerUserId && id) {
        history.push(`/explore?userId=${publicOwnerUserId}&entryId=${id}`)
        return
      }
      await dispatch(setEntryById(id))
      history.replace({ pathname: '/explore', search: `?entryId=${id}` })
    },
    [dispatch, history, publicOwnerUserId]
  )

  return (
    <div className={styles.nodesWrapper}>
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight />
        <directionalLight position={[5, 5, 5]} />

        <Suspense fallback={null}>
          <group>
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

          <group>
            {uniqueConnections?.map((conn) => {
              const pos = positions[conn.id]
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
              const startPos = new THREE.Vector3(...mainNodePosition)

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
              }
              const curve = new THREE.CatmullRomCurve3(points)
              const geometry = new THREE.TubeGeometry(curve, 8, 0.02, 4, false)

              return (
                <mesh key={`line-${conn.id}`} geometry={geometry} renderOrder={0}>
                  <meshBasicMaterial color="white" depthWrite={false} depthTest={false} />
                </mesh>
              )
            })}
          </group>

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
              const sphereSize =
                getScaledSphereSize(LOCAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION], nodeInfo?.wdWordCount) *
                LOCAL_EXPLORE_CONNECTION_SIZE_SCALE

              return (
                <React.Fragment key={conn.id}>
                  <SphereWithEffects
                    id={transformed.id}
                    pos={endPos}
                    title={transformed.title}
                    size={sphereSize}
                    conn={conn}
                    onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                    rotation={[vRotation, hRotation, 0]}
                  />

                  {publicOwnerUserId ? (
                    <PublicConnectionSpheres
                      conn={conn}
                      connId={transformed.id}
                      userId={publicOwnerUserId}
                      position={endPos}
                      size={sphereSize}
                      handleConnectionSphereClick={handleConnectionSphereClick}
                      rotation={[vRotation, hRotation, 0]}
                      verticalOffset={subConnectionVerticalOffset[conn.id] || 0}
                      horizontalOffset={subConnectionHorizontalOffset[conn.id] || 0}
                      currentEntryId={entryId}
                      graphCenter={mainNodePosition}
                      excludedNodeIds={[entryId, ...renderedFirstOrderNodeIds]}
                    />
                  ) : (
                    <ConnectionSpheres
                      conn={conn}
                      connId={transformed.id}
                      position={endPos}
                      size={sphereSize}
                      handleConnectionSphereClick={handleConnectionSphereClick}
                      rotation={[vRotation, hRotation, 0]}
                      verticalOffset={subConnectionVerticalOffset[conn.id] || 0}
                      horizontalOffset={subConnectionHorizontalOffset[conn.id] || 0}
                      graphCenter={mainNodePosition}
                      excludedNodeIds={[entryId, ...renderedFirstOrderNodeIds]}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}

export default LocalNodeNetworkView
