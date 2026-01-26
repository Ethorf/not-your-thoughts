import React, { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES, DEFAULT_CONNECTION_SPHERE_DISTANCE } from '@constants/spheres'

const DashedLine = ({ lineKey, points, color = 'white', dashSize = 0.03, gapSize = 0.02 }) => {
  const lineRef = useRef(null)

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances()
    }
  }, [geometry])

  return (
    <line ref={lineRef} key={lineKey} geometry={geometry}>
      <lineDashedMaterial color={color} dashSize={dashSize} gapSize={gapSize} />
    </line>
  )
}

const buildDashedConnectionLinesForNodes = (mainNode, targetNodes, firstOrderConnectionsMap) => {
  if (!mainNode || !targetNodes?.length) return []

  const lines = []
  const drawnConnections = new Set()
  const allNodes = [mainNode, ...targetNodes]

  allNodes.forEach(({ node, position: posA }) => {
    const connectedNodes = firstOrderConnectionsMap.get(node.id) || new Set()

    connectedNodes.forEach((connectedNodeId) => {
      const isTargetNode = targetNodes.some((n) => n.node.id === connectedNodeId)
      const isMainNode = connectedNodeId === mainNode.node.id

      if (!isTargetNode && !isMainNode) return

      const connectionKey = [node.id, connectedNodeId].sort().join('-')
      if (drawnConnections.has(connectionKey)) return

      drawnConnections.add(connectionKey)

      const connectedNode = allNodes.find(({ node: n }) => n.id === connectedNodeId)
      if (!connectedNode) return

      const posB = connectedNode.position
      const points = [new THREE.Vector3(posA.x, posA.y, posA.z), new THREE.Vector3(posB.x, posB.y, posB.z)]
      const line = (
        <DashedLine
          key={connectionKey}
          lineKey={connectionKey}
          points={points}
          color="white"
          dashSize={0.03}
          gapSize={0.02}
        />
      )
      lines.push(line)
    })
  })

  return lines
}

const positionExternalNodes = (mainNode, externalNodes) => {
  if (!mainNode || !externalNodes?.length) return []

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

  const externalDistance = DEFAULT_CONNECTION_SPHERE_DISTANCE - 0.1
  const angleStep = (2 * Math.PI) / externalNodes.length

  const positionedExternal = externalNodes.map((entry, i) => {
    const { node } = entry

    const offsetX = externalDistance
    const offsetY = 0.4
    const angle = i * angleStep

    // Apply offset in the tangent plane (left/right, up/down)
    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    // Rotate around the main node's equator so externals are equidistant.
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
      node,
      position: worldPos,
    }
  })

  return positionedExternal
}

/**
 * Renders external first-order nodes and their connection lines in the Global View.
 */
const GlobalExternalNodes = ({
  mainNode,
  nodes,
  firstOrderConnectionsMap,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
}) => {
  // Position external nodes around the main node
  // NOTE: React Hooks must be called unconditionally and before any early returns
  const positionedNodes = useMemo(() => {
    if (!mainNode || !nodes?.length) return []
    return positionExternalNodes(mainNode, nodes)
  }, [mainNode, nodes])

  // Build connection lines between main node and external nodes
  const connectionLines = useMemo(() => {
    if (!mainNode || !positionedNodes?.length) return []
    return buildDashedConnectionLinesForNodes(mainNode, positionedNodes, firstOrderConnectionsMap)
  }, [mainNode, positionedNodes, firstOrderConnectionsMap])

  if (!nodes?.length) return null

  return (
    <>
      {/* Connection lines */}
      {connectionLines}

      {/* External node spheres */}
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

export default GlobalExternalNodes
