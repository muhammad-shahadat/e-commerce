import React, { useState } from "react";

const DescriptionBox = () => {
    // handle active tab (Description vs Reviews)
    const [activeTab, setActiveTab] = useState("description");

    return (
        <section className="w-full px-6 md:px-16 lg:px-24 py-12 bg-white">
            <div className="max-w-7xl mx-auto">
                
                {/* --- Tab Navigation --- */}
                <div className="flex items-center">
                    <button 
                        onClick={() => setActiveTab("description")}
                        className={`px-8 py-4 text-sm md:text-base font-bold transition-all duration-300 border cursor-pointer ${
                            activeTab === "description" 
                            ? "bg-white border-gray-200 border-b-white -mb-[1px] text-gray-900" 
                            : "bg-gray-50 border-transparent text-gray-400 hover:text-gray-600"
                        } rounded-t-lg`}
                    >
                        Description
                    </button>
                    <button 
                        onClick={() => setActiveTab("reviews")}
                        className={`px-8 py-4 text-sm md:text-base font-bold transition-all duration-300 border cursor-pointer ${
                            activeTab === "reviews" 
                            ? "bg-white border-gray-200 border-b-white -mb-[1px] text-gray-900" 
                            : "bg-gray-50 border-transparent text-gray-400 hover:text-gray-600"
                        } rounded-t-lg`}
                    >
                        Reviews (255)
                    </button>
                </div>

                {/* --- Content Box --- */}
                <div className="border border-gray-200 p-8 md:p-12 rounded-b-2xl rounded-tr-2xl shadow-sm">
                    {activeTab === "description" ? (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                            <p className="text-gray-600 leading-relaxed text-sm md:text-lg text-justify">
                                Welcome to the next level of fashion. This premium product is crafted with high-quality materials to ensure both comfort and durability. Whether you're dressing up for a special occasion or keeping it casual, this item fits perfectly into any wardrobe.
                            </p>
                            <p className="text-gray-600 leading-relaxed text-sm md:text-lg text-justify">
                                E-commerce websites typically display products with detailed descriptions, images, and pricing. This specific piece features a unique design that stands out, making it a favorite among our best-sellers. Experience the blend of style and functionality today.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                            <p className="text-gray-500 italic">User reviews will be displayed here...</p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}

export default DescriptionBox;