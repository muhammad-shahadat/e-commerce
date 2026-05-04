import React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

const Item = (props) => {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 flex flex-col h-full">
            
            {/* --- Product Image Container --- */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                <Link to={`/product/${props.id}`} onClick={() => window.scrollTo(0, 0)}>
                    <img 
                        src={props.image} 
                        alt={props.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>
                
                {/* --- Hover Overlay Actions --- */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    
                    <Link to={`/product/${props.id}`} onClick={() => window.scrollTo(0, 0)} className="p-3 bg-white rounded-full shadow-lg hover:bg-indigo-600 hover:text-white transition-all transform translate-y-10 group-hover:translate-y-0 duration-500 delay-150">
                        <Eye size={20} />
                    </Link>
                </div>

                {/* --- Discount Badge (Optional) --- */}
                {props.oldPrice > props.newPrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        {Math.round(((props.oldPrice - props.newPrice) / props.oldPrice) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* --- Product Details --- */}
            <div className="p-4 md:p-5 flex flex-col flex-grow gap-2">
                
                <Link to={`/product/${props.id}`} onClick={() => window.scrollTo(0, 0)}>
                    <h3 className="text-gray-800 font-semibold text-sm md:text-base line-clamp-1 hover:text-indigo-600 transition-colors capitalize">
                        {props.title}
                    </h3>
                </Link>
                
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg md:text-xl font-bold text-gray-900">
                            ${props.newPrice}
                        </span>
                        {props.oldPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                ${props.oldPrice}
                            </span>
                        )}
                    </div>
                    {/* small ratings stars (Static) */}
                    <div className="flex text-yellow-400 text-[10px] md:text-xs">
                        ★★★★☆
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Item;