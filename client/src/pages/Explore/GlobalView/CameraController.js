import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CameraController = ({ nodePositions, entryId, controlsRef }) => {
  const { camera, scene } = useThree()
  const needsFocusRef = useRef(null)

  useEffect(() => {
    if (entryId) {
      needsFocusRef.current = String(entryId)
    }
  }, [entryId, nodePositions])

  useFrame(() => {
    if (!needsFocusRef.current) return

    const targetId = needsFocusRef.current
    const mesh = scene.getObjectByName(`node-sphere-${targetId}`)
    if (!mesh) return

    const worldPos = new THREE.Vector3()
    mesh.getWorldPosition(worldPos)
    if (worldPos.lengthSq() === 0) return

    needsFocusRef.current = null

    const dir = worldPos.normalize()
    const distance = camera.position.length()
    camera.position.copy(dir.multiplyScalar(distance))
    camera.lookAt(0, 0, 0)

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  })

  return null
}

export default CameraController
