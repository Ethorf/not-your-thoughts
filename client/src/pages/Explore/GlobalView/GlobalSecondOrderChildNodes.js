import React, { useMemo } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES, SECOND_ORDER_CONNECTION_SPHERE_DISTANCE } from '@constants/spheres'
import useGlobalSecondOrderConnections from '@hooks/useGlobalSecondOrderConnections'
import GlobalSecondOrderNodes from './GlobalSecondOrderNodes'

const buildSolidLines = (parentNode, positionedNodes) => {
  if (!parentNode || !positionedNodes?.length) return []

  const lines = []
  const drawnConnections = new Set()
  const allNodes = [parentNode, ...positionedNodes]

  allNodes.forEach(({ node, position: posA }) => {
    const connectedNodes = node.id === parentNode.node.id ? positionedNodes.map((n) => n.node.id) : [parentNode.node.id]

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
}

export const positionSecondOrderChildren = (parentNode, childNodes) => {
  if (!parentNode || !childNodes?.length) return []

  const parentPosition =
    parentNode.position instanceof THREE.Vector3 ? parentNode.position : new THREE.Vector3(...parentNode.position)

  const normal = parentPosition.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  return childNodes.map((entry, i) => {
    const nonZeroI = i + 1
    const alternatingXSides = nonZeroI % 2 === 0 ? -1 : 1
    const sideSign =
      typeof parentNode?.sideSign === 'number' && parentNode.sideSign !== 0 ? parentNode.sideSign : alternatingXSides

    const offsetX = sideSign * SECOND_ORDER_CONNECTION_SPHERE_DISTANCE
    const offsetY = -0.25
    const offsetZ = i * 0.2

    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    const basePos = parentPosition.clone().add(offsetVector)
    let worldPos = basePos

    if (Math.abs(offsetZ) > 0.001) {
      const rotationScale = Math.PI
      const rotationAngle = offsetZ * rotationScale
      const yAxis = new THREE.Vector3(0, 1, 0)

      const horizontalOffset = new THREE.Vector3(basePos.x - parentPosition.x, 0, basePos.z - parentPosition.z)
      horizontalOffset.applyAxisAngle(yAxis, rotationAngle)

      worldPos = new THREE.Vector3(
        parentPosition.x + horizontalOffset.x,
        basePos.y,
        parentPosition.z + horizontalOffset.z
      )
    }

    return {
      ...entry,
      position: worldPos,
    }
  })
}

const GlobalSecondOrderChildNodes = ({
  parentNode,
  nodes,
  positionedNodes,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  depth = 1,
  maxDepth = 2,
}) => {
  const computedNodes = useMemo(() => {
    if (!parentNode || !nodes?.length) return []
    return positionSecondOrderChildren(parentNode, nodes)
  }, [parentNode, nodes])

  const finalNodes = positionedNodes?.length ? positionedNodes : computedNodes
  const connectionLines = useMemo(() => buildSolidLines(parentNode, finalNodes), [parentNode, finalNodes])
  const connectionsByNodeId = useGlobalSecondOrderConnections(finalNodes)

  if (!finalNodes?.length) return null

  return (
    <>
      {connectionLines}
      {finalNodes.map(({ node, position }) => (
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
      {depth < maxDepth &&
        finalNodes.map((parentEntry) => {
          const connectedNodes = connectionsByNodeId.get(parentEntry.node.id)
          if (!connectedNodes?.length) return null
          return (
            <GlobalSecondOrderNodes
              key={`third-order-children-${parentEntry.node.id}`}
              parentNode={parentEntry}
              nodes={connectedNodes}
              depth={depth + 1}
              maxDepth={maxDepth}
              nodeTextures={nodeTextures}
              onNodeClick={onNodeClick}
              getSphereRotation={getSphereRotation}
            />
          )
        })}
    </>
  )
}

export default GlobalSecondOrderChildNodes
