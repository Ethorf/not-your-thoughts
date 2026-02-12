import React, { useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import {
  SPHERE_TYPES,
  GLOBAL_SPHERE_SIZES,
  getGlobalConnectionSphereSize,
  getEffectiveConnectionDistance,
  DEFAULT_CONNECTION_SPHERE_DISTANCE,
} from '@constants/spheres'
import { buildConnectionLinesForNodes } from '@utils/globalViewHelpers'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { claimGlobalRenderOwners } from '@redux/reducers/currentEntryReducer'
import GlobalSecondOrderNodes from './GlobalSecondOrderNodes'

export const positionChildNodes = (mainNode, childNodes) => {
  if (!mainNode || !childNodes?.length) return []

  const mainPosition =
    mainNode.position instanceof THREE.Vector3 ? mainNode.position : new THREE.Vector3(...mainNode.position)

  // Create a local coordinate system on the sphere surface
  const normal = mainPosition.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)

  // tangent1 = left/right axis (perpendicular to both normal and north pole)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()

  // tangent2 = up/down axis (perpendicular to both normal and tangent1)
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  const mainSize = GLOBAL_SPHERE_SIZES[SPHERE_TYPES.MAIN]
  const baseChildDistance = DEFAULT_CONNECTION_SPHERE_DISTANCE - 0.2
  const childSizes = childNodes.map((e) =>
    getGlobalConnectionSphereSize(
      e.totalConnectionCount ?? e.connectedNodes?.length ?? 0,
      GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]
    )
  )
  const maxChildSize = childSizes.length ? Math.max(...childSizes) : GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]
  const childDistance = getEffectiveConnectionDistance(baseChildDistance, mainSize, maxChildSize)
  const angleStep = (2 * Math.PI) / childNodes.length

  const positionedChildren = childNodes.map((entry, i) => {
    const offsetX = childDistance
    const offsetY = -0.4
    const angle = i * angleStep

    // Apply offset in the tangent plane (left/right, up/down)
    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    // Rotate around the main node's equator so children are equidistant.
    const basePos = mainPosition.clone().add(offsetVector)
    const yAxis = new THREE.Vector3(0, 1, 0)
    const horizontalOffset = new THREE.Vector3(basePos.x - mainPosition.x, 0, basePos.z - mainPosition.z)
    horizontalOffset.applyAxisAngle(yAxis, angle)

    const worldPos = new THREE.Vector3(
      mainPosition.x + horizontalOffset.x,
      basePos.y,
      mainPosition.z + horizontalOffset.z
    )

    return {
      ...entry,
      position: worldPos,
    }
  })

  return positionedChildren
}

/**
 * Renders child first-order nodes and their connection lines in the Global View.
 * Visually they use the same sizing as other first-order connections,
 * but are separated into their own layer for future styling if needed.
 */
const GlobalChildNodes = ({
  mainNode,
  nodes,
  firstOrderConnectionsMap,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  onNodeHover,
  clusterCenterTitle,
}) => {
  // Position child nodes around the main node
  // NOTE: React Hooks must be called unconditionally and before any early returns
  const positionedNodes = useMemo(() => {
    if (!mainNode || !nodes?.length) return []
    return positionChildNodes(mainNode, nodes)
  }, [mainNode, nodes])

  const dispatch = useDispatch()
  const globalRenderOwners = useSelector((state) => state.currentEntry.globalRenderOwners || {})
  const ownerId = mainNode?.node?.id
  const nodeIds = useMemo(() => positionedNodes.map((entry) => entry?.node?.id).filter(Boolean), [positionedNodes])

  useEffect(() => {
    if (!ownerId || !nodeIds.length) return
    const unowned = nodeIds.filter((id) => !globalRenderOwners[id])
    if (!unowned.length) return
    dispatch(claimGlobalRenderOwners({ ownerId, nodeIds: unowned }))
  }, [dispatch, ownerId, nodeIds, globalRenderOwners])

  const renderableNodes = useMemo(() => {
    if (!positionedNodes?.length || !ownerId) return []
    return positionedNodes.filter((entry) => {
      const nodeId = entry?.node?.id
      if (!nodeId) return false
      const owner = globalRenderOwners[nodeId]
      return !owner || owner === ownerId
    })
  }, [positionedNodes, globalRenderOwners, ownerId])

  // Build connection lines between main node and child nodes
  const connectionLines = useMemo(() => {
    if (!mainNode || !renderableNodes?.length) return []
    return buildConnectionLinesForNodes(mainNode, renderableNodes, firstOrderConnectionsMap)
  }, [mainNode, renderableNodes, firstOrderConnectionsMap])

  const secondOrderByParentId = useMemo(() => {
    if (!positionedNodes?.length) return new Map()

    const map = new Map()
    positionedNodes.forEach((entry) => {
      const connectedNodes = entry.connectedNodes || []
      const filtered = connectedNodes.filter((nodeEntry) => !mainNode || nodeEntry.node.id !== mainNode.node.id)
      if (filtered.length) {
        map.set(entry.node.id, filtered)
      }
    })

    return map
  }, [positionedNodes, mainNode])

  if (!nodes?.length) return null

  return (
    <>
      {/* Connection lines */}
      {connectionLines}

      {/* Child node spheres */}
      {renderableNodes.map((entry) => (
        <SphereWithEffects
          key={entry.node.id}
          id={entry.node.id}
          pos={entry.position.toArray()}
          title={entry.node.title}
          size={getGlobalConnectionSphereSize(
            entry.totalConnectionCount ?? entry.connectedNodes?.length ?? 0,
            GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]
          )}
          mainTexture={nodeTextures.get(entry.node.id)}
          onClick={() => onNodeClick(entry.node.id)}
          onHover={onNodeHover}
          hoverInfo={{
            nodeTitle: entry.node.title,
            clusterCenterTitle,
            connectionType: entry.node.connectionType || CONNECTION_TYPES.FRONTEND.CHILD,
            parentTitle: mainNode?.node?.title || null,
          }}
          rotation={getSphereRotation(entry.position)}
        />
      ))}

      {renderableNodes.map((parentEntry) => {
        const secondOrderNodesForParent = secondOrderByParentId.get(parentEntry.node.id)
        if (!secondOrderNodesForParent?.length) return null

        return (
          <GlobalSecondOrderNodes
            key={`second-order-children-${parentEntry.node.id}`}
            anchorNode={parentEntry}
            nodes={secondOrderNodesForParent}
            nodeTextures={nodeTextures}
            onNodeClick={onNodeClick}
            getSphereRotation={getSphereRotation}
            onNodeHover={onNodeHover}
            clusterCenterTitle={clusterCenterTitle}
          />
        )
      })}
    </>
  )
}

export default GlobalChildNodes
