import React, { useContext } from 'react'
import CartItemsProduct from '../../Components/user/CartItemsProduct/CartItemsProduct'
import { ShopContext } from '../../Context/ShopContext'
import CartItemsTotal from '../../components/user/CartItemsTotal/CartItemsTotal'

const Cart = () => {
  const { allCollection, cartItems, isMenuOpen } = useContext(ShopContext)

  return (
    <>
      <div>
        {allCollection.map((product, index) => {
          if (cartItems[product.id] > 0) {
            return (
              <CartItemsProduct
                key={index}
                id={product.id}
                title={product.title}
                image={product.image}
                newPrice={product.newPrice}
                oldPrice={product.oldPrice}
              />
            )
          }
        })}

        <CartItemsTotal />
      </div>
    </>
  )
}
export default Cart
