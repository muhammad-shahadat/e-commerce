import React, { useContext } from 'react'
import { ShopContext } from '../../../Context/ShopContext'
import { ArrowRight, Ticket } from 'lucide-react'

const CartItemsTotal = () => {
  const { getTotalCartAmount } = useContext(ShopContext)
  const totalAmount = getTotalCartAmount()

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
        {/* --- Left: Cart Totals Card --- */}
        <div className="flex-1 w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <h2 className="text-2xl font-extrabold text-gray-900 border-b border-gray-50 pb-4">
            Cart Totals
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-gray-600">
              <p className="text-base font-medium">Subtotal</p>
              <p className="font-bold text-gray-900">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <hr className="border-gray-50" />

            <div className="flex justify-between items-center text-gray-600">
              <p className="text-base font-medium">Shipping Fee</p>
              <p className="text-green-600 font-bold uppercase text-sm tracking-wide">
                Free
              </p>
            </div>
            <hr className="border-gray-100" />

            <div className="flex justify-between items-center pt-2">
              <h3 className="text-xl font-black text-gray-900">Total</h3>
              <p className="text-2xl font-black text-indigo-600">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <button className="w-full mt-4 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-lg active:scale-95">
            Proceed To Checkout
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* --- Right: Promo Code Card --- */}
        <div className="flex-1 w-full lg:max-w-md bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Ticket size={20} className="text-indigo-600" />
            <p className="font-bold text-lg">Have a Promo Code?</p>
          </div>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Enter your coupon code here to get instant discounts on your
            purchase.
          </p>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Type code here..."
              className="w-full bg-white h-14 pl-6 pr-32 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 transition-all text-gray-700 font-medium shadow-sm"
            />
            <button className="absolute right-1.5 h-11 px-6 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer active:scale-95">
              Apply
            </button>
          </div>

          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl flex items-start gap-3 border border-indigo-100">
            <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
            <p className="text-xs text-indigo-700 leading-normal">
              Discount will be calculated during the final step of checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CartItemsTotal
