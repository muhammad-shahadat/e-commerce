import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useGetProduct } from '../../hooks/useProductQueries'
import ProductBasicInfoForm from '../../components/admin/ProductBasicInfoForm'
// import ProductImagesForm from './ProductImagesForm';
// import ProductVariantsForm from './ProductVariantsForm';
// import InventoryForm from './InventoryForm';

const ProductEditPage = () => {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('slug')

  // আপনার কাস্টম হুক ডিরেক্টলি কল করা হলো
  const { data: productData, isLoading, isError, error } = useGetProduct(slug)

  if (!slug) {
    return (
      <div className="p-8 text-center font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-10">
        No product slug provided in URL! Please select a product to edit.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </div>
    )
  }

  if (isError || !productData) {
    return (
      <div className="p-8 text-center font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto mt-10">
        {error?.response?.data?.message ||
          'Error loading product data or product not found.'}
      </div>
    )
  }

  const { product, categoryTree } = productData

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 font-sans md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <header className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-wider">
              <span>Management</span> / <span>Edit Product</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Modify:{' '}
              <span className="text-gray-500 font-medium">{product.title}</span>
            </h1>
          </div>
        </header>

        {/* Form Layout Grid Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Main Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* ১. প্রোডাকশন রেডি বেসিক ইনফো ফর্ম */}
            <ProductBasicInfoForm
              product={product}
              categoryTree={categoryTree}
            />

            {/* <ProductVariantsForm product={product} variants={productData.variants} /> */}
          </div>

          {/* Right Column - Media & Stock Status */}
          <div className="space-y-6">
            {/* <ProductImagesForm images={productData.images} /> */}
            {/* <InventoryForm product={product} /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductEditPage
