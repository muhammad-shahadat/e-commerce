import { ShoppingBag, Mail, MapPin, Phone } from 'lucide-react'
import { FaInstagram, FaFacebookF, FaXTwitter } from 'react-icons/fa6'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-white pt-12 md:pt-16 pb-8 border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-16">
        {/* 🟢 ফিক্স: মোবাইলে আইটেমগুলো সেন্টারে থাকবে এবং গ্রিড বা ফ্লেক্স যেন স্ক্রিন না ভাঙতে পারে */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12 md:mb-16 w-full max-w-full">
          {/* --- Logo & Description --- */}
          <div className="flex flex-col gap-4 max-w-sm w-full">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <ShoppingBag className="text-indigo-600" size={30} />
              <span className="text-xl md:text-2xl font-black tracking-tighter text-gray-800 uppercase">
                Shopper
              </span>
            </div>
            <p className="text-gray-500 text-sm md:text-base text-center md:text-left leading-relaxed">
              Elevate your lifestyle with our premium collection. We bring the
              best trends straight to your doorstep.
            </p>
            {/* Social Icons */}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <a
                href="#"
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
              >
                <FaXTwitter size={18} />
              </a>
            </div>
          </div>

          {/* --- Navigation Links --- */}
          {/* 🟢 ফিক্স: gap-6 মোবাইলের জন্য পারফেক্ট, আর w-full দিয়ে বাউন্ডারি লক করা হয়েছে */}
          <div className="grid grid-cols-2 gap-6 sm:gap-10 md:gap-24 w-full md:w-auto">
            <div className="flex flex-col gap-4 md:gap-6">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-900">
                Company
              </h4>
              <ul className="flex flex-col gap-3 text-sm text-gray-500">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                  About Us
                </li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                  Offices
                </li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                  Careers
                </li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">
                  Contact
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 md:gap-6">
              <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-900">
                Contact
              </h4>
              {/* 🟢 ফিক্স: break-words এবং items-start যোগ করা হয়েছে যাতে বড় অ্যাড্রেস নিচে ভেঙে যায়, স্ক্রিন না ঠেলে */}
              <ul className="flex flex-col gap-3 text-sm text-gray-500 max-w-full break-words">
                <li className="flex items-start gap-2 max-w-full">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                  <span className="leading-tight">123 Tech Avenue, Dhaka</span>
                </li>
                <li className="flex items-center gap-2 max-w-full">
                  <Phone size={16} className="shrink-0 text-gray-400" />
                  <span>+880 1234 567890</span>
                </li>
                <li className="flex items-center gap-2 max-w-full">
                  <Mail size={16} className="shrink-0 text-gray-400" />
                  <span className="truncate sm:text-wrap">
                    support@shopper.com
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Bottom Section (Copyright) --- */}
        <div className="pt-6 border-t border-gray-100 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs md:text-sm text-center">
            Copyright © {currentYear} -{' '}
            <span className="text-indigo-600 font-semibold">SHOPPER</span>. All
            Rights Reserved.
          </p>
          <div className="flex gap-4 md:gap-8 text-xs md:text-sm text-gray-400">
            <span className="hover:text-gray-600 cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-gray-600 cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
