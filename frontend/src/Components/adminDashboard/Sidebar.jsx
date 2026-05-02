import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Tag, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useNavigate } from "react-router-dom";


import letterIcon from "../../assets/letter-s.png";

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {

    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();


    const SidebarItem = ({ icon: Icon, label, path }) => {

        return (
            <button onClick={() => navigate(path)} className='group w-full cursor-pointer'>
                <div className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-lg text-gray-600 group-hover:bg-gray-100 group-hover:text-gray-800 transition-all duration-200'>
                    <Icon size={22} className='text-gray-500 group-hover:text-blue-300' />
                    <span className={`${isCollapsed ? "md:hidden" : "md:block"} block`}>{label}</span>
                </div>
            </button>
        )


    }

    return (
        <>  
            {/* 1. Mobile Overlay (Dim Effect) */}
            {isMobileMenuOpen && (
                <div 
                    className='fixed inset-0 bg-black/50 z-[999] md:hidden backdrop-blur-sm transition-opacity'
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* 2. Sidebar Container */}
            <aside className={`  
                ${isCollapsed ? "md:w-20" : "md:w-60"}
                ${isMobileMenuOpen ? "translate-x-0 w-60" : "-translate-x-full md:translate-x-0"}
                fixed md:relative z-1000 flex flex-col h-screen bg-white border-r border-gray-200 shadow-sm transition-all duration-300
            `}>

                {/* Logo + Toggle */}
                <div className={`${isCollapsed ? "md:justify-center" : "md:justify-baseline"} h-17 flex items-center justify-between border-b border-r border-gray-200 px-2`}>
                    <div className={`${isCollapsed ? "md:hidden" : "md:flex"} flex items-center gap-2 text-xl font-semibold text-blue-500`}>
                        <img className='w-7 h-7' src={letterIcon} alt="letter-icon" />
                        <span>Shopper</span>
                    </div>
                    {/* Desktop Toggle */}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className='hidden md:block'
                    >
                        {isCollapsed ? <PanelLeftOpen className='text-gray-600 cursor-pointer' /> : <PanelLeftClose className='text-gray-600 cursor-pointer' />}

                    </button>

                    {/*Mobile Cross Icon */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className='md:hidden p-1 hover:bg-gray-100 rounded-full cursor-pointer'
                    >
                        <X size={22} className='text-gray-500' />

                    </button>
                </div>

                {/*sidebar menu items*/}
                <div className='flex flex-col justify-center gap-1 overflow-y-auto overflow-x-hidden p-3'>

                    <SidebarItem icon={LayoutDashboard} label="Dashboard" path="" />
                    <SidebarItem icon={ShoppingCart} label="Orders" path="orders" />
                    <SidebarItem icon={Package} label="Products" path="add-product" />
                    <SidebarItem icon={Tag} label="Categories" path="create-category" />


                </div>

            </aside>
        </>
    )
}

export default Sidebar;