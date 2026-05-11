import React, { useState } from 'react'

const DescriptionBox = ({ description }) => {
  const [activeTab, setActiveTab] = useState('description')

  return (
    <section
      id="full-description"
      className="w-full px-6 md:px-16 lg:px-24 py-12 bg-white scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto">
        {/* --- Tab Navigation --- */}
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-8 py-4 text-sm md:text-base font-bold transition-all duration-300 border cursor-pointer ${
              activeTab === 'description'
                ? 'bg-white border-gray-200 border-b-white -mb-[1px] text-gray-900'
                : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600'
            } rounded-t-lg`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-8 py-4 text-sm md:text-base font-bold transition-all duration-300 border cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-white border-gray-200 border-b-white -mb-[1px] text-gray-900'
                : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600'
            } rounded-t-lg`}
          >
            Reviews (0)
          </button>
        </div>

        {/* --- Content Box --- */}
        <div className="border border-gray-200 p-8 md:p-12 rounded-b-2xl rounded-tr-2xl shadow-sm min-h-[250px]">
          {activeTab === 'description' ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              {/* ডাটাবেজ থেকে আসা রিয়েল ডেসক্রিপশন */}
              <p className="text-gray-600 leading-relaxed text-sm md:text-lg text-justify whitespace-pre-line">
                {description ||
                  'No detailed description available for this product.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
              <p className="text-gray-500 italic">
                Reviews coming soon! Our customers have not rated this product
                yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default DescriptionBox
