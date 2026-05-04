
const NewsLetter = () => {
    return (
        <section className="w-full px-6 md:px-16 lg:px-24 py-16">
            <div className="max-w-5xl mx-auto py-16 md:py-24 px-6 rounded-3xl bg-gradient-to-b from-[#fde1ff] via-[#fde1ff]/50 to-transparent flex flex-col items-center text-center gap-6 md:gap-8 shadow-sm">
                
                {/* --- Text Content --- */}
                <div className="space-y-4">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight">
                        Get Exclusive Offers On Your Email
                    </h2>
                    <p className="text-gray-600 text-base md:text-xl font-medium uppercase tracking-wide">
                        Subscribe to our newsletter and stay updated
                    </p>
                </div>

                {/* --- Input Group --- */}
                <div className="relative w-full max-w-2xl mt-4">
                    <div className="flex flex-col sm:flex-row items-center bg-white p-1.5 rounded-2xl sm:rounded-full border border-gray-200 shadow-inner focus-within:border-indigo-400 transition-all duration-300">
                        <input 
                            type="email" 
                            placeholder="Enter Your Email Address" 
                            className="w-full bg-transparent px-6 py-4 text-gray-700 outline-none placeholder:text-gray-400 text-base md:text-lg"
                        />
                        <button className="w-full sm:w-auto px-10 py-4 bg-[#ff4433] hover:bg-[#e63b2a] text-white font-bold rounded-xl sm:rounded-full transition-all duration-300 transform active:scale-95 shadow-md whitespace-nowrap cursor-pointer">
                            Subscribe
                        </button>
                    </div>
                    {/*a small decorative element*/}
                    <div className="absolute -z-10 -bottom-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50"></div>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </section>
    );
}

export default NewsLetter;