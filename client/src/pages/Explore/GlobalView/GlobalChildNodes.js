import React, { useMemo } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES, DEFAULT_CONNECTION_SPHERE_DISTANCE } from '@constants/spheres'

import { buildConnectionLinesForNodes } from '@utils/globalViewHelpers'

const positionChildNodes = (mainNode, childNodes) => {
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

  const positionedChildren = childNodes.map((entry, i) => {
    const { node } = entry

    let nonZeroI = i + 1

    const getLeftRightOffset = (index) => {
      return index % 2 === 0 ? '-' : ''
    }

    let offsetX = Number(`${getLeftRightOffset(nonZeroI)}${DEFAULT_CONNECTION_SPHERE_DISTANCE - 0.2}`)
    let offsetY = -0.4
    let offsetZ = i * 0.2

    // Apply offsetX and offsetY in the tangent plane (left/right, up/down)
    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    // Rotate around the main node's equator (horizontal plane at mainPosition.y).
    // This keeps the same horizontal distance from the main node while rotating.
    const basePos = mainPosition.clone().add(offsetVector)
    let worldPos = basePos

    if (Math.abs(offsetZ) > 0.001) {
      const rotationScale = Math.PI // 1.0 offsetZ = 180 degrees
      const rotationAngle = offsetZ * rotationScale
      const yAxis = new THREE.Vector3(0, 1, 0)

      const horizontalOffset = new THREE.Vector3(basePos.x - mainPosition.x, 0, basePos.z - mainPosition.z)
      horizontalOffset.applyAxisAngle(yAxis, rotationAngle)

      worldPos = new THREE.Vector3(mainPosition.x + horizontalOffset.x, basePos.y, mainPosition.z + horizontalOffset.z)
    }

    return {
      node,
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
}) => {
  // Position child nodes around the main node
  // NOTE: React Hooks must be called unconditionally and before any early returns
  const positionedNodes = useMemo(() => {
    if (!mainNode || !nodes?.length) return []
    return positionChildNodes(mainNode, nodes)
  }, [mainNode, nodes])

  // Build connection lines between main node and child nodes
  const connectionLines = useMemo(() => {
    if (!mainNode || !positionedNodes?.length) return []
    return buildConnectionLinesForNodes(mainNode, positionedNodes, firstOrderConnectionsMap)
  }, [mainNode, positionedNodes, firstOrderConnectionsMap])

  if (!nodes?.length) return null

  return (
    <>
      {/* Connection lines */}
      {connectionLines}

      {/* Child node spheres */}
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

export default GlobalChildNodes
