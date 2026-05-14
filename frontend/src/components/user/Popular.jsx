import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import Item from './Item'
import { useGetProducts } from '../../hooks/useProductQueries'

const Popular = () => {
  const navigate = useNavigate() // navigate ফাংশনটি ডিফাইন করুন
  const limit = 12 // Per page items

  // Passing page, limit and sort to our hook
  const { data, isLoading, isError } = useGetProducts({
    sort: 'popular',
    limit: limit,
    page: 1,
  })

  // Section level Loading
  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-red-500 font-medium">
          Something went wrong. Please try again.
        </p>
      </div>
    )
  }

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-16 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        {/* --- Section Header --- */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-tight">
            Popular Items
          </h1>
          <div className="w-24 md:w-32 h-1.5 bg-indigo-600 rounded-full shadow-sm"></div>
          <p className="text-gray-500 text-sm md:text-base mt-2 font-medium">
            Discover what is trending right now
          </p>
        </div>

        {/* --- Products Grid --- */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {data?.productData?.map((product, index) => {
            let currentPrice =
              Number(product.base_price) +
              Number(product.min_price_modifier || 0)
            currentPrice =
              currentPrice - currentPrice * (product.discount_percent / 100)
            return (
              <div
                key={product.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-forwards"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Item
                  id={product.id}
                  title={product.title}
                  image={product.main_image}
                  newPrice={currentPrice}
                  oldPrice={
                    Number(product.base_price) +
                    Number(product.min_price_modifier)
                  }
                  slug={product.slug}
                />
              </div>
            )
          })}
        </div>

        {/* --- View More Button (Optional) --- */}
        <button
          onClick={() => navigate('/shop?sort=popular')}
          className="mt-8 px-10 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300"
        >
          Explore All Products
        </button>
      </div>
    </section>
  )
}

export default Popular
