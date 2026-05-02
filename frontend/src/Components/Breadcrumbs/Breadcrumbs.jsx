import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

const Breadcrumbs = (props) => {
    const { product } = props;

    // if failed to load product data
    if (!product) return null;

    return (
        <nav className="w-full px-6 md:px-16 lg:px-24 py-5 bg-white">
            <div className="max-w-7xl mx-auto flex items-center gap-2 md:gap-3 text-sm md:text-base font-medium text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
                
                {/* Home Icon & Link */}
                <Link 
                    to="/" 
                    className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                    <Home size={16} className="mb-0.5" />
                    <span>Home</span>
                </Link>

                <ChevronRight size={16} className="text-gray-400 shrink-0" />

                {/* Shop Link */}
                <Link 
                    to="/shop" 
                    className="hover:text-indigo-600 transition-colors"
                >
                    Shop
                </Link>

                <ChevronRight size={16} className="text-gray-400 shrink-0" />

                {/* Category Link */}
                <Link 
                    to={`/category/${product.category}`} 
                    className="capitalize hover:text-indigo-600 transition-colors"
                >
                    {product.category}
                </Link>

                <ChevronRight size={16} className="text-gray-400 shrink-0" />

                {/* Current Product Title */}
                <span className="text-gray-900 font-bold truncate capitalize">
                    {product.title}
                </span>
                
            </div>
        </nav>
    );
};

export default Breadcrumbs;