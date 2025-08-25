import React, { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SPHERE_SIZE = 0.5
const SPHERE_HALO_SIZE = SPHERE_SIZE + 0.03

const ThreeTextSphere = ({ text, title, onClick, position = [0, 0, 0] }) => {
  const meshRef = useRef()
  const haloRef = useRef()
  const targetOpacity = useRef(0.2)
  const [hovered, setHovered] = useState(false)

  // Create a canvas texture for the rotating text + static title
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 512

    // Background
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // text
    ctx.fillStyle = 'silver'
    ctx.font = '12px Syncopate'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const words = text.split(' ')
    let line = ''
    const maxWidth = canvas.width - 100
    const lines = []

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line.trim())
        line = words[i] + ' '
      } else {
        line = testLine
      }
    }
    lines.push(line.trim())

    // Line height
    const lineHeight = 40
    let y = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((l) => {
      ctx.fillText(l, canvas.width / 2, y)
      y += lineHeight
    })

    // Static centered title (drawn on top, confined to the sphere)
    if (title) {
      ctx.font = 'bold 28px Syncopate'
      ctx.fillStyle = 'white'
      ctx.fillText(title, canvas.width / 2, canvas.height / 2)
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [text, title])

  // Smoothly animate halo opacity
  useFrame(() => {
    if (!haloRef.current) return
    targetOpacity.current = hovered ? 1 : 0.2
    haloRef.current.material.opacity += (targetOpacity.current - haloRef.current.material.opacity) * 0.08
  })

  return (
    <>
      {/* Main sphere */}
      <mesh ref={meshRef} rotation={[0, 4.7, 0]} position={position}>
        <sphereGeometry args={[SPHERE_SIZE, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* Halo sphere behind the text */}
      <mesh
        ref={haloRef}
        position={position}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <sphereGeometry args={[SPHERE_HALO_SIZE, 64, 64]} />
        <meshBasicMaterial color="white" transparent side={THREE.BackSide} opacity={0.2} />
      </mesh>
    </>
  )
}

export default ThreeTextSphere
