import React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'

import { useGetProducts } from '../../hooks/useProductQueries'
import useGetCategories from '../../hooks/useCategoryQueries'
import Item from '../../components/user/Item'

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // ক্যাটাগরি ডাটা (আপনার হুক সরাসরি payload রিটার্ন করছে)
  const { data: categories } = useGetCategories()

  // URL Params ধরা
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page')) || 1

  // প্রোডাক্ট ডাটা (আপনার হুক সরাসরি payload রিটার্ন করছে)
  const { data, isLoading, isError } = useGetProducts({
    category, // it stores category slug.
    sort,
    search,
    page,
    limit: 12,
  })

  // ডাটা ম্যাপিং সহজ করার জন্য ভেরিয়েবলে রাখা
  // কারণ আপনার হুকে লেখা আছে: return res.data.payload
  const productList = data?.productData || []
  const pagination = data?.pagination || {}

  const handleUpdateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)

    // ফিল্টার বদলালে সবসময় পেজ ১ এ নিয়ে যাবে
    newParams.set('page', 1)
    setSearchParams(newParams)
  }

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    )

  if (isError)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Error loading products. Please try again.
      </div>
    )

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-10">
      {/* --- Sidebar Filter --- */}
      <aside className="w-full md:w-64 space-y-8">
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <SlidersHorizontal size={18} /> Filters
          </h3>
          <div className="space-y-6">
            {/* ১. ক্যাটাগরি ফিল্টার */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">Category</p>
              <select
                className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={category}
                onChange={(e) => handleUpdateFilter('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ২. সর্টিং ফিল্টার */}
            <div>
              <p className="font-semibold text-gray-700 mb-2">Sort By</p>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: 'New Arrivals', value: 'new' },
                  { label: 'Popular', value: 'popular' },
                  { label: 'Best Seller', value: 'bestseller' },
                ].map((s) => (
                  <label
                    key={s.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="sort"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      checked={sort === s.value}
                      onChange={() => handleUpdateFilter('sort', s.value)}
                    />
                    <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Product List Area --- */}
      <main className="flex-1">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-gray-600 font-medium">
            <span className="text-gray-900 font-bold">
              {pagination?.totalProducts || 0}
            </span>{' '}
            Products found
          </p>
          {search && (
            <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100">
              Results for: &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Product Grid */}
        {productList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productList.map((product, index) => {
              let currentPrice =
                Number(product.base_price) +
                Number(product.min_price_modifier || 0)
              currentPrice = (
                currentPrice -
                currentPrice * (product.discount_percent / 100)
              ).toFixed(2)
              return (
                <div
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-forwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Item
                    key={product.id}
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
        ) : (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl border-gray-100 text-gray-400 font-medium">
            No products match your filters.
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => handleUpdateFilter('page', page - 1)}
              className="p-3 rounded-full border-2 border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>

            <span className="text-gray-700 font-bold px-4">
              {page} / {pagination?.totalPages}
            </span>

            <button
              disabled={!pagination?.nextPage}
              onClick={() => handleUpdateFilter('page', page + 1)}
              className="p-3 rounded-full border-2 border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Shop
