import { useContext } from "react";
import Hero from "../Components/Hero";
import Popular from "../Components/Popular";
import Offer from "../Components/Offer";
import NewCollection from "../Components/NewCollection";
import NewsLetter from "../Components/NewsLetter";
import {ShopContext} from "../Context/ShopContext";




const Home = ()=>{

    const contextValue = useContext(ShopContext);
    

    return (
        <>  
            <div>
                <Hero />
                <Popular />
                <Offer />
                <NewCollection />
                <NewsLetter />
            </div>
        </>
    )
}
export default Home;