import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'

import { ShopContext } from '../../Context/ShopContext'
import Breadcrumbs from '../../Components/user/Breadcrumbs/Breadcrumbs'
import ProductDisplay from '../../Components/user/ProductDisplay'
import DescriptionBox from '../../Components/user/DescriptionBox/DescriptionBox'
import RelatedProducts from '../../Components/user/RelatedProducts'

const Product = () => {
  const { allCollection } = useContext(ShopContext)
  const { productId } = useParams()
  const product = allCollection.find((product) => {
    if (productId == product.id) {
      return product
    }
  })

  return (
    <>
      <div>
        <Breadcrumbs product={product} />
        <ProductDisplay product={product} />
        <DescriptionBox />
        <RelatedProducts />
      </div>
    </>
  )
}
export default Product
