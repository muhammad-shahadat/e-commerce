import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // কার্ডে যোগ করা (পুরো অবজেক্ট নিবে)
      addToCart: (item) => {
        const cart = get().cartItems
        // চেক করবে একই আইডি এবং একই ভ্যারিয়েন্ট আইডি আছে কি না
        const existingItem = cart.find(
          (cartItem) =>
            cartItem.id === item.id && cartItem.variantId === item.variantId,
        )

        if (existingItem) {
          set({
            cartItems: cart.map((cartItem) =>
              cartItem.id === item.id && cartItem.variantId === item.variantId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem,
            ),
          })
        } else {
          set({ cartItems: [...cart, item] })
        }
      },

      // কার্ড থেকে কমানো বা রিমুভ করা
      decreaseQuantity: (productId, variantId) => {
        const cart = get().cartItems
        set({
          cartItems: cart
            .map((item) =>
              item.id === productId && item.variantId === variantId
                ? { ...item, quantity: item.quantity - 1 }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })
      },

      // পুরো আইটেম রিমুভ করা (ডিলিট বা ট্র্যাশ বাটন)
      removeFromCart: (productId, variantId) => {
        const cart = get().cartItems
        set({
          cartItems: cart.filter(
            (item) => !(item.id === productId && item.variantId === variantId),
          ),
        })
      },

      // --- নতুন ফাংশন: কার্ট পুরো খালি করা ---
      clearCart: () => {
        set({ cartItems: [] })
      },

      // টোটাল ক্যালকুলেশন
      getTotalCartAmount: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.newPrice * item.quantity,
          0,
        )
      },

      getTotalCartItems: () => {
        return get().cartItems.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    { name: 'cart-storage' },
  ),
)

export default useCartStore
