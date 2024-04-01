import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomPrompts } from '../../redux/reducers/customPromptsReducer'
import DefaultButton from '../Shared/DefaultButton/DefaultButton'
import { useHotkeys } from 'react-hotkeys-hook'

import { MODAL_NAMES } from '../../constants/modalNames'

import { openModal } from '../../redux/reducers/modalsReducer.js'

// Assets
import firstIcon from '../../assets/Icons/prompt-icons/first-gray.png'
import previousIcon from '../../assets/Icons/prompt-icons/previous-gray.png'
import shuffleIcon from '../../assets/Icons/prompt-icons/shuffle-gray.png'
import nextIcon from '../../assets/Icons/prompt-icons/next-gray.png'
import lastIcon from '../../assets/Icons/prompt-icons/last-gray.png'

import styles from './PromptsDisplay.module.scss'

const PromptsDisplay = () => {
  const dispatch = useDispatch()
  const [activePromptIndex, setActivePromptIndex] = useState(0)

  const { customPrompts } = useSelector((state) => state.customPrompts)

  useEffect(() => {
    dispatch(fetchCustomPrompts())
  }, [dispatch])

  const handleOpenModal = () => {
    dispatch(openModal(MODAL_NAMES.CUSTOM_PROMPTS))
  }

  return (
    customPrompts.length && (
      <div className={styles.wrapper}>
        <h3 className={styles.prompt}>{customPrompts[activePromptIndex].content}</h3>
        <div className={styles.controlsContainer}>
          <DefaultButton
            className={styles.noBorder}
            disabled={activePromptIndex === 0}
            onClick={() => setActivePromptIndex(0)}
          >
            <img
              className={classNames(styles.firstButton, styles.tooltip)}
              src={firstIcon}
              alt="go to first prompt"
              title="Go to first prompt, Ctrl + f"
            />
          </DefaultButton>
          <DefaultButton
            className={styles.noBorder}
            disabled={activePromptIndex === 0}
            onClick={() => setActivePromptIndex(activePromptIndex - 1)}
          >
            <img
              className={classNames(styles.prevButton, styles.tooltip)}
              src={previousIcon}
              alt="go to previous prompt"
              title="Go to previous prompt, Ctrl + p"
            />
          </DefaultButton>
          <DefaultButton className={classNames(styles.noBorder, styles.plusButton)} onClick={handleOpenModal}>
            +
          </DefaultButton>
          <DefaultButton
            className={styles.noBorder}
            disabled={activePromptIndex === customPrompts.length - 1}
            onClick={() => setActivePromptIndex(activePromptIndex + 1)}
          >
            <img
              className={classNames(styles.nextButton, styles.tooltip)}
              src={nextIcon}
              alt="go to next prompt"
              title="Go to next prompt, Ctrl + n"
            />
          </DefaultButton>
          <DefaultButton
            className={styles.noBorder}
            disabled={activePromptIndex === customPrompts.length - 1}
            onClick={() => setActivePromptIndex(customPrompts.length - 1)}
          >
            <img
              className={classNames(styles.lastButton, styles.tooltip)}
              src={lastIcon}
              alt="go to last prompt"
              title="Go to last prompt, Ctrl + l"
            />
          </DefaultButton>
        </div>
      </div>
    )
  )
}

export default PromptsDisplay

// const argsShuffle = () => {
//     if (user) {
//       setCustomPromptContent(user.customPrompts[randomNum(user.customPrompts.length - 1)].content)
//     }
//   }

// useHotkeys(
//     'ctrl+s',
//     () => {
//         argsShuffle();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+f',
//     () => {
//         first();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+n',
//     () => {
//         next();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+p',
//     () => {
//         prev();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );
// useHotkeys(
//     'ctrl+l',
//     () => {
//         last();
//     },
//     { enableOnTags: ['TEXTAREA'] }
// );

{
  /* <img
className={`tooltip prompt__shuffle-button prompt__button`}
onClick={() => {
    argsShuffle(setCustomPromptContent, user);
}}
src={shuffleIcon}
alt="shuffle prompt"
title="Shuffle prompt, Ctrl + s"
></img> */
}
