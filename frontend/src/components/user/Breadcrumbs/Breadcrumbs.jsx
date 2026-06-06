import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

const Breadcrumbs = ({ categoryTree, title }) => {
  if (!categoryTree || !title) return null

  return (
    // 🟢 ফিক্স ১: প্যারেন্ট nav থেকে অতিরিক্ত প্যাডিং সরানো হয়েছে এবং max-w-full লক করা হয়েছে
    <nav className="w-full max-w-full bg-white border-b border-gray-50">
      {/* 🟢 ফিক্স ২: px-4 দিয়ে মোবাইল স্ক্রিনের ভেতর রাখা হয়েছে এবং overflow-x-auto নিখুঁতভাবে এই ডিভে হ্যান্ডেল করা হয়েছে */}
      <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 py-5 flex items-center gap-2 md:gap-3 text-sm md:text-base font-medium text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
        {/* Home Link */}
        <Link
          to="/"
          className="flex items-center gap-1 hover:text-red-500 transition-colors shrink-0"
        >
          <Home size={16} className="mb-0.5" />
          <span>Home</span>
        </Link>

        <ChevronRight size={16} className="text-gray-400 shrink-0" />

        {/* Shop Link */}
        <Link
          to="/shop"
          className="hover:text-red-500 transition-colors shrink-0"
        >
          Shop
        </Link>

        {categoryTree.map((cat, index) => (
          <div key={index} className="flex items-center gap-2 shrink-0">
            <ChevronRight size={16} className="text-gray-400 shrink-0" />
            <Link
              to={`/${cat.slug}`}
              className="capitalize hover:text-red-500 transition-colors shrink-0"
            >
              {cat.name}
            </Link>
          </div>
        ))}

        <ChevronRight size={16} className="text-gray-400 shrink-0" />

        {/* Current Product Title */}
        {/* 🟢 ফিক্স ৩: max-w-[150px] বা sm:max-w-[300px] দিয়ে দেওয়া হয়েছে যেন মোবাইল স্ক্রিনে অনেক বড় টাইটেল থাকলে ওটা ডট ডট (...) হয়ে যায় */}
        <span className="text-gray-900 font-bold truncate capitalize max-w-[150px] sm:max-w-[300px] md:max-w-md shrink-0">
          {title}
        </span>
      </div>
    </nav>
  )
}

export default Breadcrumbs
