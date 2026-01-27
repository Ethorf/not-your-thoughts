import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

/**
 * Globe mesh with gradient from north (blue) to south (white)
 */
const GradientGlobe = () => {
  const meshRef = useRef()

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry
      const count = geometry.attributes.position.count
      const colors = new Float32Array(count * 3)

      for (let i = 0; i < count; i++) {
        const y = geometry.attributes.position.getY(i)
        const normalizedY = (y + 2.5) / 5 // Normalize from [-2.5, 2.5] to [0, 1]

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
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshBasicMaterial wireframe={true} transparent opacity={0.3} vertexColors={true} />
    </mesh>
  )
}

export default GradientGlobe
