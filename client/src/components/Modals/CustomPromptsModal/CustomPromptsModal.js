import React from 'react'
import { useDispatch } from 'react-redux'
import 'react-responsive-modal/styles.css'
import { MODAL_NAMES } from '../../../constants/modalNames'
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
const MODAL_NAME = MODAL_NAMES.CUSTOM_PROMPTS

export const CustomPromptsModal = () => {
  const dispatch = useDispatch()

  return (
    <BaseModalWrapper modalName={MODAL_NAME}>
      <h2>Tangy</h2>
    </BaseModalWrapper>
  )
}
