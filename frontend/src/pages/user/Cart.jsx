import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom' // আপনার রাউটিং অনুযায়ী
import CartItemsProduct from '../../components/user/CartItemsProduct/CartItemsProduct'
import CartItemsTotal from '../../components/user/CartItemsTotal/CartItemsTotal'
import usecartStore from '../../stores/useCartStore'

const Cart = () => {
  const { cartItems } = usecartStore()

  return (
    <div className="py-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-black text-gray-900 mb-8">
          Shopping Cart
        </h1>

        {cartItems.length > 0 ? (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8">
              {cartItems.map((item) => (
                <CartItemsProduct
                  // ID এবং VariantID মিলিয়ে ইউনিক কী তৈরি করা হয়েছে
                  key={`${item.id}-${item.variantId}`}
                  product={item}
                />
              ))}
            </div>

            {/* Cart Totals Section */}
            <CartItemsTotal />
          </div>
        ) : (
          /* --- Empty Cart State with Lucide Icon --- */
          <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={48} className="text-indigo-600" />
            </div>
            <p className="text-gray-900 text-2xl font-black">
              Your cart is empty!
            </p>
            <p className="text-gray-500 mt-2 mb-8">
              Looks like you have not added anything to your cart yet.
            </p>
            <Link to="/">
              <button className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-lg cursor-pointer">
                Continue Shopping
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
