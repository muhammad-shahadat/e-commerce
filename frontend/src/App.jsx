import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './Pages/user/Home'
import ShopCategory from './Pages/user/ShopCategory'
import Cart from './Pages/user/Cart'
import Login from './Pages/shared/Login'
import Product from './Pages/user/Product'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './Pages/admin/Dashboard'
import AddProduct from './Pages/admin/AddProduct'
import Orders from './Pages/admin/Orders'
import CreateCategory from './Pages/admin/CreateCategory'

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/men" element={<ShopCategory category="men" />} />
          <Route path="/women" element={<ShopCategory category="women" />} />
          <Route path="/kids" element={<ShopCategory category="kids" />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:productId" element={<Product />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          {/* ইনডেক্স রাউট মানে হলো শুধু /admin লিখলে এটা দেখাবে */}
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="create-category" element={<CreateCategory />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
