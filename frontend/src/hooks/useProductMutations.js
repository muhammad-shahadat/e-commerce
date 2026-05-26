import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '../api/api'
import useProductStore from '../stores/useProductStore'

export const useCreateProducts = () => {
  const queryClient = useQueryClient()
  const { onProductSuccess } = useProductStore()

  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/api/products/', formData)
      return res.data.payload
    },

    onSuccess: (data, variables, context) => {
      onProductSuccess(data) // Zustand update
      queryClient.invalidateQueries(['products'])
      const title = variables.get('title') // variables received formData that is not js object. so used get()
      toast.success(`${title} Created Successfully`)
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || 'Error creating product!')
    },
  })
}

export const useUpdateProductBasicInfo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ slug, updateData }) => {
      // কন্ট্রোলার অনুযায়ী PATCH মেথড এবং URL-এ slug পাস হবে
      const res = await api.patch(
        `/api/products/${slug}/basic-info`,
        updateData,
      )
      return res.data.payload
    },

    onSuccess: (data, variables) => {
      // প্রোডাক্ট লিস্ট এবং ওই স্পেসিফিক প্রোডাক্টের ক্যাশ ডাটা ইনভ্যালিডেট করা
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', variables.slug] })

      toast.success('Product basic information updated successfully!')
    },

    onError: (err) => {
      const errorMessage =
        err.response?.data?.message || 'Failed to update product info!'
      toast.error(errorMessage)
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // mutationFn এ আমরা প্রোডাক্ট আইডি (id) রিসিভ করব
    mutationFn: async (id) => {
      const res = await api.delete(`/api/products/${id}`)
      return res.data.payload
    },

    // variables এর ভেতরে মূলত ওই পাস করা id-টাই পাওয়া যাবে
    onSuccess: (data, variables) => {
      // ১. প্রোডাক্টস লিস্ট ক্যাশ ইনভ্যালিডেট করা (যাতে টেবিল অটো-রিফ্রেশ হয়)
      queryClient.invalidateQueries(['products'])

      // ২. সাকসেস মেসেজ টোস্ট আকারে দেখানো
      toast.success('Product Deleted Successfully')
    },

    onError: (err) => {
      // ব্যাকএন্ডের custom error message (যেমন: "This product cannot be deleted because...") হ্যান্ডেল করা
      const errorMessage =
        err.response?.data?.message || 'Error deleting product!'
      toast.error(errorMessage)
    },
  })
}
