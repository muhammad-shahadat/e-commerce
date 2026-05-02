import React from "react";
import Item from "./Item";
import popularProduct from "../assets/product/popularProduct";

const Popular = () => {
    return (
        <section className="w-full px-6 md:px-16 lg:px-24 py-16 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
                
                {/* --- Section Header --- */}
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase tracking-tight">
                        Popular Items
                    </h1>
                    <div className="w-24 md:w-32 h-1.5 bg-indigo-600 rounded-full shadow-sm"></div>
                    <p className="text-gray-500 text-sm md:text-base mt-2 font-medium">
                        Discover what's trending right now
                    </p>
                </div>

                {/* --- Products Grid --- */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {popularProduct.map((product, index) => (
                        <div 
                            key={product.id || index} 
                            className="animate-in fade-in slide-in-from-bottom-5 duration-500 delay-[index*100ms]"
                        >
                            <Item 
                                id={product.id} 
                                title={product.title} 
                                image={product.image} 
                                newPrice={product.newPrice} 
                                oldPrice={product.oldPrice} 
                            />
                        </div>
                    ))}
                </div>

                {/* --- View More Button (Optional) --- */}
                <button className="mt-8 px-10 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300">
                    Explore All Products
                </button>
                
            </div>
        </section>
    );
};

export default Popular;