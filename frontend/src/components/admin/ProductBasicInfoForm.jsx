import React, { useState, useEffect } from 'react'
import { Tag, ChevronDown, Loader2, Save } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import useGetCategories from '../../hooks/useCategoryQueries'
import { useUpdateProductBasicInfo } from '../../hooks/useProductMutations'

const ProductBasicInfoForm = ({ product, categoryTree = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams() // ইউআরএল হ্যান্ডেল করার জন্য
  // অল ক্যাটাগরি লিস্ট ফেচ
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategories()
  const { mutate: updateBasicInfo, isPending } = useUpdateProductBasicInfo()

  // ১. ইনপুট স্টেট (ডাটাবেজের ওল্ড ডাটা দিয়ে ইনিশেশিয়ালাইজড)
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    base_price: product?.base_price || '',
    discount_percent: product?.discount_percent || 0,
    category_id: product?.category_id || '',
    is_active: product?.is_active ?? true,
  })

  // ক্যাটাগরি চেইন ট্র্যাকিং স্টেট (e.g., [Men_ID, T-Shirt_ID])
  const [selectedChain, setSelectedChain] = useState([])

  // প্যারেন্ট থেকে আসা প্রডাক্ট ডাটার উপর ভিত্তি করে চেইন ইনিশেশিয়ালাইজ করা
  useEffect(() => {
    if (categoryTree && categoryTree.length > 0) {
      const chainIds = categoryTree.map((cat) => cat.id)
      setSelectedChain(chainIds)
    }
  }, [categoryTree])

  // ২. রিলেশন ফিল্টারিং লজিক (Parent/Sub category)
  const getSubCategories = (parentId) => {
    return categories.filter((cat) => cat.parent_id === parentId)
  }

  // ৩. ডাইনামিক ক্যাটাগরি চেইন হ্যান্ডলার
  const handleChangeCategory = (index, value) => {
    if (!value) {
      // ইউজার যদি 'Select' সিলেক্ট করে তবে চেইনের ওই ইডেক্স থেকে পরের টুকু ট্রিম হবে
      const newChain = selectedChain.slice(0, index)
      setSelectedChain(newChain)
      const lastSelectedId =
        newChain.length > 0 ? newChain[newChain.length - 1] : ''
      setFormData({ ...formData, category_id: lastSelectedId })
      return
    }

    const newChain = [...selectedChain.slice(0, index), value]
    setSelectedChain(newChain)
    setFormData({ ...formData, category_id: value })
  }

  // ৪. সাধারণ ইনপুট চেঞ্জ হ্যান্ডলার
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  // ৫. সাবমিট এবং ডাইনামিক পে-লোড অপ্টিমাইজেশন (Only Changed Fields)
  const handleSubmit = (e) => {
    e.preventDefault()

    const updateData = {}

    // ব্যাকএন্ডে অহেতুক ডাটা পুশ না করে শুধু মডিফাইড ডাটা চেক করা
    if (formData.title !== product.title) updateData.title = formData.title
    if (formData.description !== product.description)
      updateData.description = formData.description
    if (Number(formData.base_price) !== Number(product.base_price))
      updateData.base_price = formData.base_price
    if (Number(formData.discount_percent) !== Number(product.discount_percent))
      updateData.discount_percent = formData.discount_percent
    if (formData.category_id !== product.category_id)
      updateData.category_id = formData.category_id || null
    if (formData.is_active !== product.is_active)
      updateData.is_active = formData.is_active

    // যদি কোনো কিছুই চেঞ্জ না করা হয়
    if (Object.keys(updateData).length === 0) {
      return // নো চেঞ্জ, কোনো এপিআই রিকোয়েস্ট যাবে না
    }

    // মিউটেশন ট্রিগার
    updateBasicInfo(
      {
        slug: product.slug,
        updateData,
      },
      {
        // প্রোডাকশন ট্রিক: মিউটেশন সাকসেস হলে এই callback এক্সিকিউট হবে
        onSuccess: (updatedProductData) => {
          // যদি টাইটেল চেঞ্জ হওয়ার কারণে ব্যাকএন্ড নতুন স্লাগ জেনারেট করে থাকে
          if (
            updatedProductData.product &&
            updatedProductData.product.slug !== product.slug
          ) {
            const newParams = new URLSearchParams(searchParams)
            newParams.set('slug', updatedProductData.product.slug) // ইউআরএলে নতুন স্লাগ সেট করলাম

            // ব্রাউজারের হিস্ট্রি নষ্ট না করে ইউআরএল আপডেট (replace: true)
            setSearchParams(newParams, { replace: true })
          }
        },
      },
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      {/* Title Block */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2 text-blue-600">
          <Tag size={22} />
          <h3 className="text-lg font-bold text-gray-800">
            Product Core Specifications
          </h3>
        </div>

        {/* Toggle block status inside core form */}
        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          <span className="text-xs font-bold text-gray-600 uppercase">
            Live Store
          </span>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Title Input */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
            Product Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
            placeholder="e.g. Premium Cotton T-Shirt"
          />
        </div>

        {/* Pricing Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
              Base Price ($)
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
              Discount Percentage (%)
            </label>
            <input
              type="number"
              name="discount_percent"
              value={formData.discount_percent}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Multi-Level Hierarchical Category Segment */}
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 space-y-3">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
            Hierarchical Category Chain
          </label>

          {/* Main Select Box */}
          <div className="relative">
            <select
              value={selectedChain[0] || ''}
              onChange={(e) => handleChangeCategory(0, e.target.value)}
              disabled={isCategoriesLoading}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            >
              {isCategoriesLoading ? (
                <option>Fetching categories...</option>
              ) : (
                <>
                  <option value="">Select Main Category</option>
                  {getSubCategories(null).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown
              className="absolute right-3 top-4 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>

          {/* Dynamic Recursive Child Categories Chain */}
          {selectedChain.map((id, index) => {
            const subCats = getSubCategories(id)
            if (subCats.length === 0) return null

            return (
              <div
                key={index}
                className="relative animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <select
                  value={selectedChain[index + 1] || ''}
                  onChange={(e) =>
                    handleChangeCategory(index + 1, e.target.value)
                  }
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="">Select Sub-Category (Optional)</option>
                  {subCats.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-4 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            )
          })}
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">
            Detailed Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all resize-none"
            placeholder="Write enterprise level architecture details or product feature descriptions..."
          />
        </div>

        {/* Action Button Block */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:bg-gray-400"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Update Basic Info</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductBasicInfoForm
