import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useGetProduct } from '../../hooks/useProductQueries'
import Breadcrumbs from '../../Components/user/Breadcrumbs/Breadcrumbs'
import ProductDisplay from '../../Components/user/ProductDisplay'
import DescriptionBox from '../../Components/user/DescriptionBox/DescriptionBox'
import RelatedProducts from '../../Components/user/RelatedProducts'

const Product = () => {
  const { slug } = useParams()

  const { data: productData, isLoading, isError } = useGetProduct(slug)

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    )

  if (isError || !productData)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Product not found!
      </div>
    )

  return (
    <div>
      <Breadcrumbs
        categoryTree={productData.categoryTree}
        title={productData.product.title}
      />

      {/* 'key' ব্যবহার করা হয়েছে যাতে প্রতিবার নতুন প্রোডাক্টে ক্লিক করলে স্টেটগুলো রিসেট (mount & unmount) হয়ে যায় */}
      <ProductDisplay key={productData.product.id} productData={productData} />
      <DescriptionBox description={productData.product.description} />
      <RelatedProducts
        categoryId={productData.product.category_id}
        currentProductId={productData.product.id}
      />
    </div>
  )
}

export default Product
