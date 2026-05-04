import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '../api/api'

export const useCreateCategories = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (catData) => {
      const res = await api.post('/api/categories/', catData)
      return res.data.payload
    },

    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['categories'])
      const name = variables.categoryName || 'Category'
      toast.success(`${name} Created Successfully`)
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating category!')
    },
  })
}
