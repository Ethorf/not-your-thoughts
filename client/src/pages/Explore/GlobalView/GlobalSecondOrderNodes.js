import React, { useMemo } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES } from '@constants/spheres'

/**
 * Renders second-order sibling nodes and their connection lines for a given parent.
 */
const GlobalSecondOrderNodes = ({
  parentNode,
  nodes,
  positionNodes,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
}) => {
  const positionedNodes = useMemo(() => {
    if (!parentNode || !nodes?.length || !positionNodes) return []
    return positionNodes(parentNode, nodes)
  }, [parentNode, nodes, positionNodes])

  const connectionLines = useMemo(() => {
    if (!parentNode || !positionedNodes?.length) return []

    const lines = []
    const drawnConnections = new Set()
    const allNodes = [parentNode, ...positionedNodes]

    allNodes.forEach(({ node, position: posA }) => {
      const connectedNodes = node.id === parentNode.node.id
        ? positionedNodes.map((n) => n.node.id)
        : [parentNode.node.id]

      connectedNodes.forEach((connectedNodeId) => {
        const connectionKey = [node.id, connectedNodeId].sort().join('-')
        if (drawnConnections.has(connectionKey)) return

        drawnConnections.add(connectionKey)

        const connectedNode = allNodes.find(({ node: n }) => n.id === connectedNodeId)
        if (!connectedNode) return

        const posB = connectedNode.position
        const points = [new THREE.Vector3(posA.x, posA.y, posA.z), new THREE.Vector3(posB.x, posB.y, posB.z)]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        lines.push(
          <line key={connectionKey} geometry={geometry}>
            <lineBasicMaterial color="white" />
          </line>
        )
      })
    })

    return lines
  }, [parentNode, positionedNodes])

  if (!nodes?.length) return null

  return (
    <>
      {connectionLines}
      {positionedNodes.map(({ node, position }) => (
        <SphereWithEffects
          key={node.id}
          id={node.id}
          pos={position.toArray()}
          title={node.title}
          size={GLOBAL_SPHERE_SIZES[SPHERE_TYPES.SECOND_ORDER_CONNECTION]}
          mainTexture={nodeTextures.get(node.id)}
          onClick={() => onNodeClick(node.id)}
          rotation={getSphereRotation(position)}
        />
      ))}
    </>
  )
}

export default GlobalSecondOrderNodes
