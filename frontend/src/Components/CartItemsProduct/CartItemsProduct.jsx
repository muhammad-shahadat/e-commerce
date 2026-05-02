import React, { useContext } from "react";
import { ShopContext } from "../../Context/ShopContext";
import { Trash2, Plus, Minus } from "lucide-react";

const CartItemsProduct = (props) => {
    const { cartItems, removeFromCart, addToCart } = useContext(ShopContext);
    const quantity = cartItems[props.id];

    // if no item in the cart
    if (quantity <= 0) return null;

    return (
        <div className="w-full">
            {/* --- Desktop View (Table Row Style) --- */}
            <div className="hidden md:grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_0.5fr] items-center gap-4 py-5 px-4 hover:bg-gray-50 transition-colors rounded-xl">
                <img 
                    src={props.image} 
                    alt={props.title} 
                    className="w-20 h-24 object-cover rounded-lg shadow-sm" 
                />
                
                <p className="text-gray-800 font-semibold text-lg truncate pr-4">
                    {props.title}
                </p>
                
                <p className="text-gray-600 font-medium">${props.newPrice}</p>
                
                {/* Quantity Control */}
                <div className="flex items-center">
                    <span className="w-12 h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-white font-bold text-gray-700">
                        {quantity}
                    </span>
                </div>
                
                <p className="text-indigo-600 font-bold text-lg">
                    ${(quantity * props.newPrice).toFixed(2)}
                </p>
                
                <button 
                    onClick={() => removeFromCart(props.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-full w-fit cursor-pointer"
                >
                    <Trash2 size={22} />
                </button>
            </div>

            {/* --- Mobile View (Card Style) --- */}
            <div className="md:hidden flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mb-4 relative">
                <img 
                    src={props.image} 
                    alt={props.title} 
                    className="w-24 h-28 object-cover rounded-xl" 
                />
                
                <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                        <h3 className="text-gray-800 font-bold text-base line-clamp-1 capitalize">
                            {props.title}
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                            Unit Price: ${props.newPrice}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <p className="text-indigo-600 font-bold text-lg">
                            ${(quantity * props.newPrice).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                           <span className="text-gray-700 font-bold text-sm">Qty: {quantity}</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => removeFromCart(props.id)}
                    className="absolute top-3 right-3 p-2 text-red-400 active:scale-90 transition-transform"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Divider for Desktop */}
            <hr className="hidden md:block border-gray-100 my-1" />
        </div>
    );
};

export default CartItemsProduct;