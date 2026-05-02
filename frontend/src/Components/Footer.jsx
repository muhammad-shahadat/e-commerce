import { ShoppingBag, Mail, MapPin, Phone  } from "lucide-react";
import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
            <div className="container mx-auto px-6 md:px-16">
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                    
                    {/* --- Logo & Description --- */}
                    <div className="flex flex-col gap-5 max-w-sm">
                        <div className="flex items-center gap-3">
                            <div>
                                <ShoppingBag className="text-blue-300" size={35} />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-gray-800 uppercase">
                                Shopper
                            </span>
                        </div>
                        <p className="text-gray-500 leading-relaxed">
                            Elevate your lifestyle with our premium collection. We bring the best trends straight to your doorstep.
                        </p>
                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                                <FaFacebookF size={20} />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300">
                                <FaXTwitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* --- Navigation Links --- */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-10 md:gap-24">
                        <div className="flex flex-col gap-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Company</h4>
                            <ul className="flex flex-col gap-4 text-gray-500">
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">About Us</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Offices</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Careers</li>
                                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Contact</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-900">Contact</h4>
                            <ul className="flex flex-col gap-4 text-gray-500">
                                <li className="flex items-center gap-2">
                                    <MapPin size={16} /> 123 Tech Avenue, Dhaka
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone size={16} /> +880 1234 567890
                                </li>
                                <li className="flex items-center gap-2">
                                    <Mail size={16} /> support@shopper.com
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- Bottom Section (Copyright) --- */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm text-center">
                        Copyright © {currentYear} - <span className="text-indigo-600 font-semibold">SHOPPER</span>. All Rights Reserved.
                    </p>
                    <div className="flex gap-8 text-sm text-gray-400">
                        <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;