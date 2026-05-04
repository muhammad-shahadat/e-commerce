import React, { useContext, useState } from 'react'
import { ShopContext } from '../../Context/ShopContext'
import { Star, ShoppingCart, ShieldCheck, Truck } from 'lucide-react'

const ProductDisplay = (props) => {
  const { product } = props
  const { addToCart } = useContext(ShopContext)
  const [selectedSize, setSelectedSize] = useState('M')

  if (!product) return null

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-10 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* --- Left Side: Image Gallery --- */}
        <div className="flex flex-col-reverse md:flex-row gap-4 flex-1">
          {/* Thumbnail List */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-visible scrollbar-hide">
            {[1, 2, 3, 4].map((_, i) => (
              <img
                key={i}
                src={product.image}
                alt=""
                className="w-20 h-24 md:w-24 md:h-28 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-indigo-600 transition-all shadow-sm"
              />
            ))}
          </div>
          {/* Main Image */}
          <div className="flex-1 overflow-hidden rounded-3xl bg-gray-50 shadow-inner">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[450px] md:h-[600px] object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in"
            />
          </div>
        </div>

        {/* --- Right Side: Product Details --- */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight capitalize">
              {product.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-sm">(255 Reviews)</p>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-black text-indigo-600">
              ${product.newPrice}
            </span>
            <span className="text-xl text-gray-400 line-through">
              ${product.oldPrice}
            </span>
          </div>

          <p className="text-gray-600 leading-relaxed text-base md:text-lg">
            {product.description ||
              'Experience ultimate comfort and unmatched style with our latest premium collection. Crafted with breathable fabric and a perfect fit for any occasion.'}
          </p>

          {/* Size Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Select Size</h3>
            <div className="flex gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-14 md:w-14 md:h-16 rounded-2xl border-2 font-bold transition-all cursor-pointer flex items-center justify-center ${
                    selectedSize === size
                      ? 'bg-gray-900 border-gray-900 text-white shadow-lg scale-105'
                      : 'bg-white border-gray-100 text-gray-600 hover:border-indigo-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => addToCart(product.id)}
            className="w-full md:w-max px-12 py-4 bg-gray-900 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 cursor-pointer mt-4"
          >
            <ShoppingCart size={22} />
            ADD TO CART
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <Truck size={20} className="text-indigo-600" />
              <span>Free Shipping Over $100</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <ShieldCheck size={20} className="text-indigo-600" />
              <span>2 Years Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDisplay
