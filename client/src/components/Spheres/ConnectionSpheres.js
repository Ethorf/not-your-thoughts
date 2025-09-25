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
  FRONTEND: { EXTERNAL },
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
}) => {
  const dispatch = useDispatch()
  const [subConnections, setSubConnections] = useState(null)
  const { entryId: currentEntryId } = useSelector((state) => state.currentEntry)

  // Fetch one level of sub-connections
  useEffect(() => {
    const fetchSubs = async () => {
      const result = await dispatch(fetchConnectionsDirect(connId)).unwrap()
      setSubConnections(result)
    }
    if (connId) fetchSubs()
  }, [connId, dispatch])

  const ORBITAL_RADIUS = size * 3

  return (
    <>
      {/* Sub-connections with orbital lines */}
      {conn?.connection_type !== EXTERNAL &&
        subConnections
          ?.filter((conn) => conn.foreign_entry_id !== currentEntryId && conn.primary_entry_id !== currentEntryId)
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
              // Apply vertical offset (for parent spheres, this will be negative to place sub-connections below)
              .addScaledVector(up, verticalOffset)

            // For parent spheres, apply horizontal offset to create left/right alternating pattern
            if (horizontalOffset !== 0) {
              // Create a world-space right vector for horizontal offset
              const worldRight = new THREE.Vector3(1, 0, 0)
              orbitalOffset.addScaledVector(worldRight, horizontalOffset)
            }

            const newPos = new THREE.Vector3(...position).add(orbitalOffset).toArray()

            // line geometry from parent -> sub
            const points = [new THREE.Vector3(...position), new THREE.Vector3(...newPos)]
            const curve = new THREE.CatmullRomCurve3(points)
            const geometry = new THREE.TubeGeometry(curve, 8, 0.008, 4, false) // radius = 0.02 for thicker line

            const transformed = transformConnection(connId, sub)

            return (
              <group key={sub.id}>
                <mesh geometry={geometry} renderOrder={0}>
                  <meshBasicMaterial color="gray" depthWrite={false} depthTest={false} />
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
