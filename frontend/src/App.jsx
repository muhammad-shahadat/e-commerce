import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './Pages/user/Home'
import Cart from './Pages/user/Cart'
import Login from './Pages/shared/Login'
import Product from './Pages/user/Product'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './Pages/admin/Dashboard'
import AddProduct from './Pages/admin/AddProduct'
import Orders from './Pages/admin/Orders'
import CreateCategory from './Pages/admin/CreateCategory'
import ScrollToTop from './components/shared/ScrollToTop'
import OrderSuccess from './pages/user/OrderSuccess'
import Shop from './pages/user/Shop'
import ProductList from './pages/admin/ProductList'
import ProductEditPage from './pages/admin/ProductEditPage'

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {/* 🚀 এখানে বসিয়ে দিন, তাহলে পুরো সাইটে আর কোথাও স্ক্রল নিয়ে চিন্তা করতে হবে না */}
      <ScrollToTop />
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:slug" element={<Product />} />

          <Route path="/order-success" element={<OrderSuccess />} />
        </Route>

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
