import React, { Suspense, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import useNodeEntriesInfo from '@hooks/useNodeEntriesInfo'

import ThreeTextSphere from '@components/ThreeTextSphere/ThreeTextSphere.js'

// Redux
import { setEntryById } from '@redux/reducers/currentEntryReducer'
import { fetchConnections } from '@redux/reducers/connectionsReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/shared.module.scss'

// Constants
import { CONNECTION_TYPES } from '@constants/connectionTypes'
import { SPHERE_TYPES, DEFAULT_SPHERE_SIZES } from '@constants/spheres'

const {
  FRONTEND: { PARENT, EXTERNAL, CHILD, SIBLING },
} = CONNECTION_TYPES

const Explore = () => {
  const nodeEntriesInfo = useNodeEntriesInfo()
  const history = useHistory()
  const dispatch = useDispatch()

  const { content, title, entryId, wdWordCount } = useSelector((state) => state.currentEntry)
  const { connections } = useSelector((state) => state.connections)

  const handleMainNodeClick = async () => {
    history.push(`/edit-node-entry?entryId=${entryId}`)
  }

  function extractTextFromHTML(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return doc.body.textContent || ''
  }

  // --- Positioning logic ---
  const center = [0, 0, 0]
  const positions = {}
  const LINE_EXTENSION_FACTOR = 1.5 // 20% longer lines

  const SPHERE_DIAMETER = 0.5 * 2
  const MIN_SEPARATION = SPHERE_DIAMETER + 0.1

  const siblings = connections?.filter((c) => c.connection_type === SIBLING) || []
  const parents = connections?.filter((c) => c.connection_type === PARENT) || []
  const children = connections?.filter((c) => c.connection_type === CHILD) || []
  const externals = connections?.filter((c) => c.connection_type === EXTERNAL) || []

  const OUTER_FACTOR = 1.6
  const scaleFromOrigin = (pos, factor) => {
    const v = new THREE.Vector3(...pos)
    return v.multiplyScalar(factor).toArray()
  }

  // --- External nodes on diagonals ---
  externals.forEach((e, i) => {
    const diagonalIndex = i % 4 // 0: UL, 1: UR, 2: BR, 3: BL
    const ring = Math.floor(i / 4) // ring layer
    const baseDistance = SPHERE_DIAMETER * 3
    const distance = baseDistance * (1 + ring * 0.4) // slightly increased per ring
    const offset = ring * 0.5 // small offset per ring to avoid overlap

    let x = 0,
      y = 0
    switch (diagonalIndex) {
      case 0: // upper-left
        x = -distance - offset
        y = distance + offset
        break
      case 1: // upper-right
        x = distance + offset
        y = distance + offset
        break
      case 2: // bottom-right
        x = distance + offset
        y = -distance - offset
        break
      case 3: // bottom-left
        x = -distance - offset
        y = -distance - offset
        break
    }

    positions[e.id] = [x, y, 0]
  })

  // --- Parent nodes stacked vertically ---
  parents.forEach((p, i) => {
    positions[p.id] = [0, SPHERE_DIAMETER + MIN_SEPARATION * i + 2, 0]
  })

  // --- Child nodes below center, scaled out ---
  children.forEach((c, i) => {
    const x = (i - (children.length - 1) / 2) * MIN_SEPARATION
    const y = -2
    positions[c.id] = scaleFromOrigin([x, y, 0], OUTER_FACTOR)
  })

  // --- Sibling nodes, alternated left/right, scaled out ---
  siblings.forEach((s, i) => {
    const side = i % 2 === 0 ? -1 : 1
    const x = side * (SPHERE_DIAMETER + 0.5)
    const y = Math.floor(i / 2) * MIN_SEPARATION * (i % 2 === 0 ? 1 : -1)
    positions[s.id] = scaleFromOrigin([x, y, 0], OUTER_FACTOR)
  })

  useEffect(() => {
    if (entryId) {
      dispatch(fetchConnections(entryId))
    }
  }, [dispatch, entryId])

  const handleConnectionSphereClick = async (id, conn) => {
    if (conn.connection_type === EXTERNAL) {
      window.open(conn.foreign_source, '_blank')
    } else {
      await dispatch(setEntryById(id))
    }
  }

  const transformConnection = (currentEntryId, conn) => {
    if (!conn) return

    if (conn.connection_type === EXTERNAL) {
      return { title: conn.primary_source, id: conn.primary_entry_id }
    }

    return currentEntryId === conn.foreign_entry_id
      ? { title: conn.primary_entry_title, id: conn.primary_entry_id }
      : { title: conn.foreign_entry_title, id: conn.foreign_entry_id }
  }

  function getMostRecentlyModifiedItem(items) {
    if (!Array.isArray(items) || items.length === 0) return null

    // filter out null/undefined or missing date_last_modified
    const validItems = items.filter((item) => item && item.date_last_modified)

    if (validItems.length === 0) return null

    return validItems.reduce((latest, current) => {
      return new Date(current.date_last_modified) > new Date(latest.date_last_modified) ? current : latest
    })
  }

  function getScaledSphereSize(baseSize, wordCount) {
    if (!wordCount || wordCount <= 0) return baseSize

    // Normalize word count into a factor (tweak divisor for sensitivity)
    const factor = Math.log10(wordCount + 1) / 5 // compress growth
    const delta = Math.min(Math.max(factor, -0.5), 0.2) // clamp to [-0.3, +0.5]

    return baseSize * (1 + delta)
  }

  // Effect to set current explore node to most recent if not already a current entry id
  useEffect(() => {
    if (!entryId && Array.isArray(nodeEntriesInfo)) {
      const mostRecent = getMostRecentlyModifiedItem(nodeEntriesInfo)
      if (mostRecent?.id) {
        dispatch(setEntryById(mostRecent.id))
      }
    }
  }, [dispatch, entryId, nodeEntriesInfo])
  console.log('<<<<<< connections >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(connections)
  console.log('<<<<<< nodeEntriesInfo >>>>>>>>> is: <<<<<<<<<<<<')
  console.log(nodeEntriesInfo)

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Explore</h1>
      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight />
          <directionalLight position={[5, 5, 5]} />

          <Suspense fallback={null}>
            {/* Main node */}
            <ThreeTextSphere
              text={extractTextFromHTML(content)}
              title={title}
              position={center}
              sphereType={SPHERE_TYPES.MAIN}
              // size={() => getScaledSphereSize(DEFAULT_SPHERE_SIZES[SPHERE_TYPES.MAIN], wdWordCount)}
              size={DEFAULT_SPHERE_SIZES[SPHERE_TYPES.MAIN]}
              onClick={handleMainNodeClick}
            />

            {connections?.map((conn) => {
              const pos = positions[conn.id]
              if (!pos) return null

              // scale the line endpoint a bit farther out than the sphere
              const v = new THREE.Vector3(...pos).multiplyScalar(LINE_EXTENSION_FACTOR)

              const points = [new THREE.Vector3(...center), v]
              const geometry = new THREE.BufferGeometry().setFromPoints(points)
              const isExternal = conn.connection_type === EXTERNAL
              return (
                <line
                  key={`line-${conn.id}`}
                  geometry={geometry}
                  dashed={isExternal}
                  onUpdate={(line) => {
                    if (isExternal && line.computeLineDistances) {
                      line.computeLineDistances()
                    }
                  }}
                >
                  {isExternal ? (
                    <lineDashedMaterial
                      color="white"
                      dashSize={0.3}
                      gapSize={0.2}
                      linewidth={1}
                      transparent
                      depthWrite={false}
                    />
                  ) : (
                    <lineBasicMaterial color="white" linewidth={1} />
                  )}
                </line>
              )
            })}
            {/* Connection spheres */}
            {connections?.map((conn) => {
              const transformed = transformConnection(entryId, conn)
              const pos = positions[conn.id]
              if (!pos) return null

              // scale outward so sphere matches line tip
              const endPos = new THREE.Vector3(...pos).multiplyScalar(LINE_EXTENSION_FACTOR)

              // Find matching node in nodeEntriesInfo
              const nodeInfo = nodeEntriesInfo.find((n) => n.id === transformed.id)

              const sphereSize = getScaledSphereSize(
                DEFAULT_SPHERE_SIZES[SPHERE_TYPES.CONNECTION],
                nodeInfo?.wdWordCount
              )

              return (
                <ThreeTextSphere
                  conn={conn}
                  key={conn.id}
                  title={transformed.title}
                  position={endPos}
                  sphereType={SPHERE_TYPES.CONNECTION}
                  size={sphereSize}
                  onClick={() => handleConnectionSphereClick(transformed.id, conn)}
                />
              )
            })}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default Explore
