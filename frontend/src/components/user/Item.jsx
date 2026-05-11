import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, Star } from 'lucide-react'

const Item = (props) => {
  // Backend returns main_image, but we need to handle potential nulls
  const imageUrl =
    props.image || 'https://via.placeholder.com/300x400?text=No+Image'

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
      {/* --- Product Image Container --- */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {/* instead ID using SLUG is good for SEO */}
        <Link to={`/product/${props.slug}`}>
          <img
            src={imageUrl}
            alt={props.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* --- Hover Overlay Actions --- */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 pointer-events-none">
          <Link
            to={`/product/${props.slug}`}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all transform translate-y-10 group-hover:translate-y-0 duration-500 delay-150 pointer-events-auto"
          >
            <Eye size={20} />
          </Link>
        </div>

        {/* --- Discount Badge --- */}
        {props.oldPrice > props.newPrice && (
          <div className="absolute top-3 left-3 bg-[#ff4433] text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            {Math.round(
              ((props.oldPrice - props.newPrice) / props.oldPrice) * 100,
            )}
            % OFF
          </div>
        )}
      </div>

      {/* --- Product Details --- */}
      <div className="p-4 md:p-5 flex flex-col flex-grow gap-2">
        <Link to={`/product/${props.slug}`}>
          <h3 className="text-gray-800 font-semibold text-sm md:text-base line-clamp-1 hover:text-[#ff4433] transition-colors capitalize">
            {props.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-gray-900">
              ${props.newPrice}
            </span>
            {props.oldPrice > props.newPrice && (
              <span className="text-xs text-[#ff4433] line-through">
                ${props.oldPrice}
              </span>
            )}
          </div>

          {/* Static Rating with Lucide Star */}
          <div className="flex items-center text-yellow-400">
            <Star size={14} fill="currentColor" />
            <span className="text-gray-500 text-xs ml-1 font-medium">4.5</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Item
