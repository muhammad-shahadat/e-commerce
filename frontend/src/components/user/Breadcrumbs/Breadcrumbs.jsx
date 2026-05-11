import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

const Breadcrumbs = ({ categoryTree, title }) => {
  if (!categoryTree || !title) return null

  return (
    <nav className="w-full px-6 md:px-16 lg:px-24 py-5 bg-white">
      <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-3 text-sm md:text-base font-medium text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
          <div key={index} className="flex items-center gap-2">
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
        <span className="text-gray-900 font-bold truncate capitalize">
          {title}
        </span>
      </div>
    </nav>
  )
}

export default Breadcrumbs
