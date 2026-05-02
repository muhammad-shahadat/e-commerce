import React from "react";
import newCollectionProduct from "../assets/product/newCollectionProduct";
import Item from "./Item";

const NewCollection = () => {
    return (
        <section className="w-full px-6 md:px-16 lg:px-24 py-20 bg-[#f9fafb]">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                
                {/* --- Section Title --- */}
                <div className="flex flex-col items-center gap-3">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 uppercase tracking-tight text-center">
                        New Collection
                    </h1>
                    <div className="w-20 md:w-32 h-1.5 bg-[#ff4433] rounded-full"></div>
                    <p className="text-gray-500 text-sm md:text-lg font-medium mt-2">
                        Handpicked styles for your unique taste
                    </p>
                </div>

                {/* --- Dynamic Product Grid --- */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                    {newCollectionProduct.map((product, index) => (
                        <div 
                            key={product.id || index}
                            className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out"
                            style={{ animationDelay: `${index * 100}ms` }}
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

                {/* --- Bottom Accent --- */}
                <div className="mt-6">
                    <button className="px-12 py-4 bg-transparent border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300 transform active:scale-95">
                        View All Collections
                    </button>
                </div>
            </div>
        </section>
    );
}

export default NewCollection;