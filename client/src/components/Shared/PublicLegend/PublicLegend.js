import React, { useState, useEffect, useRef } from 'react'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import { useHistory } from 'react-router-dom'

import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import useIsMobile from '@hooks/useIsMobile'

import styles from './PublicLegend.module.scss'

// Disabled automatic showing of legend - cookie logic commented out
// const COOKIE_NAME = 'public_legend_seen'
// const COOKIE_EXPIRY_DAYS = 365

// const getCookieValue = (name) => {
//   if (typeof document === 'undefined') {
//     return null
//   }

//   const cookies = document.cookie.split(';')
//   const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`))

//   if (!cookie) {
//     return null
//   }

//   return decodeURIComponent(cookie.split('=')[1])
// }

// const setCookie = (name, value) => {
//   if (typeof document === 'undefined') {
//     return
//   }

//   const expiryDate = new Date()
//   expiryDate.setTime(expiryDate.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

//   document.cookie = `${name}=${value};expires=${expiryDate.toUTCString()};path=/`
// }

const PublicLegend = () => {
  const [isOpen, setIsOpen] = useState(false)
  const history = useHistory()
  const isMobile = useIsMobile()
  const contentRef = useRef(null)

  useEffect(() => {
    // Disabled automatic showing of legend
    // const hasSeenLegend = getCookieValue(COOKIE_NAME)
    // if (!hasSeenLegend) {
    //   setIsOpen(true)
    //   setCookie(COOKIE_NAME, 'true')
    // }
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden'

      // Scroll modal to top on mobile when it opens
      if (isMobile) {
        setTimeout(() => {
          const modalElement =
            contentRef.current?.closest('[class*="react-responsive-modal-modal"]') ||
            document.querySelector('[class*="react-responsive-modal-modal"]')
          if (modalElement) {
            modalElement.scrollTop = -1000
          }
        }, 100)
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = ''
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMobile])

  return (
    <>
      <button
        className={styles.helpButton}
        onClick={handleOpen}
        aria-label="Show help"
        data-tooltip-id="main-tooltip"
        data-tooltip-content="What?"
      >
        <span className={styles.questionMark}>?</span>
      </button>

      <Modal
        classNames={{
          root: styles.root,
          modalContainer: styles.modalContainer,
          modal: styles.modal,
          overlay: styles.overlay,
          closeButton: styles.modalCloseButton,
        }}
        open={isOpen}
        onClose={handleClose}
        center={false}
        blockScroll={true}
      >
        <div ref={contentRef} className={styles.content}>
          <h2 className={styles.title}>What's Going On Here?</h2>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Browse Networks</h3>
            <p className={styles.text}>
              Browse all available nodes and network starting point. - Click on the centre node's title to view its
              content, or click on any of it's connected nodes to center them see their connections.
            </p>
            <p className={styles.highlight}>
              <strong>Dotted connection lines = external links</strong>
              <br />
              <strong>White spheres indicate unread nodes</strong>
            </p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Node Entry View</h3>
            <p className={styles.text}>
              Read the full content of a node. Click "Network" to explore its connections, or use "History" to see
              previous versions of the content.
            </p>
          </div>
          <h3 className={styles.title}>Why are you doing this?</h3>
          <DefaultButton
            onClick={() => history.push('/show-node-entry?userId=ethorf&entryId=1435')}
            className={styles.gotItButton}
          >
            Learn more in longform
          </DefaultButton>
          <DefaultButton onClick={handleClose} className={styles.gotItButton}>
            Got it!
          </DefaultButton>
        </div>
      </Modal>
    </>
  )
}

export default PublicLegend
