import React, { useState } from 'react'
import { HashLink } from 'react-router-hash-link'
import { Star, ShoppingCart, ShieldCheck, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import useCartStore from '../../stores/useCartStore' // আপনার পাথ অনুযায়ী দিন
import { usePlaceOrder } from '../../hooks/useOrderMutations'
import OrderModal from './OrderModal'

const ProductDisplay = ({ productData }) => {
  const navigate = useNavigate()
  const { product, images, variants } = productData

  // Zustand স্টোর থেকে addToCart নিয়ে আসা
  const { addToCart } = useCartStore()

  const mainImg =
    images.find((img) => img.is_main)?.image_url || images[0]?.image_url
  const [displayImage, setDisplayImage] = useState(mainImg)
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null)

  // UI States -> same as "showCheckout" state
  const [showOrderModal, setShowOrderModal] = useState(false)

  // --- React Query Mutation Hook ---
  const { mutate, isPending } = usePlaceOrder()

  // প্রাইস ক্যালকুলেশন
  const calculateNewPrice = () => {
    const base = Number(product.base_price)
    const modifier = selectedVariant
      ? Number(selectedVariant.price_modifier)
      : 0
    let totalPrice = base + modifier
    totalPrice = totalPrice - totalPrice * (product.discount_percent / 100)
    return totalPrice.toFixed(2)
  }

  const calculateOldPrice = () => {
    const base = Number(product.base_price)
    const modifier = selectedVariant
      ? Number(selectedVariant.price_modifier)
      : 0
    return (base + modifier).toFixed(2)
  }

  const newPrice = calculateNewPrice()
  const oldPrice = calculateOldPrice()

  // 🔥 নতুন কার্ড হ্যান্ডেলার ফাংশন
  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      variantId: selectedVariant?.product_variant_id,
      title: product.title,
      image: displayImage,
      newPrice: Number(newPrice),
      quantity: 1,
      variantName: selectedVariant?.options
        .map((opt) => opt.option_value)
        .join(' / '),
    }
    addToCart(cartItem)
  }

  //   for direct single product buying without cart
  const shippingFee = 0 // later you can dynamic it.
  const finalTotal = Number(newPrice) + shippingFee

  const handlePlaceOrder = async (formData) => {
    const orderPayload = {
      ...formData,

      total: finalTotal, // আপনার DB কলাম: total
      shipping_charge: shippingFee, // আপনার DB কলাম: shipping_charge

      // প্রোডাক্টের লিস্ট (যা পরে order_items টেবিলে লুপ চালিয়ে ঢুকবে)
      items: [
        {
          product_id: product.id,
          product_variant_id: selectedVariant?.product_variant_id,
          price: Number(newPrice),
          quantity: 1,
        },
      ],
    }

    // Mutation কল করা
    mutate(orderPayload, {
      onSuccess: (data) => {
        navigate('/order-success', { state: { orderData: data } })
        setShowOrderModal(false) // সফল হলে মোডাল বন্ধ হবে
      },
    })
  }

  if (!product) return null

  return (
    <section className="w-full px-6 md:px-16 lg:px-24 py-10 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* --- Left Side: Image Gallery --- */}
        <div className="flex flex-col-reverse md:flex-row gap-4 flex-1">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-visible scrollbar-hide">
            {images.map((img, i) => (
              <img
                key={i}
                src={img.image_url}
                alt=""
                onClick={() => setDisplayImage(img.image_url)}
                className={`w-20 h-24 md:w-24 md:h-28 object-cover rounded-xl cursor-pointer border-2 transition-all shadow-sm ${
                  displayImage === img.image_url
                    ? 'border-red-500'
                    : 'border-transparent hover:border-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex-1 overflow-hidden rounded-3xl bg-gray-50 shadow-inner">
            <img
              src={displayImage}
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
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < 4 ? 'currentColor' : 'none'}
                    className={i < 4 ? '' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-gray-500 font-medium text-sm">
                ({product.view_count} Views)
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-black text-gray-600">
              ${newPrice}
            </span>
            {oldPrice > newPrice && (
              <span className="text-xl text-red-700 line-through">
                ${oldPrice}
              </span>
            )}
          </div>

          <div className="text-gray-600 leading-relaxed text-base md:text-lg">
            <p>
              {product.description?.slice(0, 150)}...
              <HashLink
                smooth
                to="#full-description"
                className="text-blue-800 text-sm font-bold ml-2 hover:underline"
              >
                View Full Description
              </HashLink>
            </p>
          </div>

          {/* Variants Selector */}
          {variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Available Sizes & Colors
              </h3>
              <div className="flex flex-wrap gap-3">
                {variants.map((v) => (
                  <button
                    key={v.product_variant_id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl border-2 font-bold transition-all cursor-pointer flex flex-col items-center ${
                      selectedVariant?.product_variant_id ===
                      v.product_variant_id
                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                        : 'bg-white border-gray-100 text-gray-600 hover:border-red-500'
                    }`}
                  >
                    <span className="text-xs uppercase">
                      {v.options.map((opt) => opt.option_value).join(' / ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={selectedVariant?.stock_quantity <= 0}
              className="flex-1 flex items-center justify-center gap-4 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all"
            >
              <ShoppingCart size={22} />
              {selectedVariant?.stock_quantity <= 0
                ? 'OUT OF STOCK'
                : 'ADD TO CART'}
            </button>
            <button
              onClick={() => {
                setShowOrderModal(true)
              }}
              disabled={selectedVariant?.stock_quantity <= 0}
              className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"
            >
              BUY NOW
            </button>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <Truck size={20} className="text-red-500" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <ShieldCheck size={20} className="text-red-500" />
              <span>100% Authentic</span>
            </div>
          </div>
        </div>
      </div>
      {/* --- GUEST Order MODAL --- */}
      <OrderModal
        isOpenModal={showOrderModal}
        handleCloseModal={() => setShowOrderModal(false)}
        finalTotal={finalTotal}
        handlePlaceOrder={handlePlaceOrder}
        isPending={isPending}
      />
    </section>
  )
}

export default ProductDisplay
