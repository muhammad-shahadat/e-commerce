import bannerImage from "../assets/banner-image-1.jpg";

const Offer = () => {
    return (
        <section className="w-full px-6 md:px-16 lg:px-24 py-12">
            <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-b from-[#fde2ff] to-[#e1ffea22] flex flex-col md:flex-row items-center justify-between">
                
                {/* --- Left Content --- */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left p-8 md:p-16 lg:p-24 space-y-4 md:space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                            Exclusive
                        </h2>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight">
                            Offers For You
                        </h2>
                    </div>
                    
                    <p className="text-gray-700 text-sm md:text-lg lg:text-xl font-semibold tracking-wider uppercase">
                        Only on best sellers products
                    </p>
                    
                    <button className="mt-4 md:mt-8 px-8 md:px-12 py-3 md:py-4 bg-[#ff2355] text-white text-base md:text-lg font-bold rounded-full shadow-lg hover:bg-[#e61e4d] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
                        Check Now
                    </button>
                </div>

                {/* --- Right Image --- */}
                <div className="flex-1 flex justify-center md:justify-end items-end p-6 md:p-0">
                    <img 
                        src={bannerImage} 
                        alt="Special Offer Banner" 
                        className="w-[250px] sm:w-[300px] md:w-[400px] lg:w-[450px] h-auto object-contain drop-shadow-[-20px_20px_30px_rgba(0,0,0,0.1)] hover:translate-y-[-10px] transition-transform duration-500" 
                    />
                </div>
                
            </div>
        </section>
    );
};

export default Offer;