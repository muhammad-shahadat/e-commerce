import { useMutation, useQueryClient } from '@tanstack/react-query'
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

// ৩. অর্ডার স্ট্যাটাস আপডেটের মিউটেশন (ক্যাশ অটো-রিফ্রেশ মেকানিজম সহ)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.patch(`/api/orders/${id}`, { status })
      return res.data.payload
    },
    onSuccess: (data, variables) => {
      // অর্ডার লিস্ট এবং নির্দিষ্ট সিঙ্গেল অর্ডারের ক্যাশ ইনভ্যালিডেট করা
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] })

      toast.success('Order Status Update Successfully!')
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.message || 'Order Status Update Failed. Try again!',
      )
    },
  })
}
