import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Search,
  SlidersHorizontal,
  Bell,
  Eye,
  ShoppingBag,
} from 'lucide-react'

import { useDeleteProduct } from '../../hooks/useProductMutations'
import { useGetProducts } from '../../hooks/useProductQueries'
import useGetCategories from '../../hooks/useCategoryQueries'
import useProductStore from '../../stores/useProductStore'

const ProductList = () => {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const [localSearch, setLocalSearch] = useState(
    searchParams.get('search') || '',
  )

  const { lastAddedProduct, totalProductsCreated } = useProductStore()
  const { data: categories } = useGetCategories()

  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || ''
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page')) || 1

  const { data, isLoading, isError } = useGetProducts({
    category,
    sort,
    search,
    page,
    limit: 8,
  })

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()

  const productList = data?.productData || []
  const pagination = data?.pagination || {}

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleUpdateFilter('search', localSearch)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [localSearch])

  const handleUpdateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)

    newParams.set('page', 1)
    setSearchParams(newParams)
  }

  const handleDelete = (productId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this product permanently?',
      )
    ) {
      deleteProduct(productId)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 font-semibold">
        Error loading dashboard data. Please refresh page.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {lastAddedProduct && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-2 bg-emerald-500 rounded-xl text-white">
            <Bell size={18} />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-emerald-900">
              Successfully Synchronized!
            </h5>
            <p className="text-xs text-emerald-700 mt-0.5">
              Last created product:{' '}
              <span className="font-semibold">
                &quot;{lastAddedProduct.title}&quot;
              </span>{' '}
              (SKU: {lastAddedProduct.productSku}). Total created in this
              session: {totalProductsCreated}.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Product Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Total inventory variance:{' '}
            <span className="font-bold text-gray-700">
              {pagination?.totalProducts || 0}
            </span>{' '}
            items registered
          </p>
        </div>

        {/* অ্যাড বোতামে চাপ দিলে একদম ফ্রেশ/ব্ল্যাঙ্ক ইউআরএল-এ নিয়ে যাবে */}
        <button
          onClick={() => navigate('/admin/products/add')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by product name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SlidersHorizontal
              size={16}
              className="text-gray-400 hidden sm:block"
            />
            <select
              value={category}
              onChange={(e) => handleUpdateFilter('category', e.target.value)}
              className="w-full sm:w-44 text-xs font-semibold bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sort}
            onChange={(e) => handleUpdateFilter('sort', e.target.value)}
            className="w-full sm:w-40 text-xs font-semibold bg-gray-50 border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">Default</option>
            <option value="new">New Arrivals</option>
            <option value="popular">Most Viewed</option>
            <option value="bestseller">Best Selling</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {productList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Product Information</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Base Price</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6 text-center">Analytics</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {productList.map((product) => {
                  const base = Number(product.base_price)
                  const modifier = Number(product.min_price_modifier || 0)
                  const fullBasePrice = base + modifier
                  const finalPrice =
                    fullBasePrice -
                    fullBasePrice * (Number(product.discount_percent) / 100)

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/40 transition-colors"
                    >
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center">
                          {product.main_image ? (
                            <img
                              src={product.main_image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="text-gray-300" size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 max-w-[240px]">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5 max-w-[200px]">
                            ID: {product.id}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                          {product.category_name || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900">
                        ${finalPrice.toFixed(2)}
                        {modifier > 0 && (
                          <span className="text-xs text-gray-400 font-normal block">
                            +{modifier} variant min
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {Number(product.discount_percent) > 0 ? (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-black">
                            {parseInt(product.discount_percent)}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye size={14} /> {product.view_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingBag size={14} /> {product.sold_count}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* এডিটে ক্লিক করলে কুয়েরি স্ট্রিং-এ আইডি পাস হচ্ছে */}
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/products/edit?slug=${product.slug}`,
                              )
                            }
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                            title="Edit Product"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting}
                            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40 active:scale-90"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed rounded-2xl border-gray-100 text-gray-400 font-medium">
            No products match your filters or search query.
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-gray-500 font-semibold">
              Showing page {page} of {pagination?.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => handleUpdateFilter('page', page - 1)}
                className="p-2 bg-white rounded-xl border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-bold text-gray-800 px-2">
                {page}
              </span>

              <button
                disabled={!pagination?.nextPage}
                onClick={() => handleUpdateFilter('page', page + 1)}
                className="p-2 bg-white rounded-xl border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
