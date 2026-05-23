import { useQuery } from '@tanstack/react-query'
import api from '../api/api'

// ১. ড্যাশবোর্ডের টপ ৪টি স্ট্যাটস কার্ডের ডাটা আনার হুক
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/dashboard/stats')
      return res.data.payload
    },
    staleTime: 1000 * 60 * 5, // ৫ মিনিট ডাটা ফ্রেশ থাকবে
  })
}

// ২. ড্যাশবোর্ডের চার্ট ডাটা (Sales Trend, Pie, Bar Charts) আনার হুক
export const useGetDashboardCharts = () => {
  return useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async () => {
      const res = await api.get('/api/admin/dashboard/charts')
      return res.data.payload
    },
    staleTime: 1000 * 60 * 5,
  })
}

// ৩. লো-স্টক প্রোডাক্টের ডাইনামিক হুক (পেজিনেশন ও সার্চ সহ)
export const useGetLowStockWidget = (params) => {
  return useQuery({
    queryKey: ['dashboard-low-stock', params], // params চেঞ্জ হলেই আবার ফায়ার হবে
    queryFn: async () => {
      const res = await api.get('/api/admin/inventory/low-stock', { params })
      return res.data.payload
    },
    placeholderData: (previousData) => previousData, // পেজ চেঞ্জ করার সময় স্ক্রিন লাফাবে না
    staleTime: 1000 * 60 * 2,
  })
}
