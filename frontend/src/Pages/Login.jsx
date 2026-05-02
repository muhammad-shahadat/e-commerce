import React, { useContext, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const Login = () => {
    const { isMenuOpen } = useContext(ShopContext);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <main className={`min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12 transition-all duration-300 ${!isMenuOpen ? "md:pl-5" : ""}`}>
            <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col p-8 md:p-12 gap-8 animate-in fade-in zoom-in-95 duration-500">
                
                {/* --- Header --- */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Create Account
                    </h2>
                    <p className="text-gray-500 font-medium">Join our community and start shopping</p>
                </div>

                {/* --- Input Area --- */}
                <div className="flex flex-col gap-5">
                    {/* Name Input */}
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full bg-gray-50 h-14 pl-12 pr-4 rounded-2xl border border-transparent outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-700 font-medium"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full bg-gray-50 h-14 pl-12 pr-4 rounded-2xl border border-transparent outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-700 font-medium"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            className="w-full bg-gray-50 h-14 pl-12 pr-12 rounded-2xl border border-transparent outline-none focus:bg-white focus:border-indigo-500 transition-all text-gray-700 font-medium"
                        />
                        <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* --- Submit Button --- */}
                <button className="w-full h-14 bg-gray-900 text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2 group tracking-wide">
                    CONTINUE
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* --- Footer Links --- */}
                <div className="space-y-6">
                    <p className="text-center text-gray-500 font-medium text-sm md:text-base">
                        Already have an account? <span className="text-indigo-600 font-bold hover:underline cursor-pointer transition-all">Login here</span>
                    </p>

                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <input 
                            type="checkbox" 
                            className="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer" 
                            id="terms"
                        />
                        <label htmlFor="terms" className="text-xs md:text-sm text-gray-500 leading-snug cursor-pointer">
                            By continuing, I agree to the <span className="text-gray-900 font-bold underline">Terms of Service</span> and <span className="text-gray-900 font-bold underline">Privacy Policy</span>.
                        </label>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;