import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOBAL_CENTER_GLOBE_RADIUS } from '@constants/spheres'

/**
 * Globe mesh with gradient from north (blue) to south (white).
 * Spins when isLoading is true.
 */
const GradientGlobe = ({ isLoading = false }) => {
  const meshRef = useRef()

  useFrame((_, delta) => {
    if (isLoading && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8
    }
  })

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry
      const count = geometry.attributes.position.count
      const colors = new Float32Array(count * 3)
      const diameter = GLOBAL_CENTER_GLOBE_RADIUS * 2

      for (let i = 0; i < count; i++) {
        const y = geometry.attributes.position.getY(i)
        const normalizedY = (y + GLOBAL_CENTER_GLOBE_RADIUS) / diameter

        // Blue at north (top), white at south (bottom)
        const blue = new THREE.Color(0x4a90e2)
        const white = new THREE.Color(0xffffff)
        const color = new THREE.Color().lerpColors(white, blue, normalizedY)

        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b
      }

      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }
  }, [])

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBAL_CENTER_GLOBE_RADIUS, 64, 64]} />
      <meshBasicMaterial wireframe={true} transparent opacity={0.3} vertexColors={true} />
    </mesh>
  )
}

export default GradientGlobe
