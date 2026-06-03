import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'

import Home from './pages/user/Home'
import Cart from './pages/user/Cart'
import Login from './pages/shared/Login'
import Product from './pages/user/Product'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import AddProduct from './pages/admin/AddProduct'
import Orders from './pages/admin/Orders'
import CreateCategory from './pages/admin/CreateCategory'
import ScrollToTop from './components/shared/ScrollToTop'
import Loading from './pages/shared/Loading'
import useUIStore from './stores/useUIStore'
import OrderSuccess from './pages/user/OrderSuccess'
import Shop from './pages/user/Shop'
import ProductList from './pages/admin/ProductList'
import ProductEditPage from './pages/admin/ProductEditPage'

function App() {
  // 👈 UI Store থেকে সার্ভার লোডিং স্টেট এবং সেট করার ফাংশন নিয়ে আসলাম
  const { isServerLoading, setServerLoading } = useUIStore()

  useEffect(() => {
    const wakeupServer = async () => {
      try {
        // 💡 আপনার ব্যাকএন্ডের হেলথ চেক রুট বা মেইন রুট (Render-এর URL)
        const backendUrl =
          import.meta.env.BACKEND_HEALTH_URL || 'http://localhost:3000/health'
        await axios.get(backendUrl)
      } catch (error) {
        console.error('Server wakeup failed or cold start:', error.message)
      } finally {
        // 🚀 সার্ভার থেকে রেসপন্স আসুক বা এরর খাক, লোডিং স্ক্রিন ফলস করে অ্যাপ ওপেন করে দেবে
        setServerLoading(false)
      }
    }

    wakeupServer()
  }, [setServerLoading])

  // 💡 যতক্ষণ সার্ভার ব্যাকএন্ড থেকে রেসপন্স না দিচ্ছে, ততক্ষণ এই স্ক্রিন ফুল লক থাকবে
  if (isServerLoading) {
    return <Loading />
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {/* 🚀 এখানে বসিয়ে দিন, তাহলে পুরো সাইটে আর কোথাও স্ক্রল নিয়ে চিন্তা করতে হবে না */}
      <ScrollToTop />

      <Routes>
        {/* ─── CUSTOMER ROUTES ────────────────────────────────────── */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

        {/* ─── ADMIN ROUTES ───────────────────────────────────────── */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* ইনডেক্স রাউট মানে হলো শুধু /admin লিখলে এটা দেখাবে */}
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          {/* প্রোডাক্ট লিস্ট বা ম্যানেজমেন্ট পেজ */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit" element={<ProductEditPage />} />
          <Route path="create-category" element={<CreateCategory />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
