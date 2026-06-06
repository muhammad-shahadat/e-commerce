import React from 'react'
import Header from '../components/user/Header'
import Footer from '../components/user/Footer'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <>
      <Header />
      <main>
        {/* রুট অনুযায়ী পরিবর্তনশীল চাইল্ড পেজগুলো এখানে রেন্ডার হবে */}
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default UserLayout
