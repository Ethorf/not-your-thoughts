import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCustomPrompts } from '../../redux/reducers/customPromptsReducer'
import DefaultButton from '../Shared/DefaultButton/DefaultButton'
import { useHotkeys } from 'react-hotkeys-hook'

import { randomNum } from '../../utils/randomNum.js'

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

  const handleShuffle = () => {
    setActivePromptIndex(randomNum(customPrompts.length - 1))
  }

  return (
    customPrompts.length && (
      <div className={styles.wrapper}>
        <div className={styles.topContainer}>
          <h3 className={styles.prompt}>{customPrompts[activePromptIndex].content}</h3>
          <DefaultButton className={classNames(styles.noBorder, styles.plusButton)} onClick={handleOpenModal}>
            +
          </DefaultButton>
        </div>
        <div className={styles.controlsContainer}>
          <DefaultButton
            className={styles.noBorder}
            disabled={activePromptIndex === 0}
            onClick={() => setActivePromptIndex(0)}
          >
            <img
              className={classNames(styles.controlsButton, styles.firstButton, styles.tooltip)}
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
              className={classNames(styles.controlsButton, styles.prevButton, styles.tooltip)}
              src={previousIcon}
              alt="go to previous prompt"
              title="Go to previous prompt, Ctrl + p"
            />
          </DefaultButton>

          <DefaultButton className={styles.noBorder} onClick={handleShuffle}>
            <img
              className={classNames(styles.controlsButton, styles.shuffleButton, styles.tooltip)}
              src={shuffleIcon}
              alt="shuffle Prompts"
              title="Go to next prompt, Ctrl + n"
            />
          </DefaultButton>
          <DefaultButton
            className={styles.noBorder}
            disabled={activePromptIndex === customPrompts.length - 1}
            onClick={() => setActivePromptIndex(activePromptIndex + 1)}
          >
            <img
              className={classNames(styles.controlsButton, styles.nextButton, styles.tooltip)}
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
              className={classNames(styles.controlsButton, styles.lastButton, styles.tooltip)}
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
