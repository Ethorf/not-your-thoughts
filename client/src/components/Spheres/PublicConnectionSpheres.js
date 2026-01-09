import React, { useState, useEffect } from 'react'
import * as THREE from 'three'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Utils
import { transformConnection } from '@utils/transformConnection'
import { getNodeStatus } from '@utils/nodeReadStatus'
import { resolvePublicUserId } from '@utils/resolvePublicUserId'

// Components
import SphereWithEffects from './SphereWithEffects'

const {
  FRONTEND: { EXTERNAL, PARENT },
} = CONNECTION_TYPES

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
  size = DEFAULT_SPHERE_SIZES.MAIN,
  verticalOffset = 0,
  horizontalOffset = 0,
  currentEntryId = null,
}) => {
  const [subConnections, setSubConnections] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  // Fetch one level of sub-connections using public API
  useEffect(() => {
    const fetchSubs = async () => {
      if (!connId || !userId) return

      const cacheKey = `${connId}:${userId}`
      
      // Check cache first
      if (subConnectionsCache.has(cacheKey)) {
        setSubConnections(subConnectionsCache.get(cacheKey))
        return
      }

      // Check if request is already pending
      if (pendingRequests.has(cacheKey)) {
        // Wait for pending request to complete
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

      // Create new request
      const requestPromise = (async () => {
        try {
          setFetchError(null)
          const resolvedUserId = resolvePublicUserId(userId)
          const response = await fetch(`/api/connections/public/${connId}?userId=${resolvedUserId}`)

          if (!response.ok) {
            if (response.status === 204) {
              // No connections found - this is okay
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

      // Store pending request
      pendingRequests.set(cacheKey, requestPromise)

      try {
        const connections = await requestPromise
        setSubConnections(connections)
      } catch (err) {
        console.error('Error fetching sub-connections:', err)
        setFetchError(err)
        setSubConnections([]) // Set to empty array on error
      }
    }
    fetchSubs()
  }, [connId, userId])

  const ORBITAL_RADIUS = size * 3

  return (
    <>
      {/* Sub-connections with orbital lines */}
      {conn?.connection_type !== EXTERNAL &&
        !fetchError &&
        subConnections
          ?.filter((subConn) => {
            if (!currentEntryId) return true // If no entryId, show all
            return subConn.foreign_entry_id !== currentEntryId && subConn.primary_entry_id !== currentEntryId
          })
          .map((sub, i) => {
            // Create orbital position around the main sphere
            const angle = (i / subConnections.length) * Math.PI * 2 // Distribute evenly around circle

            // Compute direction vector from origin -> this sphere
            const direction = new THREE.Vector3(...position).normalize()

            // Create a perpendicular vector to the direction for orbital plane
            const up = new THREE.Vector3(0, 1, 0)
            const right = new THREE.Vector3().crossVectors(direction, up).normalize()
            const forward = new THREE.Vector3().crossVectors(right, direction).normalize()

            // Calculate orbital position
            let orbitalOffset = new THREE.Vector3()
              .addScaledVector(right, Math.cos(angle) * ORBITAL_RADIUS)
              .addScaledVector(forward, Math.sin(angle) * ORBITAL_RADIUS)
              // Add additional offset in the direction away from origin to ensure no overlap
              .addScaledVector(direction, ORBITAL_RADIUS * 0.3)
              // Apply vertical offset based on connection type
              .addScaledVector(up, verticalOffset)

            // If the main connection is a PARENT type and this sub-connection is also a PARENT type,
            // render it directly above the main sphere
            if (conn?.connection_type === PARENT && sub.connection_type === PARENT) {
              // Place directly vertical above with no horizontal offset
              // Use a longer distance for better visual separation
              const verticalDistance = size * 2.5
              orbitalOffset = new THREE.Vector3().addScaledVector(up, verticalDistance)
            }
            const isParentToParent = conn?.connection_type === PARENT && sub.connection_type === PARENT

            // For parent spheres, apply horizontal offset to create left/right alternating pattern
            // But NOT for parent-to-parent connections which should be directly above
            if (horizontalOffset !== 0 && !isParentToParent) {
              // Create a world-space right vector for horizontal offset
              const worldRight = new THREE.Vector3(1, 0, 0)
              orbitalOffset.addScaledVector(worldRight, horizontalOffset)
            }

            const newPos = new THREE.Vector3(...position).add(orbitalOffset).toArray()

            // line geometry from parent -> sub
            const points = [new THREE.Vector3(...position), new THREE.Vector3(...newPos)]
            const curve = new THREE.CatmullRomCurve3(points)

            // For parent-to-parent connections, use a shorter line radius
            const lineRadius = 0.008 // Thicker line for parent-to-parent
            const geometry = new THREE.TubeGeometry(curve, 8, lineRadius, 4, false)

            const transformed = transformConnection(connId, sub)
            const subNodeStatus = getNodeStatus(transformed.id)

            return (
              <group key={sub.id}>
                <mesh geometry={geometry} renderOrder={0}>
                  <meshBasicMaterial color={'gray'} depthWrite={false} depthTest={false} />
                </mesh>
                <SphereWithEffects
                  id={sub.id}
                  pos={newPos}
                  title={transformed.title}
                  size={size * 0.7}
                  conn={sub}
                  onClick={() => handleConnectionSphereClick(sub)}
                  rotation={rotation}
                  nodeStatus={subNodeStatus}
                />
              </group>
            )
          })}
    </>
  )
}

export default PublicConnectionSpheres
