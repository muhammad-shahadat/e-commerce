import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { ArrowRight } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

import heroImage1 from '../../assets/header_headphone_image.png'
import heroImage2 from '../../assets/header_playstation_image.png'
import heroImage3 from '../../assets/header_macbook_image.png'

const Hero = () => {
  const slides = [
    {
      id: 1,
      title: 'Experience Pure Sound - Your Perfect Headphones Awaits!',
      offer: 'Limited Time Offer 30% Off',
      button1: 'Buy now',
      button2: 'Find more',
      image: heroImage1,
      bgColor: 'from-[#F3F5F9] to-[#E2E8F0]',
      accentColor: 'text-orange-600',
      btnColor: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      id: 2,
      title: 'Next-Level Gaming Starts Here - Discover PlayStation 5 Today!',
      offer: 'Hurry up only few lefts!',
      button1: 'Shop Now',
      button2: 'Explore Deals',
      image: heroImage2,
      bgColor: 'from-[#E6E9F2] to-[#D1D5DB]',
      accentColor: 'text-blue-600',
      btnColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 3,
      title: 'Power Meets Elegance - Apple MacBook Pro is Here for you!',
      offer: 'Exclusive Deal 40% Off',
      button1: 'Order Now',
      button2: 'Learn More',
      image: heroImage3,
      bgColor: 'from-[#F8FAFC] to-[#F1F5F9]',
      accentColor: 'text-indigo-600',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ]

  return (
    // Set max-width and mx-auto to center content on large screens (1440px limit)
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-10 py-4">
      <Swiper
        spaceBetween={0}
        effect={'fade'}
        loop={true}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        modules={[Autoplay, Pagination, EffectFade]}
        className="mySwiper rounded-3xl overflow-hidden shadow-xl"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            {/* Reduced vertical padding (py-12 md:py-16) to keep content within viewport */}
            <div
              className={`flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-12 lg:px-16 py-12 md:py-16 bg-gradient-to-br ${slide.bgColor} min-h-[450px] md:min-h-[500px] transition-all duration-1000`}
            >
              {/* --- Left Content: Text and CTA Buttons --- */}
              <div className="flex-1 space-y-4 text-center md:text-left mt-8 md:mt-0">
                <p
                  className={`text-xs md:text-sm font-bold tracking-widest uppercase ${slide.accentColor}`}
                >
                  {slide.offer}
                </p>

                {/* Adjusted heading sizes for better responsiveness on laptops */}
                <h1 className="max-w-md lg:max-w-lg text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                  {slide.title}
                </h1>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
                  <button
                    className={`px-8 py-3 ${slide.btnColor} text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md cursor-pointer text-sm md:text-base`}
                  >
                    {slide.button1}
                  </button>

                  <button className="group flex items-center gap-2 px-4 py-3 font-bold text-gray-700 hover:text-gray-900 transition-all cursor-pointer text-sm md:text-base">
                    {slide.button2}
                    <ArrowRight
                      className="group-hover:translate-x-1 transition-transform text-gray-400"
                      size={18}
                    />
                  </button>
                </div>
              </div>

              {/* --- Right Content: Product Image --- */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>

                  {/* Image size constraints (max-h-[300px] to max-h-[400px]) for laptop screen compatibility */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="relative z-10 w-auto h-auto max-w-[200px] md:max-w-[350px] lg:max-w-[420px] max-h-[300px] md:max-h-[400px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .swiper-pagination-bullet-active {
          background: #1e293b !important;
          width: 20px !important;
        }
      `}</style>
    </section>
  )
}

export default Hero
