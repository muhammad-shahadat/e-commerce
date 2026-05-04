import React from 'react'
import Item from './Item'
import popularProduct from '../../assets/product/popularProduct'

const RelatedProducts = () => {
  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-20 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        {/* --- Section Header --- */}
        <div className="flex flex-col items-center gap-2 group">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 uppercase tracking-tight">
            Related Products
          </h1>
          <div className="w-20 md:w-28 h-1.5 bg-indigo-600 rounded-full transition-all duration-500 group-hover:w-40"></div>
          <p className="text-gray-400 text-sm md:text-base mt-2 font-medium italic">
            You might also like these collections
          </p>
        </div>

        {/* --- Responsive Products Grid --- */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {/* এখানে popularProduct থেকে স্লাইস করে প্রথম ৪টি দেখানো ভালো */}
          {popularProduct.slice(0, 4).map((product, index) => (
            <div
              key={product.id || index}
              className="animate-in fade-in zoom-in-95 duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Item
                id={product.id}
                title={product.title}
                image={product.image}
                newPrice={product.newPrice}
                oldPrice={product.oldPrice}
              />
            </div>
          ))}
        </div>

        {/* --- Action Button --- */}
        <div className="mt-4">
          <button className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1 hover:text-indigo-800 hover:border-indigo-800 transition-all cursor-pointer">
            See More Suggestions
          </button>
        </div>
      </div>
    </section>
  )
}

export default RelatedProducts
