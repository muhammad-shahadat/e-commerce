import React from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Item from '../user/Item'
import { useGetRelatedProducts } from '../../hooks/useProductQueries'

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const limit = 12
  const navigate = useNavigate()

  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useGetRelatedProducts(categoryId, currentProductId, limit)

  const categorySlug = relatedProducts?.[0]?.category_slug || []
  const handleSeeMore = () => {
    if (categorySlug) {
      navigate(`/shop?category=${categorySlug}`)
    } else {
      navigate('/shop') // backup if api fail.
    }
  }

  if (isLoading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="w-full py-20 text-center">
        <p className="text-red-500 font-medium">
          Failed to load related products.
        </p>
      </div>
    )
  }

  if (!relatedProducts || relatedProducts.length === 0) return null

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        {/* --- Section Header --- */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 uppercase tracking-tight text-center">
            Related Products
          </h1>
          <div className="w-20 md:w-32 h-1.5 bg-[#ff4433] rounded-full"></div>
          <p className="text-gray-400 text-sm md:text-base mt-2 font-medium italic">
            You might also like these collections
          </p>
        </div>

        {/* --- Products Grid --- */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {relatedProducts?.map((product, index) => {
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
                    Number(product.min_price_modifier || 0)
                  }
                  slug={product.slug}
                />
              </div>
            )
          })}
        </div>

        {/* --- Action Button --- */}
        <div className="mt-4">
          <button
            onClick={handleSeeMore}
            className="text-[#ff4433] font-bold border-b-2 border-[#ff4433] pb-1 hover:text-red-700 hover:border-red-700 transition-all cursor-pointer"
          >
            See More Suggestions
          </button>
        </div>
      </div>
    </section>
  )
}

export default RelatedProducts
