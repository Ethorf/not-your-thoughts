import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const ThreeTextSphere = () => {
  const meshRef = useRef()
  //   console.log('<<<<<< text >>>>>>>>> is: <<<<<<<<<<<<')
  //   console.log(text)
  //   console.log('<<<<<< typeof text >>>>>>>>> is: <<<<<<<<<<<<')
  //   console.log(typeof text)
  // Make a canvas with your text
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 512

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'white'
    ctx.font = '60px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // wrap words across lines
    const words = 'jarmarbios lantilta frontoo'.split(' ')
    let line = ''
    let y = 100
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > canvas.width - 100 && i > 0) {
        ctx.fillText(line, canvas.width / 2, y)
        line = words[i] + ' '
        y += 80
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, canvas.width / 2, y)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }, [])

  // rotate slowly
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </>
  )
}
export default ThreeTextSphere
