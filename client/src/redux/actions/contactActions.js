import axiosInstance from '@utils/axiosInstance'
import { SUBMIT_CONTACT_FORM, CONTACT_FORM_ERROR } from './actionTypes'

export const submitContact =
  ({ name, email, message }) =>
  async (dispatch) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const body = JSON.stringify({ name, email, message })

    try {
      const res = await axiosInstance.post('/api/contact', body, config)
      dispatch({
        type: SUBMIT_CONTACT_FORM,
      })
    } catch (err) {
      dispatch({
        type: CONTACT_FORM_ERROR,
      })
    }
  }
