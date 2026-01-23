import React, { useMemo } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'
import { buildConnectionLinesForNodes } from '@utils/globalViewHelpers'

// Positioning constants for siblings (if needed for offset calculations)

const positionSiblingNodes = (mainNode, siblingNodes) => {
  if (!mainNode || !siblingNodes?.length) return []

  const mainPosition = mainNode.position instanceof THREE.Vector3 
    ? mainNode.position 
    : new THREE.Vector3(...mainNode.position)

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

  const positionedSiblings = siblingNodes.map((entry, i) => {
    const { node } = entry

    // Start with main node's position (siblings default to being on top of main node)
    let worldPos = mainPosition.clone()

    // Apply offset relative to main node
    // Modify these x, y, z values to position each sibling
    let offsetX = 0
    let offsetY = 0
    let offsetZ = 0
    let usefulIndex = i + 1

    // Default positioning: distribute evenly around equator
    // You can override these per-index or modify the logic

    const getLeftRightOffset = (usefulI) => {

      return usefulIndex % 2 === 0 ? "-" : "" 
    }
    
    if (i === 0) {
      // Sibling 1: left
      offsetX = -0.3
      offsetY = 0
      offsetZ = -0.7
    } else if (i === 1) {
      // Sibling 2: right
      offsetX = 0.2
      offsetY = 0
      offsetZ = 0
    } else if (i === 2) {
      // Sibling 3: customize this one
      offsetX = 0
      offsetY = 0
      offsetZ = 0
    } else if (i === 3) {
      // Sibling 4: customize this one
      offsetX = 0
      offsetY = 0
      offsetZ = 0
    }

    // Apply offsetX and offsetY in the tangent plane (left/right, up/down)
    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    // Rotate around the main node's equator (horizontal plane at mainPosition.y).
    // This keeps the same horizontal distance from the main node while rotating.
    const basePos = mainPosition.clone().add(offsetVector)
    if (Math.abs(offsetZ) > 0.001) {
      const rotationScale = Math.PI // 1.0 offsetZ = 180 degrees
      const rotationAngle = offsetZ * rotationScale
      const yAxis = new THREE.Vector3(0, 1, 0)

      const horizontalOffset = new THREE.Vector3(
        basePos.x - mainPosition.x,
        0,
        basePos.z - mainPosition.z
      )
      horizontalOffset.applyAxisAngle(yAxis, rotationAngle)

      worldPos = new THREE.Vector3(
        mainPosition.x + horizontalOffset.x,
        basePos.y,
        mainPosition.z + horizontalOffset.z
      )
    } else {
      worldPos = basePos
    }

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
