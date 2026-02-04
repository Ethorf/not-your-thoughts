import React, { useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as THREE from 'three'
import SphereWithEffects from '@components/Spheres/SphereWithEffects.js'
import { SPHERE_TYPES, GLOBAL_SPHERE_SIZES, SECOND_ORDER_CONNECTION_SPHERE_DISTANCE } from '@constants/spheres'
import useGlobalSecondOrderConnections from '@hooks/useGlobalSecondOrderConnections'
import { claimGlobalRenderOwners } from '@redux/reducers/currentEntryReducer'
import GlobalSecondOrderNodes from './GlobalSecondOrderNodes'

const buildSolidLines = (anchorNode, positionedNodes) => {
  if (!anchorNode || !positionedNodes?.length) return []

  const lines = []
  const drawnConnections = new Set()
  const allNodes = [anchorNode, ...positionedNodes]

  allNodes.forEach(({ node, position: posA }) => {
    const connectedNodes = node.id === anchorNode.node.id ? positionedNodes.map((n) => n.node.id) : [anchorNode.node.id]

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

export const positionSecondOrderChildren = (anchorNode, childNodes, depth = 1) => {
  if (!anchorNode || !childNodes?.length) return []

  const parentPosition =
    anchorNode.position instanceof THREE.Vector3 ? anchorNode.position : new THREE.Vector3(...anchorNode.position)

  const normal = parentPosition.clone().normalize()
  const northPole = new THREE.Vector3(0, 1, 0)
  const tangent1 = new THREE.Vector3().crossVectors(northPole, normal).normalize()
  const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize()

  if (tangent2.dot(northPole) < 0) {
    tangent2.negate()
  }

  const depthScale = depth > 1 ? 0.5 : 1

  return childNodes.map((entry, i) => {
    const nonZeroI = i + 1
    const alternatingXSides = nonZeroI % 2 === 0 ? -1 : 1
    const sideSign =
      typeof anchorNode?.sideSign === 'number' && anchorNode.sideSign !== 0 ? anchorNode.sideSign : alternatingXSides

    const offsetX = sideSign * SECOND_ORDER_CONNECTION_SPHERE_DISTANCE
    const offsetY = -0.25 * depthScale
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
  anchorNode,
  nodes,
  positionedNodes,
  nodeTextures,
  onNodeClick,
  getSphereRotation,
  depth = 1,
  maxDepth = Number.POSITIVE_INFINITY,
  onNodeHover,
  clusterCenterTitle,
}) => {
  const computedNodes = useMemo(() => {
    if (!anchorNode || !nodes?.length) return []
    return positionSecondOrderChildren(anchorNode, nodes, depth)
  }, [anchorNode, nodes, depth])

  const finalNodes = positionedNodes?.length ? positionedNodes : computedNodes
  const dispatch = useDispatch()
  const globalRenderOwners = useSelector((state) => state.currentEntry.globalRenderOwners || {})
  const ownerId = anchorNode?.node?.id
  const nodeIds = useMemo(() => finalNodes.map((entry) => entry?.node?.id).filter(Boolean), [finalNodes])

  useEffect(() => {
    if (!ownerId || !nodeIds.length) return
    const unowned = nodeIds.filter((id) => !globalRenderOwners[id])
    if (!unowned.length) return
    dispatch(claimGlobalRenderOwners({ ownerId, nodeIds: unowned }))
  }, [dispatch, ownerId, nodeIds, globalRenderOwners])

  const renderableNodes = useMemo(() => {
    if (!finalNodes?.length || !ownerId) return []
    return finalNodes.filter((entry) => {
      const nodeId = entry?.node?.id
      if (!nodeId) return false
      const owner = globalRenderOwners[nodeId]
      return !owner || owner === ownerId
    })
  }, [finalNodes, globalRenderOwners, ownerId])

  const connectionLines = useMemo(() => buildSolidLines(anchorNode, renderableNodes), [anchorNode, renderableNodes])
  const connectionsByNodeId = useGlobalSecondOrderConnections(renderableNodes)

  if (!renderableNodes?.length) return null

  return (
    <>
      {connectionLines}
      {renderableNodes.map(({ node, position }) => (
        <SphereWithEffects
          key={node.id}
          id={node.id}
          pos={position.toArray()}
          title={node.title}
          size={GLOBAL_SPHERE_SIZES[SPHERE_TYPES.SECOND_ORDER_CONNECTION]}
          mainTexture={nodeTextures.get(node.id)}
          onClick={() => onNodeClick(node.id)}
          onHover={onNodeHover}
          hoverInfo={{
            nodeTitle: node.title,
            clusterCenterTitle,
            connectionType: node.connectionType,
            parentTitle: anchorNode?.node?.title || null,
          }}
          rotation={getSphereRotation(position)}
        />
      ))}
      {depth < maxDepth &&
        renderableNodes.map((parentEntry) => {
          const connectedNodes = connectionsByNodeId.get(parentEntry.node.id)
          if (!connectedNodes?.length) return null
          return (
            <GlobalSecondOrderNodes
              key={`third-order-children-${parentEntry.node.id}`}
              anchorNode={parentEntry}
              nodes={connectedNodes}
              depth={depth + 1}
              maxDepth={maxDepth}
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

export default GlobalSecondOrderChildNodes
