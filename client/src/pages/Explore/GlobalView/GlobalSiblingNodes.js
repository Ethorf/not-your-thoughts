import React, { useMemo } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'
import { buildConnectionLinesForNodes } from '@utils/globalViewHelpers'

// Positioning constants for siblings (matching local view logic)
const SPHERE_DIAMETER = 0.5 * 2
const MIN_SEPARATION = SPHERE_DIAMETER + 0.1
const SIBLING_DISTANCE_FROM_CENTER_SPHERE = 0.1
const OUTER_FACTOR = 1.1
const POSITION_SCALE = 0.2 // Scale factor for projecting onto sphere surface

const positionSiblingNodes = (mainNode, siblingNodes) => {
  if (!mainNode || !siblingNodes?.length) return []

  const mainPosition = mainNode.position instanceof THREE.Vector3 
    ? mainNode.position 
    : new THREE.Vector3(...mainNode.position)

  // Create a local coordinate system on the sphere surface
  const normal = mainPosition.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize() // left/right axis
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize() // up/down axis

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  // Position siblings using local view logic, then project onto sphere
  const positionedSiblings = siblingNodes.map((entry, i) => {
    const { node } = entry

    // Calculate local 2D position (same as local view)
    // Alternate left and right sides
    const side = i % 2 === 0 ? -1 : 1
    const localX = side * (SPHERE_DIAMETER + SIBLING_DISTANCE_FROM_CENTER_SPHERE)
    const localY = Math.floor(i / 2) * MIN_SEPARATION * (i % 2 === 0 ? 1 : -1)

    // Scale and apply outer factor (matching local view)
    const scaledLocalX = localX * OUTER_FACTOR * POSITION_SCALE
    const scaledLocalY = localY * OUTER_FACTOR * POSITION_SCALE

    // Project local position onto sphere surface using tangent vectors
    const worldPos = mainPosition.clone()
    worldPos.x += tangent1.x * scaledLocalX + tangent2.x * scaledLocalY
    worldPos.y += tangent1.y * scaledLocalX + tangent2.y * scaledLocalY
    worldPos.z += tangent1.z * scaledLocalX + tangent2.z * scaledLocalY

    // Normalize to stay on sphere surface, maintain radius
    worldPos.normalize().multiplyScalar(mainPosition.length())

    return {
      node,
      position: worldPos,
    }
  })

  return positionedSiblings
}

/**
 * Renders sibling first-order nodes and their connection lines in the Global View.
 * Handles its own positioning logic for siblings.
 */
const GlobalSiblingNodes = ({ mainNode, nodes, firstOrderConnectionsMap, nodeTextures, onNodeClick, getSphereRotation }) => {
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

  if (!nodes?.length) return null

  return (
    <>
      {/* Connection lines */}
      {connectionLines}

      {/* Sibling node spheres */}
      {positionedNodes.map(({ node, position }) => (
        <SphereWithEffects
          key={node.id}
          id={node.id}
          pos={position.toArray()}
          title={node.title}
          size={GLOBAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION]}
          mainTexture={nodeTextures.get(node.id)}
          onClick={() => onNodeClick(node.id)}
          rotation={getSphereRotation(position)}
        />
      ))}
    </>
  )
}

export default GlobalSiblingNodes
