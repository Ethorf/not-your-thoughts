import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Helper component to position camera to face a specific sphere
 */
const CameraController = ({ nodePositions, entryId, controlsRef }) => {
  const { camera } = useThree()

  useEffect(() => {
    if (nodePositions.length > 0 && entryId && controlsRef.current) {
      const targetNodePosition = nodePositions.find(({ node }) => node.id === entryId)

      if (targetNodePosition) {
        const position = targetNodePosition.position

        // Calculate spherical coordinates to position camera
        const distance = camera.position.length()
        const phi = Math.atan2(position.x, position.z)
        const theta = Math.acos(position.y / position.length())

        // Set camera position to face the target sphere
        const newCameraPos = new THREE.Vector3(
          distance * Math.sin(theta) * Math.sin(phi),
          distance * Math.cos(theta),
          distance * Math.sin(theta) * Math.cos(phi)
        )

        camera.position.copy(newCameraPos)
        camera.lookAt(0, 0, 0)
        controlsRef.current.update()
      }
    }
  }, [nodePositions, entryId, camera, controlsRef])

  return null
}

export default CameraController
