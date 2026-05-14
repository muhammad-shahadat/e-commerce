import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Menu,
  X,
  User,
  Loader2,
} from 'lucide-react'
import useCartStore from '../../stores/useCartStore'
import useUIStore from '../../stores/useUIStore'
import useGetCategories from '../../hooks/useCategoryQueries'

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  // Zustand store থেকে ডেটা আনা
  const { getTotalCartItems } = useCartStore()
  const { isMenuOpen, setIsMenuOpen } = useUIStore()

  const { data: categories, isLoading, isError } = useGetCategories()

  // সার্চ হ্যান্ডেল করার ফাংশন
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // সরাসরি শপ পেজে সার্চ কুয়েরি পাঠানো
      navigate(`/shop?search=${searchTerm}`)
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-[999] border-b border-gray-100">
        {/* --- মেইন কন্টেইনার --- */}
        <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-16 gap-4 md:gap-10">
          {/* ১. লোগো এবং মেনু বাটন */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Menu size={26} className="text-gray-700" />
            </button>
            <Link to="/" className="flex items-center gap-1.5">
              <ShoppingBag className="text-blue-600" size={28} />
              <span className="uppercase text-lg md:text-xl font-black tracking-tighter text-gray-800">
                Shopper
              </span>
            </Link>
          </div>

          {/* ২. ডেস্কটপ সার্চবার (মোবাইলে হিডেন থাকবে) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl relative"
          >
            <input
              type="text"
              placeholder="Search products (T-shirt, Watch...)"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-2 px-5 pr-12 focus:border-blue-400 focus:bg-white outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
            >
              <Search size={20} />
            </button>
          </form>

          {/* ৩. ইউজার এবং কার্ড আইকন */}
          <div className="flex items-center gap-2 md:gap-6">
            <Link
              to="/login"
              className="flex items-center gap-1.5 font-bold text-gray-700 hover:text-blue-600 transition-colors"
            >
              <User size={24} />
              <span className="hidden md:block">Login</span>
            </Link>

            <Link
              to="/cart"
              className="relative p-2.5 bg-gray-50 rounded-full hover:bg-blue-50 transition-all group"
            >
              <ShoppingCart
                size={24}
                className="text-gray-700 group-hover:text-blue-600"
              />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                {getTotalCartItems()}
              </span>
            </Link>
          </div>
        </div>

        {/* ৪. মোবাইল সার্চবার (শুধু মোবাইলে দেখাবে) */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products (T-shirt, Watch...)"
              className="w-full bg-gray-100 border-none rounded-xl py-2.5 px-4 pr-10 focus:ring-1 focus:ring-blue-400 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </header>

      {/* --- সাইডবার ড্রয়ার (Mobile & Desktop দুটোর জন্যই) --- */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1000] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[1001] shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <span className="text-xl font-bold text-gray-800">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all"
            >
              <X size={26} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mb-2 tracking-widest">
              Main
            </p>
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="p-3 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMenuOpen(false)}
              className="p-3 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all border-b border-gray-50 mb-2"
            >
              All Products
            </Link>

            <p className="text-[10px] uppercase font-bold text-gray-400 px-3 mt-4 mb-2 tracking-widest">
              Categories
            </p>

            {/* ডাইনামিকভাবে ক্যাটাগরি ম্যাপিং */}
            <div className="flex flex-col gap-1">
              {/* ১. লোডিং অবস্থা - ছোট একটা স্কেলিটন বা টেক্সট */}
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}

              {/* ২. এরর হ্যান্ডেলিং - রিলোড বাটন বা মেসেজ */}
              {isError && (
                <div className="px-3 py-2 text-xs text-red-500 bg-red-50 rounded-xl">
                  Failed to load categories.
                </div>
              )}

              {!isLoading &&
                !isError &&
                categories
                  ?.filter((cat) => !cat.parent_id) // শুধুমাত্র মেইন প্যারেন্ট ক্যাটাগরিগুলো দেখাবে
                  .map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop?category=${category.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="p-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-all flex justify-between items-center group"
                    >
                      <span>{category.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 text-xs font-bold">
                        Explore →
                      </span>
                    </Link>
                  ))}
            </div>
          </nav>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center w-full py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </aside>

      {/* কনটেন্ট যেন হেডারের নিচে না ঢোকে তার জন্য স্পেসার */}
      <div className="h-[116px] md:h-20"></div>
    </>
  )
}

export default Header
