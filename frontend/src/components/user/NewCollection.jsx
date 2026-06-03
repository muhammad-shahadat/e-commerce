import React, { useState } from 'react'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Item from '../user/Item'
import { useGetProducts } from '../../hooks/useProductQueries'

const NewCollection = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 8 // Per page items

  // Passing page, limit and sort to our hook
  const { data, isLoading, isError, isFetching } = useGetProducts({
    sort: 'new',
    limit: limit,
    page: currentPage,
  })

  const handleNext = () => {
    if (data?.pagination.nextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (data?.pagination.previousPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }

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
    <section className="w-full px-6 md:px-16 lg:px-24 py-20 bg-[#f9fafb] relative">
      {/* Background fetching indicator (Small loader at top-right) */}
      {isFetching && !isLoading && (
        <div className="absolute top-5 right-5">
          <Loader2 className="w-5 h-5 text-[#ff4433] animate-spin" />
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 uppercase tracking-tight text-center">
            New Collection
          </h1>
          <div className="w-20 md:w-32 h-1.5 bg-[#ff4433] rounded-full"></div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {data?.productData?.map((product, index) => {
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

        {/* --- Pagination Controls --- */}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={handlePrev}
            disabled={!data?.pagination.previousPage || isFetching}
            className="p-3 rounded-full border-2 border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>

          <span className="font-bold text-lg text-gray-900">
            {data?.pagination.currentPage} / {data?.pagination.totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={!data?.pagination.nextPage || isFetching}
            className="p-3 rounded-full border-2 border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default NewCollection
