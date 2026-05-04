import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ShoppingBag, ShoppingCart } from 'lucide-react'

import { ShopContext } from '../../context/ShopContext'

const Header = () => {
  const [menu, setMenu] = useState('home')
  const { getTotalCartItems, isMenuOpen, setIsMenuOpen } =
    useContext(ShopContext)

  const navLinks = [
    { name: 'home', label: 'Home', path: '/' },
    { name: 'men', label: 'Men', path: '/men' },
    { name: 'women', label: 'Women', path: '/women' },
    { name: 'kids', label: 'Kids', path: '/kids' },
  ]

  return (
    <>
      {/* --- Main Header Navigation --- */}
      <header className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-md shadow-sm z-[999] flex items-center justify-between px-6 md:px-16">
        {/* Mobile Menu Icon (Left Side) */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu size={28} className="text-gray-700 cursor-pointer" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-blue-300" size={35} />
          <p className="sm:block uppercase text-xl font-bold tracking-widest text-gray-800">
            Shopper
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-10 text-gray-600 font-medium uppercase text-sm">
            {navLinks.map((link) => (
              <li
                key={link.name}
                onClick={() => setMenu(link.name)}
                className="relative group cursor-pointer"
              >
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Side Items (Login & Cart) */}
        <div className="flex items-center gap-5 sm:gap-8">
          <Link to="/login" className="hidden sm:block">
            <button className="px-6 py-2 border border-gray-800 rounded-full text-sm font-semibold uppercase cursor-pointer hover:bg-gray-800 hover:text-white transition-all duration-300">
              Login
            </button>
          </Link>

          <Link to="/cart" className="relative p-2">
            <ShoppingCart size={35} className="text-gray-700" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[14px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
              {getTotalCartItems()}
            </span>
          </Link>
        </div>
      </header>

      {/* --- Mobile Sidebar / Drawer --- */}
      {/* Background Overlay (Dim effect) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Sidebar Content */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[1001] shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xl text-gray-800 font-bold">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-red-50 cursor-pointer rounded-full text-red-400 transition-transform"
            >
              <X size={28} />
            </button>
          </div>

          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li
                key={link.name}
                onClick={() => {
                  setMenu(link.name)
                  setIsMenuOpen(false)
                }}
              >
                <Link
                  to={link.path}
                  style={{ textDecoration: 'none' }}
                  className={`text-sm font-semibold block p-2 rounded-lg transition-all ${menu === link.name ? 'bg-blue-400 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="py-2">
            <Link
              to="/login"
              style={{ textDecoration: 'none' }}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-semibold text-gray-700"
            >
              <button className="px-6 py-2 border border-gray-800 rounded-full text-sm font-semibold uppercase cursor-pointer hover:bg-gray-800 hover:text-white transition-all duration-300">
                Login
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-20"></div>
    </>
  )
}

export default Header
