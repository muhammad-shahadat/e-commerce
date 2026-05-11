import React from 'react'
import useCartStore from '../../../stores/useCartStore' // আপনার পাথ অনুযায়ী
import { Trash2, Plus, Minus } from 'lucide-react'

const CartItemsProduct = ({ product }) => {
  // স্টোর থেকে ফাংশনগুলো নিয়ে আসা (deleteFromCart সহ)
  const { decreaseQuantity, addToCart, removeFromCart } = useCartStore()

  const { id, variantId, title, image, newPrice, quantity, variantName } =
    product

  return (
    <div className="w-full">
      {/* --- Desktop View --- */}
      <div className="hidden md:grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_0.5fr] items-center gap-4 py-6 px-4 hover:bg-gray-50 transition-colors rounded-2xl">
        <img
          src={image}
          alt={title}
          className="w-20 h-24 object-cover rounded-xl shadow-sm"
        />

        <div>
          <p className="text-gray-800 font-bold text-lg truncate pr-4 capitalize">
            {title}
          </p>
          {variantName && (
            <p className="text-sm text-gray-500 font-medium mt-1 italic">
              Variant: {variantName}
            </p>
          )}
        </div>

        <p className="text-gray-600 font-bold">${newPrice.toFixed(2)}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => decreaseQuantity(id, variantId)}
            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-black text-gray-800">
            {quantity}
          </span>
          <button
            onClick={() => addToCart(product)}
            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </div>

        <p className="text-indigo-600 font-black text-xl">
          ${(quantity * newPrice).toFixed(2)}
        </p>

        <button
          onClick={() => removeFromCart(id, variantId)} // ডাইরেক্ট রিমুভ
          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full cursor-pointer"
        >
          <Trash2 size={22} />
        </button>
      </div>

      {/* --- Mobile View --- */}
      <div className="md:hidden flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl mb-4 relative shadow-sm">
        <img
          src={image}
          alt={title}
          className="w-24 h-28 object-cover rounded-xl"
        />
        <div className="flex flex-col flex-1 justify-between py-1">
          <div>
            <h3 className="text-gray-900 font-bold text-base line-clamp-1">
              {title}
            </h3>
            {variantName && (
              <p className="text-xs text-gray-500 mt-0.5">{variantName}</p>
            )}
            <p className="text-gray-500 text-sm font-bold mt-1">
              ${newPrice.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg">
              <button onClick={() => decreaseQuantity(id, variantId)}>
                <Minus size={14} />
              </button>
              <span className="font-bold text-sm">{quantity}</span>
              <button onClick={() => addToCart(product)}>
                <Plus size={14} />
              </button>
            </div>
            <p className="text-indigo-600 font-black">
              ${(quantity * newPrice).toFixed(2)}
            </p>
          </div>
        </div>
        <button
          onClick={() => removeFromCart(id, variantId)}
          className="absolute top-2 right-2 p-2 text-red-400 active:scale-90"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <hr className="hidden md:block border-gray-50 my-1" />
    </div>
  )
}

export default CartItemsProduct
