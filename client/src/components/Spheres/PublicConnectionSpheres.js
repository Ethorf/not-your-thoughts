import React, { useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import {
  SPHERE_TYPES,
  LOCAL_SPHERE_SIZES,
  LOCAL_EXPLORE_MAX_SUB_CONNECTION_DEPTH,
  LOCAL_EXPLORE_SECOND_ORDER_DISTANCE,
  LOCAL_EXPLORE_SUB_CONNECTION_SIZE_SCALE,
} from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'
import { transformBackendToFrontendConnectionType } from '@utils/connectionTypeHelpers'
import { getLocalSecondOrderSiblingOrbitalOffset } from '@utils/positionLocalSecondOrderSibling'
import { getNodeStatus } from '@utils/nodeReadStatus'
import { resolvePublicUserId } from '@utils/resolvePublicUserId'

// Components
import SphereWithEffects from './SphereWithEffects'

const {
  FRONTEND: { EXTERNAL, PARENT, SIBLING },
} = CONNECTION_TYPES

const SUB_CONNECTION_SIZE_SCALE = LOCAL_EXPLORE_SUB_CONNECTION_SIZE_SCALE

// Cache for sub-connections to prevent duplicate requests
const subConnectionsCache = new Map()
const pendingRequests = new Map()

const PublicConnectionSpheres = ({
  conn,
  connId,
  userId,
  handleConnectionSphereClick,
  position = [0, 0, 0],
  rotation = [0, 4.7, 0],
  size = LOCAL_SPHERE_SIZES[SPHERE_TYPES.FIRST_ORDER_CONNECTION],
  verticalOffset = 0,
  horizontalOffset = 0,
  currentEntryId = null,
  excludedNodeIds = [],
  graphCenter = null,
  layoutScale = 1,
  depth = 1,
  maxDepth = LOCAL_EXPLORE_MAX_SUB_CONNECTION_DEPTH,
}) => {
  const [subConnections, setSubConnections] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    const fetchSubs = async () => {
      if (!connId || !userId) return

      const cacheKey = `${connId}:${userId}`

      if (subConnectionsCache.has(cacheKey)) {
        setSubConnections(subConnectionsCache.get(cacheKey))
        return
      }

      if (pendingRequests.has(cacheKey)) {
        try {
          const cachedData = await pendingRequests.get(cacheKey)
          setSubConnections(cachedData)
          return
        } catch (err) {
          setFetchError(err)
          setSubConnections([])
          return
        }
      }

      const requestPromise = (async () => {
        try {
          setFetchError(null)
          const resolvedUserId = resolvePublicUserId(userId)
          const response = await fetch(`/api/connections/public/${connId}?userId=${resolvedUserId}`)

          if (!response.ok) {
            if (response.status === 204) {
              const emptyArray = []
              subConnectionsCache.set(cacheKey, emptyArray)
              pendingRequests.delete(cacheKey)
              return emptyArray
            }
            throw new Error('Failed to fetch sub-connections')
          }

          const data = await response.json()
          const connections = data.connections || []
          subConnectionsCache.set(cacheKey, connections)
          pendingRequests.delete(cacheKey)
          return connections
        } catch (err) {
          pendingRequests.delete(cacheKey)
          throw err
        }
      })()

      pendingRequests.set(cacheKey, requestPromise)

      try {
        const connections = await requestPromise
        setSubConnections(connections)
      } catch (err) {
        console.error('Error fetching sub-connections:', err)
        setFetchError(err)
        setSubConnections([])
      }
    }
    fetchSubs()
  }, [connId, userId])

  const orbitalRadius = LOCAL_EXPLORE_SECOND_ORDER_DISTANCE
  const subSphereSize = size * SUB_CONNECTION_SIZE_SCALE
  const excludedNodeIdSet = useMemo(
    () => new Set((excludedNodeIds || []).filter((id) => id != null).map((id) => String(id))),
    [excludedNodeIds]
  )
  const visibleSubConnections = useMemo(() => {
    if (conn?.connection_type === EXTERNAL || fetchError || !subConnections?.length) return []

    const seenNodeKeys = new Set()
    const visible = []

    for (const sub of subConnections) {
      if (currentEntryId && (sub.foreign_entry_id === currentEntryId || sub.primary_entry_id === currentEntryId)) {
        continue
      }

      const transformed = transformConnection(connId, sub)
      const nodeId = transformed?.id
      const isExternalSub = sub.connection_type === EXTERNAL
      const dedupeKey = isExternalSub ? `external-${sub.id}` : nodeId != null ? String(nodeId) : `sub-${sub.id}`

      if (!isExternalSub && nodeId != null && excludedNodeIdSet.has(String(nodeId))) continue
      if (seenNodeKeys.has(dedupeKey)) continue
      seenNodeKeys.add(dedupeKey)

      visible.push({ sub, transformed })
    }

    return visible
  }, [conn, fetchError, subConnections, currentEntryId, connId, excludedNodeIdSet])
  const visibleSiblingSubConnections = useMemo(
    () =>
      visibleSubConnections.filter(
        ({ sub }) => transformBackendToFrontendConnectionType(sub.connection_type, connId, sub) === SIBLING
      ),
    [visibleSubConnections, connId]
  )

  const parentPosition = useMemo(() => {
    if (position instanceof THREE.Vector3) return position
    return new THREE.Vector3(...position)
  }, [position])

  return (
    <>
      {conn?.connection_type !== EXTERNAL &&
        !fetchError &&
        visibleSubConnections.map(({ sub, transformed }, i) => {
          const subConnectionType = transformBackendToFrontendConnectionType(sub.connection_type, connId, sub)
          const isSiblingConnection = subConnectionType === SIBLING
          const siblingIndex = visibleSiblingSubConnections.findIndex((candidate) => candidate.sub.id === sub.id)
          const angle = (i / Math.max(visibleSubConnections.length, 1)) * Math.PI * 2
          const direction = parentPosition.clone().normalize()
          const up = new THREE.Vector3(0, 1, 0)
          const right = new THREE.Vector3().crossVectors(direction, up).normalize()
          const forward = new THREE.Vector3().crossVectors(right, direction).normalize()

          let orbitalOffset
          if (isSiblingConnection) {
            const nonNegativeSiblingIndex = siblingIndex >= 0 ? siblingIndex : i
            orbitalOffset = getLocalSecondOrderSiblingOrbitalOffset(
              parentPosition,
              nonNegativeSiblingIndex,
              orbitalRadius,
              graphCenter,
              depth
            )
          } else {
            orbitalOffset = new THREE.Vector3()
              .addScaledVector(right, Math.cos(angle) * orbitalRadius)
              .addScaledVector(forward, Math.sin(angle) * orbitalRadius)
              .addScaledVector(direction, orbitalRadius * 0.3)
              .addScaledVector(up, verticalOffset)
          }

          if (conn?.connection_type === PARENT && sub.connection_type === PARENT) {
            const verticalDistance = size * 2.5 * layoutScale
            orbitalOffset = new THREE.Vector3().addScaledVector(up, verticalDistance)
          }
          const isParentToParent = conn?.connection_type === PARENT && sub.connection_type === PARENT

          if (horizontalOffset !== 0 && !isParentToParent && !isSiblingConnection) {
            const worldRight = new THREE.Vector3(1, 0, 0)
            orbitalOffset.addScaledVector(worldRight, horizontalOffset * layoutScale)
          }

          const newPos = parentPosition.clone().add(orbitalOffset)
          const newPosArray = newPos.toArray()
          const points = [parentPosition.clone(), newPos.clone()]
          const curve = new THREE.CatmullRomCurve3(points)
          const lineRadius = 0.008
          const geometry = new THREE.TubeGeometry(curve, 8, lineRadius, 4, false)
          const subNodeStatus = getNodeStatus(transformed.id)
          const childExcludedNodeIds =
            transformed?.id != null ? [...excludedNodeIds, String(transformed.id)] : excludedNodeIds
          const shouldRecurse =
            depth < maxDepth && subConnectionType !== EXTERNAL && transformed?.id != null

          return (
            <group key={`${sub.id}-${depth}`}>
              <mesh geometry={geometry} renderOrder={0}>
                <meshBasicMaterial color={'gray'} depthWrite={false} depthTest={false} />
              </mesh>
              <SphereWithEffects
                id={sub.id}
                pos={newPosArray}
                title={transformed.title}
                size={subSphereSize}
                conn={sub}
                onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                rotation={rotation}
                nodeStatus={subNodeStatus}
              />
              {shouldRecurse && (
                <PublicConnectionSpheres
                  conn={sub}
                  connId={transformed.id}
                  userId={userId}
                  position={newPosArray}
                  size={subSphereSize}
                  rotation={rotation}
                  verticalOffset={0}
                  horizontalOffset={0}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  graphCenter={graphCenter}
                  layoutScale={layoutScale}
                  excludedNodeIds={childExcludedNodeIds}
                  handleConnectionSphereClick={handleConnectionSphereClick}
                  currentEntryId={currentEntryId}
                />
              )}
            </group>
          )
        })}
    </>
  )
}

export default PublicConnectionSpheres
