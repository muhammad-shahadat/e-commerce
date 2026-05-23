import { useQuery } from '@tanstack/react-query'
import api from '../api/api' // আপনার কাস্টম axios ইন্সট্যান্স

// ১. সব অর্ডারের লিস্ট আনার হুক (ফিল্টার সহ)
export const useGetOrders = (params) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await api.get('/api/orders', { params })
      return res.data.payload
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // ২ মিনিট ডাটা ফ্রেশ থাকবে
  })
}

// ২. সিঙ্গেল অর্ডারের ডিটেইলস আনার হুক
export const useGetOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get(`/api/orders/${id}`)
      return res.data.payload
    },
    enabled: !!id, // আইডি থাকলে তবেই ফায়ার হবে
  })
}
