import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as THREE from 'three'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { DEFAULT_SPHERE_SIZES } from '@constants/spheres'

// Redux
import { fetchConnectionsDirect } from '@redux/reducers/connectionsReducer'

// Utils
import { transformConnection } from '@utils/transformConnection'

// Components
import SphereWithEffects from './SphereWithEffects'

const {
  FRONTEND: { EXTERNAL, PARENT },
} = CONNECTION_TYPES

const ConnectionSpheres = ({
  conn,
  connId,
  handleConnectionSphereClick,
  position = [0, 0, 0],
  rotation = [0, 4.7, 0],
  size = DEFAULT_SPHERE_SIZES.MAIN,
  verticalOffset = 0,
  horizontalOffset = 0,
  currentEntryId = null, // Allow passing from parent for public views
}) => {
  const dispatch = useDispatch()
  const [subConnections, setSubConnections] = useState(null)
  const [fetchError, setFetchError] = useState(null)
  
  // Try to get currentEntryId from Redux, but allow it to be passed as prop
  // Use optional chaining to safely access Redux state
  const reduxState = useSelector((state) => state?.currentEntry, () => false)
  const reduxEntryId = reduxState?.entryId || null
  
  const effectiveEntryId = currentEntryId || reduxEntryId

  // Fetch one level of sub-connections
  useEffect(() => {
    const fetchSubs = async () => {
      if (!connId) return
      
      try {
        setFetchError(null)
        const result = await dispatch(fetchConnectionsDirect(connId)).unwrap()
        setSubConnections(result)
      } catch (err) {
        console.error('Error fetching sub-connections:', err)
        setFetchError(err)
        setSubConnections([]) // Set to empty array on error
      }
    }
    fetchSubs()
  }, [connId, dispatch])

  const ORBITAL_RADIUS = size * 3

  return (
    <>
      {/* Sub-connections with orbital lines */}
      {conn?.connection_type !== EXTERNAL &&
        !fetchError &&
        subConnections
          ?.filter((conn) => {
            if (!effectiveEntryId) return true // If no entryId, show all
            return conn.foreign_entry_id !== effectiveEntryId && conn.primary_entry_id !== effectiveEntryId
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
              console.log('Parent-to-parent positioning:', {
                connType: conn?.connection_type,
                subType: sub.connection_type,
                verticalDistance,
                newPos: new THREE.Vector3(...position).add(orbitalOffset).toArray(),
              })
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
                  onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                  rotation={rotation}
                />
              </group>
            )
          })}
    </>
  )
}

export default ConnectionSpheres
