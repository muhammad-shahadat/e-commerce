import React, { useState, useEffect } from 'react'
import {
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  Loader2,
  Save,
} from 'lucide-react'

import { useUpdateProductImages } from '../../hooks/useProductMutations'

const ProductImagesForm = ({ productSlug, initialImages = [] }) => {
  const { mutate: updateImages, isPending } = useUpdateProductImages()

  // ১. স্টেট ম্যানেজমেন্ট (এক্সিস্টিং ইমেজ, নতুন ফাইল এবং ডিলিট হওয়া পাবলিক আইডি ট্র্যাক করার জন্য)
  const [mainImage, setMainImage] = useState(null) // ফাইল অবজেক্ট বা ওল্ড ইউআরএল স্ট্রিং
  const [subImages, setSubImages] = useState([]) // মিক্সড অ্যারে (ফাইল অবজেক্ট অথবা ওল্ড ইউআরএল অবজেক্ট)

  // 💡 ওল্ড ডিলিট হওয়া সাব-ইমেজের public_id ট্র্যাক করার স্টেট
  const [deletedSubPublicIds, setDeletedSubPublicIds] = useState([])

  // ইনিশিয়াল ডাটা সেটআপ (পোস্টম্যান রেসপন্সের সাথে ম্যাচ করে)
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      const main = initialImages.find((img) => img.is_main === true)
      const subs = initialImages.filter((img) => img.is_main === false)

      if (main) setMainImage(main.image_url)
      if (subs) {
        setSubImages(subs) // এখানে সম্পূর্ণ অবজেক্ট (with id, public_id) স্টোর হচ্ছে
        setDeletedSubPublicIds([]) // নতুন প্রপ্স/ডাটা আসলে ট্র্যাকিং স্টেট রিসেট করে দিচ্ছি
      }
    }
  }, [initialImages])

  // ২. মেইন ইমেজ চেঞ্জ হ্যান্ডলার
  const handleMainImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMainImage(file) // সরাসরি ফাইল অবজেক্ট সেভ করছি
    }
  }

  // ৩. সাব ইমেজ মাল্টিপল অ্যাড হ্যান্ডলার
  const handleSubImagesChange = (e) => {
    const files = Array.from(e.target.files)

    // ম্যাক্সিমাম ৩ টা সাব-ইমেজ রেস্ট্রিকশন UI সেফটির জন্য
    if (subImages.length + files.length > 3) {
      alert('Maximum 3 gallery images are allowed!')
      return
    }
    setSubImages([...subImages, ...files])
  }

  // ৪. 💡 সাব ইমেজ রিমুভ হ্যান্ডলার (মডিফাইড প্রোডাকশন লজিক)
  const removeSubImage = (indexToRemove) => {
    const imageTarget = subImages[indexToRemove]

    // যদি ইমেজটি ডেটাবেজের ওল্ড ইমেজ হয় (মানে File অবজেক্ট না), তবে এর public_id ট্র্যাকিং স্টেটে পুশ করো
    if (!(imageTarget instanceof File) && imageTarget?.public_id) {
      setDeletedSubPublicIds((prev) => [...prev, imageTarget.public_id])
    }

    setSubImages(subImages.filter((_, idx) => idx !== indexToRemove))
  }

  // ৫. ফর্ম সাবমিট এবং ডাইনামিক FormData প্রিপারেশন
  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData()
    let hasChanges = false

    // ক) মেইন ইমেজ চেঞ্জ চেক
    if (mainImage && typeof mainImage !== 'string') {
      formData.append('mainImage', mainImage)
      hasChanges = true
    }

    // খ) সাব ইমেজ চেঞ্জ চেক (নতুন ফাইল ফিল্টার)
    const newSubFiles = subImages.filter((img) => img instanceof File)
    if (newSubFiles.length > 0) {
      newSubFiles.forEach((file) => {
        formData.append('subImages', file)
      })
      hasChanges = true
    }

    // গ) 💡 ওল্ড সাব-ইমেজ ডিলিট ট্র্যাকিং চেক
    if (deletedSubPublicIds.length > 0) {
      formData.append(
        'deletedSubPublicIds',
        JSON.stringify(deletedSubPublicIds),
      )
      hasChanges = true
    }

    // ব্যাকএন্ড কন্ডিশন গার্ডিং: যদি ইউজার কোন চেঞ্জই না করে
    if (!hasChanges) {
      alert('No changes detected to update.')
      return
    }

    updateImages({
      slug: productSlug,
      formData,
    })
  }

  // হেল্পার ফাংশন: মিক্সড ইমেজ টাইপ প্রিভিউ জেনারেটর
  const renderImagePreview = (imgData) => {
    if (imgData instanceof File) {
      return URL.createObjectURL(imgData) // নতুন সিলেক্টেড লোকাল ফাইল
    }
    return imgData?.image_url || imgData // ডাটাবেজ থেকে আসা ওল্ড ক্লাউডিনারি ইউআরএল
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ImageIcon size={22} className="text-blue-600" />
          <span>Media Gallery Management</span>
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* মেইন ডিসপ্লে ইমেজ সেকশন */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
            Main Display Image (Cover)
          </p>
          <label className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/40 hover:border-blue-400 transition-all min-h-[160px] relative overflow-hidden group">
            <input
              type="file"
              className="hidden"
              onChange={handleMainImageChange}
              accept="image/*"
            />
            {mainImage ? (
              <div className="relative w-full h-full">
                <img
                  src={
                    typeof mainImage === 'string'
                      ? mainImage
                      : URL.createObjectURL(mainImage)
                  }
                  className="h-40 w-full object-cover rounded-xl"
                  alt="Main Product Display"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity rounded-xl">
                  Change Main Cover
                </div>
                <span className="absolute top-2 left-2 bg-green-500 text-[10px] text-white px-2.5 py-1 rounded-md font-bold uppercase tracking-wider shadow-sm">
                  Live Main
                </span>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Upload
                  className="mx-auto mb-2 text-blue-500 animate-pulse"
                  size={28}
                />
                <p className="text-xs font-bold uppercase tracking-wide">
                  Upload Product Cover
                </p>
              </div>
            )}
          </label>
        </div>

        {/* গ্যালারি সাব-ইমেজ সেকশন */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">
            Gallery Images (Max-3)
          </p>
          <div className="grid grid-cols-3 gap-3">
            {/* এক্সিস্টিং এবং নতুন সব সাব-ইমেজ লুপ */}
            {subImages.map((img, i) => (
              <div
                // 💡 ইনডেক্সের বদলে ডেটাবেজের রিয়েল ইউনিক আইডি ব্যবহার করা হলো সেফ রেন্ডারিং ও বাফারিং এড়ানোর জন্য
                key={img instanceof File ? `new-file-${i}` : img.id}
                className="aspect-square rounded-xl relative overflow-hidden group border border-gray-200 shadow-2xs"
              >
                <img
                  src={renderImagePreview(img)}
                  className="w-full h-full object-cover"
                  alt="Product Gallery Sub"
                />

                {/* হোভার করলে ডিলিট বাটন আসবে */}
                <button
                  type="button"
                  onClick={() => removeSubImage(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
                >
                  <X
                    size={20}
                    className="bg-red-600 p-1 rounded-full hover:scale-110 transition-transform"
                  />
                </button>

                {/* যদি ইমেজটি ডাটাবেজের পুরানো ইমেজ হয় তবে একটা ইন্ডিকেটর ব্যাজ */}
                {!(img instanceof File) && (
                  <span className="absolute bottom-1 right-1 bg-gray-800/80 text-[8px] text-white px-1.5 py-0.5 rounded font-medium">
                    Cloud
                  </span>
                )}
              </div>
            ))}

            {/* যদি ৩টার কম সাব-ইমেজ থাকে তবেই শুধু নতুন আপলোড এর প্লাস BOX দেখাবে */}
            {subImages.length < 3 && (
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleSubImagesChange}
                />
                <Plus className="text-gray-400" size={24} />
                <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                  Add Image
                </span>
              </label>
            )}
          </div>
        </div>

        {/* অ্যাকশন বাটন */}
        <div className="flex justify-end pt-2 border-t">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md active:scale-95 transition-all disabled:bg-gray-400 w-full justify-center md:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Update Media Info</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductImagesForm
