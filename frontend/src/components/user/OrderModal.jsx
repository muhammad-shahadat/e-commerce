import React, { useState } from 'react'
import { X, Truck, CreditCard, Loader2, ArrowRight } from 'lucide-react'

const OrderModal = ({
  isOpenModal,
  handleCloseModal,
  finalTotal,
  handlePlaceOrder,
  isPending,
}) => {
  const initialFormData = {
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'Bangladesh',
    payment_method: 'COD',
  }

  // Guest Form State
  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    handlePlaceOrder(formData)
    setFormData(initialFormData) // ফর্ম ডাটা একদম খালি বা রিসেট হয়ে গেল
  }

  if (!isOpenModal) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Checkout Details
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Guest Ordering System
            </p>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-3 hover:bg-white rounded-full shadow-sm transition-all text-gray-400 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body (Scrollable Form) */}
        <form
          id="order-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-8"
        >
          {/* Personal Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest">
              <span className="w-6 h-[2px] bg-indigo-600"></span>
              Personal Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="customer_name"
                value={formData.customer_name}
                placeholder="Full Name"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
              <input
                required
                name="customer_email"
                type="email"
                value={formData.customer_email}
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
              <input
                required
                name="customer_phone"
                value={formData.customer_phone}
                placeholder="Phone Number"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none md:col-span-2"
              />
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest">
              <span className="w-6 h-[2px] bg-indigo-600"></span>
              Shipping Address
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                name="shipping_address_line1"
                value={formData.shipping_address_line1}
                placeholder="Address Line 1"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none md:col-span-2"
              />
              <input
                name="shipping_address_line2"
                value={formData.shipping_address_line2}
                placeholder="Address Line 2 (Optional)"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none md:col-span-2"
              />
              <input
                required
                name="shipping_city"
                value={formData.shipping_city}
                placeholder="City"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
              <input
                required
                name="shipping_postal_code"
                value={formData.shipping_postal_code}
                placeholder="Postal Code"
                onChange={handleChange}
                className="w-full h-14 px-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest">
              <span className="w-6 h-[2px] bg-indigo-600"></span>
              Payment Method
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center gap-3 h-16 rounded-2xl border-2 transition-all cursor-pointer ${formData.payment_method === 'COD' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 bg-white text-gray-500'}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={formData.payment_method === 'COD'}
                  onChange={handleChange}
                  className="hidden"
                />
                <Truck size={20} />
                <span className="font-bold">Cash on Delivery</span>
              </label>
              <label
                className={`flex items-center justify-center gap-3 h-16 rounded-2xl border-2 transition-all cursor-pointer opacity-50 cursor-not-allowed border-gray-100 bg-white text-gray-500`}
              >
                <CreditCard size={20} />
                <span className="font-bold">Online Payment</span>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Footer (Sticky) */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
              Order Total
            </p>
            <p className="text-3xl font-black text-indigo-600">
              ${finalTotal.toFixed(2)}
            </p>
          </div>
          {/* use form='order-form' [id name] because button is outside of form tag */}
          <button
            type="submit"
            form="order-form"
            disabled={isPending}
            className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                Confirm Order <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderModal
