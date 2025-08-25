import React, { Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import ThreeTextSphere from '@components/ThreeTextSphere/ThreeTextSphere.js'

// Redux
import { resetCurrentEntryState, createNodeEntry } from '@redux/reducers/currentEntryReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/shared.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const Explore = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { content, title } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  const handleNewNodeEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newNode = await dispatch(createNodeEntry())
    history.push(`/edit-node-entry?entryId=${newNode.payload}`)
  }

  function extractTextFromHTML(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return doc.body.textContent || ''
  }

  // --- Positioning logic (outside of JSX) ---
  const center = [0, 0, 0]
  const positions = {}

  const SPHERE_DIAMETER = 0.5 * 2 // match ThreeTextSphere SPHERE_SIZE
  const MIN_SEPARATION = SPHERE_DIAMETER + 0.1 // spacing padding

  const siblings = connections.filter((c) => c.connection_type === SIBLING)
  const parents = connections.filter((c) => c.connection_type === PARENT)
  const children = connections.filter((c) => c.connection_type === CHILD)

  // Place PARENT(s) above the center (stacked vertically if multiple)
  parents.forEach((p, i) => {
    positions[p.id] = [0, SPHERE_DIAMETER + MIN_SEPARATION * i + 2, 0] // 2 units above center
  })

  // Place CHILD nodes below the center, horizontally offset
  children.forEach((c, i) => {
    const x = (i - (children.length - 1) / 2) * MIN_SEPARATION
    const y = -2 // fixed below center
    positions[c.id] = [x, y, 0]
  })

  // Place SIBLING nodes stacked vertically, alternating left/right of center
  siblings.forEach((s, i) => {
    const side = i % 2 === 0 ? -1 : 1 // alternate left/right
    const x = side * (SPHERE_DIAMETER + 0.5) // horizontal offset
    const y = Math.floor(i / 2) * MIN_SEPARATION * (i % 2 === 0 ? 1 : -1) // vertical stack
    const z = 0
    positions[s.id] = [x, y, z]
  })

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Explore</h1>
      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            {/* Main node in the center */}
            <ThreeTextSphere text={extractTextFromHTML(content)} title={title} position={center} />

            {/* Draw lines from center to each connection */}
            {connections.map((conn) => {
              const pos = positions[conn.id]
              if (!pos) return null

              const points = [new THREE.Vector3(...center), new THREE.Vector3(...pos)]
              const geometry = new THREE.BufferGeometry().setFromPoints(points)

              return (
                <line key={`line-${conn.id}`} geometry={geometry}>
                  <lineBasicMaterial attach="material" color="white" linewidth={1} />
                </line>
              )
            })}

            {/* Connection spheres */}
            {connections.map((conn) => (
              <ThreeTextSphere
                key={conn.id}
                text={conn.foreign_entry_title}
                title={conn.foreign_entry_title}
                position={positions[conn.id]}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default Explore
