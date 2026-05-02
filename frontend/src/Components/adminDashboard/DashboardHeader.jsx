import React from 'react'
import { Menu, ShoppingCart } from 'lucide-react';

const DashboardHeader = ({isMobileMenuOpen, setIsMobileMenuOpen}) => {
  return (
    <header className='w-full h-17 bg-white/80 backdrop-blur-md shadow-sm z-[999] flex items-center justify-between px-6 md:px-16'>
        <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={28} className='cursor-pointer text-gray-700 md:hidden' />
        </button>
        <div className='flex items-center justify-center gap-4'>
            <div className='relative p-2'>
                <ShoppingCart size={30} className='cursor-pointer text-gray-700' />
                <span className='absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-[14px] flex items-center justify-center font-bold'>
                    0
                </span>
            </div>

            <div className='w-7 h-7 rounded-full p-2 bg-violet-950 text-white font-semibold flex items-center justify-center'>
                M
            </div>
        </div>
        


    </header>
  )
}

export default DashboardHeader;