import React, { useMemo } from 'react'
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
import GlobalSecondOrderNodes from './GlobalSecondOrderNodes'
import { buildGlobalHoverInfo } from './hoverInfoHelpers'

// Positioning constants for siblings (if needed for offset calculations)

export const positionSiblingNodes = (mainNode, siblingNodes) => {
  if (!mainNode || !siblingNodes?.length) return []

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
  const siblingSizes = siblingNodes.map((e) =>
    getGlobalConnectionSphereSize(
      e.totalConnectionCount ?? e.connectedNodes?.length ?? 0,
      GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]
    )
  )
  const maxSiblingSize = siblingSizes.length ? Math.max(...siblingSizes) : GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]
  const effectiveSiblingDist = getEffectiveConnectionDistance(DEFAULT_CONNECTION_SPHERE_DISTANCE, mainSize, maxSiblingSize)

  // Use consistent offset direction and spread purely by angle (like child/external nodes).
  // Alternating offsetX + rotation caused overlap when n=2: -dist rotated by π equals +dist.
  const angleStep = (2 * Math.PI) / siblingNodes.length
  const basePhase = 0.7 // Slight phase so first node isn't exactly on tangent1
  const sideSign =
    typeof mainNode?.sideSign === 'number' && mainNode.sideSign !== 0 ? mainNode.sideSign : 1

  const positionedSiblings = siblingNodes.map((entry, i) => {
    const offsetX = sideSign * effectiveSiblingDist
    const offsetY = 0
    const angle = basePhase + i * angleStep

    // Apply offset in the tangent plane (left/right, up/down)
    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    // Rotate around the main node's equator so siblings are equidistant.
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
      sideSign,
    }
  })

  return positionedSiblings
}

/**
 * Renders sibling first-order nodes and their connection lines in the Global View.
 * Handles its own positioning logic for siblings.
 */
const GlobalSiblingNodes = ({
  mainNode,
  nodes,
  firstOrderConnectionsMap,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  onNodeHover,
  clusterCenterTitle,
}) => {
  // Position sibling nodes around the main node
  // NOTE: React Hooks must be called unconditionally and before any early returns
  const positionedNodes = useMemo(() => {
    if (!mainNode || !nodes?.length) return []
    return positionSiblingNodes(mainNode, nodes)
  }, [mainNode, nodes])

  // Build connection lines between main node and sibling nodes
  const connectionLines = useMemo(() => {
    if (!mainNode || !positionedNodes?.length) return []
    return buildConnectionLinesForNodes(mainNode, positionedNodes, firstOrderConnectionsMap)
  }, [mainNode, positionedNodes, firstOrderConnectionsMap])

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

      {/* Sibling node spheres */}
      {positionedNodes.map((entry) => (
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
          hoverInfo={buildGlobalHoverInfo({
            entry,
            clusterCenterTitle,
            connectionType: entry.node.connectionType || CONNECTION_TYPES.FRONTEND.SIBLING,
            parentTitle: mainNode?.node?.title || null,
          })}
          rotation={getSphereRotation(entry.position)}
        />
      ))}
      {/* THIRD ORDER AND HIGHER ORDER NODES */}
      {positionedNodes.map((parentEntry) => {
        const secondOrderNodesForParent = secondOrderByParentId.get(parentEntry.node.id)
        if (!secondOrderNodesForParent?.length) return null

        return (
          <GlobalSecondOrderNodes
            key={`second-order-siblings-${parentEntry.node.id}`}
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

export default GlobalSiblingNodes
