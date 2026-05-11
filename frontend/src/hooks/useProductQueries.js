import { useQuery } from '@tanstack/react-query'

import api from '../api/api'

export const useGetProducts = (params) => {
  return useQuery({
    // Includes params in the key to trigger a refetch when page, sort, or filters change
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/api/products/', { params })
      return res.data.payload
    },
    // Keeps current data visible while fetching new data for better UX
    placeholderData: (previousData) => previousData,
    retry: 2,
    // Data remains 'fresh' for 5 minutes
    staleTime: 1000 * 60 * 5,
  })
}

export const useGetRelatedProducts = (
  categoryId,
  currentProductId,
  limit = 8,
) => {
  return useQuery({
    queryKey: ['related-products', categoryId, currentProductId, limit],
    queryFn: async () => {
      const res = await api.get(`/api/products/related/${categoryId}`, {
        params: {
          exclude: currentProductId,
          limit: limit,
        },
      })
      return res.data.payload
    },
    enabled: !!categoryId && !!currentProductId,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

export const useGetProduct = (slug) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await api.get(`/api/products/${slug}`)
      return res.data.payload
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  })
}
