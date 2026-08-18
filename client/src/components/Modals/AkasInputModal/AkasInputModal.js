// Packages
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

// Constants
import { MODAL_NAMES } from '@constants/modalNames'

// Components
import { BaseModalWrapper } from '../BaseModalWrapper/BaseModalWrapper'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'
import DefaultAutoCompleteInput from '@components/Shared/DefaultAutoCompleteInput/DefaultAutoCompleteInput.js'
import TextButton from '@components/Shared/TextButton/TextButton'

// Redux
import { addAka, deleteAka, setCanonTitleFromAka } from '@redux/reducers/currentEntryReducer.js'

// Utils
import axiosInstance from '@utils/axiosInstance'
import { normalizeEntryId } from '@utils/normalizeEntryId'

import styles from './AkasInputModal.module.scss'

export const AkasInputModal = () => {
  const dispatch = useDispatch()
  const [akaInput, setAkaInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [selectedAkaId, setSelectedAkaId] = useState(null)

  const { akas, entryId, title } = useSelector((state) => state.currentEntry)
  const normalizedEntryId = normalizeEntryId(entryId)

  const selectedAka = useMemo(
    () => akas.find((aka) => aka.id === selectedAkaId) ?? null,
    [akas, selectedAkaId]
  )

  useEffect(() => {
    if (normalizedEntryId == null) {
      setSuggestions([])
      return undefined
    }

    let cancelled = false

    const loadSuggestions = async () => {
      setSuggestionsLoading(true)
      try {
        const response = await axiosInstance.get(`api/akas/${normalizedEntryId}/suggestions`)
        if (!cancelled) {
          setSuggestions(response.data?.suggestions ?? [])
        }
      } catch {
        if (!cancelled) {
          setSuggestions([])
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false)
        }
      }
    }

    loadSuggestions()

    return () => {
      cancelled = true
    }
  }, [normalizedEntryId, title, akas])

  useEffect(() => {
    if (selectedAkaId == null) return
    const stillExists = akas.some((aka) => aka.id === selectedAkaId)
    if (!stillExists) {
      setSelectedAkaId(null)
    }
  }, [akas, selectedAkaId])

  const availableSuggestions = useMemo(() => {
    const existing = new Set(akas.map((aka) => aka.aka_value.toLowerCase()))
    return suggestions.filter((suggestion) => !existing.has(suggestion.toLowerCase()))
  }, [suggestions, akas])

  const autocompleteOptions = useMemo(() => {
    if (!akaInput.trim()) {
      return availableSuggestions
    }

    const query = akaInput.toLowerCase()
    return availableSuggestions.filter((suggestion) => suggestion.includes(query))
  }, [availableSuggestions, akaInput])

  const handleAddAka = useCallback(() => {
    if (!akaInput.trim() || normalizedEntryId == null) return
    dispatch(addAka({ aka: akaInput, entryId: normalizedEntryId }))
    setAkaInput('')
  }, [akaInput, dispatch, normalizedEntryId])

  const handleAddSuggestedAka = useCallback(
    (suggestion) => {
      if (!suggestion || normalizedEntryId == null) return
      dispatch(addAka({ aka: suggestion, entryId: normalizedEntryId }))
    },
    [dispatch, normalizedEntryId]
  )

  const handleDeleteAka = useCallback(
    (id) => {
      if (normalizedEntryId == null) return
      dispatch(deleteAka({ akaId: id, entryId: normalizedEntryId }))
    },
    [dispatch, normalizedEntryId]
  )

  const handleSelectAka = useCallback((id) => {
    setSelectedAkaId(id)
  }, [])

  const handleCancelCanonTitle = useCallback(() => {
    setSelectedAkaId(null)
  }, [])

  const handleConfirmCanonTitle = useCallback(() => {
    if (normalizedEntryId == null || selectedAkaId == null) return
    dispatch(setCanonTitleFromAka({ entryId: normalizedEntryId, akaId: selectedAkaId }))
    setSelectedAkaId(null)
  }, [dispatch, normalizedEntryId, selectedAkaId])

  const renderCanonTitleConfirm = () => (
    <div className={styles.confirmView}>
      <h2 className={styles.confirmTitle}>Set as canon title?</h2>
      {selectedAka ? <p className={styles.confirmAka}>{selectedAka.aka_value}</p> : null}
      <div className={styles.confirmButtons}>
        <DefaultButton onClick={handleConfirmCanonTitle}>Yes</DefaultButton>
        <DefaultButton onClick={handleCancelCanonTitle}>No</DefaultButton>
      </div>
    </div>
  )

  const renderAkaList = () => (
    <>
      <h2>AKA:</h2>
      <div className={styles.currentAkasContainer}>
        {akas.map((aka) => (
          <div key={aka.id} className={styles.akaItem}>
            <div className={styles.akaRow}>
              <button
                type="button"
                className={styles.aka}
                onClick={() => handleSelectAka(aka.id)}
                aria-label={`Set ${aka.aka_value} as canon title`}
              >
                {aka.aka_value}
              </button>
              <TextButton onClick={() => handleDeleteAka(aka.id)} tooltip="Delete AKA">
                X
              </TextButton>
            </div>
          </div>
        ))}
      </div>
      {title ? <p className={styles.suggestionsLabel}>Click to add suggestions:</p> : null}
      {suggestionsLoading ? <p className={styles.suggestionsStatus}>Loading suggestions…</p> : null}
      {!suggestionsLoading && availableSuggestions.length > 0 ? (
        <div className={styles.suggestionsContainer}>
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.suggestionChip}
              onClick={() => handleAddSuggestedAka(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      {!suggestionsLoading && title && availableSuggestions.length === 0 ? (
        <p className={styles.suggestionsStatus}>No synonym suggestions found for this title.</p>
      ) : null}
      <div className={styles.akasInputContainer}>
        <DefaultAutoCompleteInput
          inputValue={akaInput}
          onChange={(value) => setAkaInput(value.toLowerCase())}
          options={autocompleteOptions}
          placeholder={'Add Aka Here'}
          className={styles.akasInput}
        />
        <DefaultButton onClick={handleAddAka}>ADD</DefaultButton>
      </div>
    </>
  )

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.AKAS_INPUT}>
      <div className={styles.wrapper}>{selectedAkaId != null ? renderCanonTitleConfirm() : renderAkaList()}</div>
    </BaseModalWrapper>
  )
}
