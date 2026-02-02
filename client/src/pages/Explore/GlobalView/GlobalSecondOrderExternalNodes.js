import React, { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES, DEFAULT_CONNECTION_SPHERE_DISTANCE } from '@constants/spheres'
import useGlobalSecondOrderConnections from '@hooks/useGlobalSecondOrderConnections'
import GlobalSecondOrderNodes from './GlobalSecondOrderNodes'

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

const buildDashedLines = (parentNode, positionedNodes) => {
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
      lines.push(
        <DashedLine
          key={connectionKey}
          lineKey={connectionKey}
          points={points}
          color="white"
          dashSize={0.03}
          gapSize={0.02}
        />
      )
    })
  })

  return lines
}

export const positionSecondOrderExternals = (parentNode, externalNodes) => {
  if (!parentNode || !externalNodes?.length) return []

  const parentPosition =
    parentNode.position instanceof THREE.Vector3 ? parentNode.position : new THREE.Vector3(...parentNode.position)

  const normal = parentPosition.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  const offsetY = 0.4
  const externalDistance = DEFAULT_CONNECTION_SPHERE_DISTANCE - 0.1
  const angleStep = (2 * Math.PI) / externalNodes.length

  return externalNodes.map((entry, i) => {
    const offsetX = externalDistance
    const angle = i * angleStep

    const offsetVector = new THREE.Vector3()
    offsetVector.addScaledVector(tangent1, offsetX)
    offsetVector.addScaledVector(tangent2, offsetY)

    const basePos = parentPosition.clone().add(offsetVector)
    const yAxis = new THREE.Vector3(0, 1, 0)
    const horizontalOffset = new THREE.Vector3(basePos.x - parentPosition.x, 0, basePos.z - parentPosition.z)
    horizontalOffset.applyAxisAngle(yAxis, angle)

    const worldPos = new THREE.Vector3(
      parentPosition.x + horizontalOffset.x,
      basePos.y,
      parentPosition.z + horizontalOffset.z
    )

    return {
      ...entry,
      position: worldPos,
    }
  })
}

const GlobalSecondOrderExternalNodes = ({
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
    return positionSecondOrderExternals(parentNode, nodes)
  }, [parentNode, nodes])

  const finalNodes = positionedNodes?.length ? positionedNodes : computedNodes
  const connectionLines = useMemo(() => buildDashedLines(parentNode, finalNodes), [parentNode, finalNodes])
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
              key={`third-order-externals-${parentEntry.node.id}`}
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

export default GlobalSecondOrderExternalNodes
