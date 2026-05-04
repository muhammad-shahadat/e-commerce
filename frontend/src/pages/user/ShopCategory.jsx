import React, { useContext } from 'react'
import { ChevronDown, Filter, LayoutGrid } from 'lucide-react'

import { ShopContext } from '../../context/ShopContext'
import Item from '../../Components/user/Item'

const ShopCategory = (props) => {
  const { allCollection, isMenuOpen } = useContext(ShopContext)

  // Product filtering according to category (Clean approach)
  const filteredProducts = allCollection.filter(
    (item) => item.category === props.category,
  )

  return (
    <main
      className={`w-full min-h-screen transition-all duration-300 ${!isMenuOpen ? 'md:pl-5' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* --- Category Header & Info --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 font-medium">
            <p className="text-sm md:text-base">
              <span className="text-gray-900 font-bold">
                Showing 1-
                {filteredProducts.length > 12 ? 12 : filteredProducts.length}
              </span>{' '}
              out of {filteredProducts.length} products
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Button */}
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-full border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer text-sm uppercase tracking-wider">
              Sort by <ChevronDown size={16} />
            </button>

            {/* Filter Icon (Visual Only for now) */}
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hidden md:block">
              <LayoutGrid size={20} />
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id || index}
              className="animate-in fade-in slide-in-from-bottom-5 duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
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

        {/* --- Empty State --- */}
        {filteredProducts.length === 0 && (
          <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Filter size={48} className="mb-4 opacity-20" />
            <p className="text-xl font-medium">
              No products found in this category.
            </p>
          </div>
        )}

        {/* --- Load More --- */}
        {filteredProducts.length > 12 && (
          <div className="flex justify-center mt-20">
            <button className="px-12 py-4 bg-transparent border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 transform active:scale-95 cursor-pointer shadow-sm">
              Explore More
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default ShopCategory
