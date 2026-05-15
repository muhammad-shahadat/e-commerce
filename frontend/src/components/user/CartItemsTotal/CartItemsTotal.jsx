import React, { useState } from 'react'
import { ArrowRight, Ticket, X, Truck, CreditCard, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { usePlaceOrder } from '../../../hooks/useOrderMutations'
import useCartStore from '../../../stores/useCartStore'
import OrderModal from '../OrderModal'

const CartItemsTotal = () => {
  const navigate = useNavigate()
  const { getTotalCartAmount, cartItems, clearCart } = useCartStore()
  const totalAmount = getTotalCartAmount()

  const shippingFee = 0 // later you can dynamic it.
  const finalTotal = totalAmount + shippingFee

  // UI States
  const [showCheckout, setShowCheckout] = useState(false)

  // --- React Query Mutation Hook ---
  const { mutate, isPending } = usePlaceOrder()

  // --- অর্ডার প্লেস করার হ্যান্ডেলার ---
  const handlePlaceOrder = async (formData) => {
    const orderPayload = {
      ...formData,

      total: finalTotal, // আপনার DB কলাম: total
      shipping_charge: shippingFee, // আপনার DB কলাম: shipping_charge

      // প্রোডাক্টের লিস্ট (যা পরে order_items টেবিলে লুপ চালিয়ে ঢুকবে)
      items: cartItems.map((item) => ({
        product_id: item.id,
        product_variant_id: item.variantId || null,
        price: item.newPrice,
        quantity: item.quantity,
      })),
    }

    // Mutation কল করা
    mutate(orderPayload, {
      onSuccess: (data) => {
        navigate('/order-success', { state: { orderData: data } })
        setShowCheckout(false) // সফল হলে মোডাল বন্ধ হবে
        clearCart()
      },
    })
  }

  return (
    <section className="w-full py-6">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* --- Left: Cart Totals Card --- */}
        <div className="flex-1 w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <h2 className="text-2xl font-extrabold text-gray-900 border-b border-gray-50 pb-4">
            Order Summary
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
              {shippingFee === 0 ? (
                <p className="text-green-600 font-bold uppercase text-sm tracking-wide">
                  Free
                </p>
              ) : (
                <p className="font-bold text-gray-900">
                  ${shippingFee.toFixed(2)}
                </p>
              )}
            </div>
            <hr className="border-gray-100" />

            <div className="flex justify-between items-center pt-2">
              <h3 className="text-xl font-black text-gray-900">Total</h3>
              <p className="text-3xl font-black text-indigo-600">
                ${finalTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            disabled={totalAmount === 0}
            onClick={() => setShowCheckout(true)}
            className="w-full mt-4 py-5 bg-gray-900 text-white font-black text-lg rounded-2xl hover:bg-indigo-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer shadow-xl active:scale-95"
          >
            Proceed To Checkout
            <ArrowRight
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          {shippingFee === 0 && totalAmount > 0 && (
            <div className="bg-green-50 py-2 rounded-lg">
              <p className="text-center text-xs text-green-700 font-bold animate-pulse uppercase tracking-wider">
                Free shipping applied to your order!
              </p>
            </div>
          )}
        </div>

        {/* --- Right: Promo Code Card (Keep Previous Design) --- */}
        <div className="w-full lg:max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-900">
            <Ticket size={20} className="text-indigo-600" />
            <p className="font-bold text-lg">Apply Promo Code</p>
          </div>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Got a discount code? Enter it below to save on your order.
          </p>
          <div className="relative flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter code..."
              className="w-full bg-gray-50 h-14 px-6 rounded-2xl border border-transparent outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-inner"
            />
            <button className="w-full py-4 bg-gray-100 text-gray-900 text-sm font-black rounded-2xl hover:bg-gray-200 transition-all cursor-pointer active:scale-95 uppercase tracking-widest">
              Apply Coupon
            </button>
          </div>
        </div>
      </div>

      {/* --- GUEST CHECKOUT MODAL --- */}
      <OrderModal
        isOpenModal={showCheckout}
        handleCloseModal={() => setShowCheckout(false)}
        finalTotal={finalTotal}
        handlePlaceOrder={handlePlaceOrder}
        isPending={isPending}
      />
    </section>
  )
}

export default CartItemsTotal
