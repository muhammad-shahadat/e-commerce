import React, { createContext, useState } from "react";
import allCollection from "../assets/product/allCollection";

export const ShopContext = createContext();


const getDefaultCart = () =>{
    let cart = {};
    for(let i = 1; i <= allCollection.length; i++){
        cart[i] = 0;
    }
    return cart;
}




const ShopContextProvider = (props) =>{

    const [cartItems, setCartItems] = useState(getDefaultCart());

     const [isMenuOpen, setIsMenuOpen] = useState(false);

    const addToCart = (productId)=>{
        setCartItems((prev) =>{
            return{...prev, [productId] : prev[productId] + 1}
        });
    
    }

    const removeFromCart = (productId) =>{
        setCartItems((prev) =>{
            return{...prev, [productId] : prev[productId] - 1}
        })
    }

    const getTotalCartItems = () =>{
        let totalCartItems = 0;
        for(let x in cartItems){
            if(cartItems[x] > 0){
                totalCartItems = totalCartItems + cartItems[x];
            }
        }
        return totalCartItems;
    }
    
    const getTotalCartAmount = () =>{
        let totalAmount = 0;
        for(let x in cartItems){
            if(cartItems[x] > 0){
               let product = allCollection.find((product) =>{
                if(x == product.id){
                    return product;
                }
               }) 

               totalAmount = totalAmount + (cartItems[x] * product.newPrice);
            }
        }

        return totalAmount;

    }


    
    const contextValue = {
        allCollection,
        cartItems,
        addToCart, 
        removeFromCart, 
        getTotalCartItems,
        getTotalCartAmount, 
        isMenuOpen,
        setIsMenuOpen,  
    }

    return(
        <>
            <ShopContext.Provider value={contextValue}>
                {props.children}
            </ShopContext.Provider>

        </>
    )
}

export default ShopContextProvider;




