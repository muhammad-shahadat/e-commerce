import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '../api/api'

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async (orderPayload) => {
      const res = await api.post('/api/orders/', orderPayload)
      return res.data.payload
    },
    onSuccess: (data, variables, context) => {
      toast.success('Order Placed Successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Order failed. Try again!')
    },
  })
}
