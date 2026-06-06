import React from 'react'
import Header from '../components/user/Header'
import Footer from '../components/user/Footer'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    /* w-full: পুরো স্ক্রিনের সমান চওড়া (Width: 100%) নিশ্চিত করে।
      min-h-screen: কন্টেন্ট কম থাকলেও ব্যাকগ্রাউন্ড যেন পুরো স্ক্রিন জুড়ে থাকে (Min-height: 100vh)।
      relative: ভবিষ্যতে এই বডির সাপেক্ষে কোনো এলিমেন্টকে (যেমন: টোস্ট, পপআপ) absolute পজিশনিং করার জন্য।
    */
    <div className="w-full min-h-screen relative">
      <Header />
      <main>
        {/* রুট অনুযায়ী পরিবর্তনশীল চাইল্ড পেজগুলো এখানে রেন্ডার হবে */}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default UserLayout
