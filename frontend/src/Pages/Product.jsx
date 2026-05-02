import React, { useContext } from "react";
import {ShopContext} from "../Context/ShopContext";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../Components/Breadcrumbs/Breadcrumbs";
import ProductDisplay from "../Components/ProductDisplay";
import DescriptionBox from "../Components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../Components/RelatedProducts";


const Product = ()=>{
    const {allCollection} = useContext(ShopContext);
    const {productId} = useParams();
    const product = allCollection.find((product) => {
        if(productId == product.id){
            return product;
        }
    })

    


    return (
        <>  
            <div>
                <Breadcrumbs product = {product} />
                <ProductDisplay product = {product} />
                <DescriptionBox />
                <RelatedProducts />
            </div>
           
        </>
    )
}
export default Product;