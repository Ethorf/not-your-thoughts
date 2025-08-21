import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import classNames from 'classnames'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

import ThreeTextSphere from '@components/ThreeTextSphere/ThreeTextSphere.js'
import { Text } from '@react-three/drei'
// Redux
import { resetCurrentEntryState, createNodeEntry } from '@redux/reducers/currentEntryReducer'

// Styles
import styles from './Explore.module.scss'
import sharedStyles from '@styles/shared.module.scss'

// Components

const Explore = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { content } = useSelector((state) => state.currentEntry)

  // TODO add functionality to auto select current node or just have an active node
  const handleNewNodeEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newNode = await dispatch(createNodeEntry())

    history.push(`/edit-node-entry?entryId=${newNode.payload}`)
  }
  function extractTextFromHTML(htmlString) {
    const doc = new DOMParser().parseFromString(htmlString, 'text/html')
    return doc.body.textContent || ''
  }

  return (
    <div className={classNames(styles.wrapper, sharedStyles.flexColumnCenter)}>
      <h1>Explore</h1>
      <div className={styles.nodesWrapper}>
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight />
          <Text position={[0, 0, 0]} fontSize={1} color="white">
            jeff
          </Text>
        </Canvas>
      </div>
    </div>
  )
}
{
  /* <ambientLight intensity={0.5} /> */
}
{
  /* <directionalLight position={[5, 5, 5]} /> */
}
{
  /* <ThreeTextSphere text="string is the bing of the ling" /> */
}
export default Explore

{
  /* SVG filter definition
        <svg style={{ display: 'none' }}>
          <defs>
            <filter id="planetWarp">
              {/* Create a radial gradient as the displacement map */
}
{
  /* <feImage
                xlinkHref={`data:image/svg+xml;utf8,
                <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
                  <radialGradient id='grad' cx='50%' cy='50%' r='50%'>
                    <stop offset='0%' stop-color='white'/>
                    <stop offset='70%' stop-color='gray'/>
                    <stop offset='100%' stop-color='black'/>
                  </radialGradient>
                  <rect width='100%' height='100%' fill='url(%23grad)'/>
                </svg>`}
                result="map"
              />
              <feDisplacementMap in="SourceGraphic" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* Planet-shaped container */
}
{
  /* <div
          style={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            overflow: 'hidden',
            filter: 'url(#planetWarp)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#000', // optional backdrop for contrast
          }}
          // dangerouslySetInnerHTML={{ __html: content }}
        >
          {extractTextFromHTML(content)}
        </div> */
}
{
  /* </div>  */
}
