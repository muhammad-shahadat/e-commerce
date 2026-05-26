import React, { useState } from 'react'
import {
  Upload,
  X,
  Plus,
  Trash2,
  ChevronDown,
  Tag,
  Package,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react'

import useGetCategories from '../../hooks/useCategoryQueries'
import { useCreateProducts } from '../../hooks/useProductMutations'
import { useNavigate } from 'react-router-dom'

const AddProduct = () => {
  const { data: categories = [], isLoading } = useGetCategories()
  const [hasVariants, setHasVariants] = useState(false)
  const { mutate, isPending } = useCreateProducts()
  const [selectedChain, setSelectedChain] = useState([])
  const navigate = useNavigate()

  const [product, setProduct] = useState({
    title: '',
    description: '',
    base_price: '',
    discount_percent: 0,
    category_id: '',
    single_quantity: 0, //when doesn't variants
    mainImage: null,
    subImages: [],
    variants: [],
  })

  /* -- category logic start -- */
  const getSubCategories = (id) => {
    return categories.filter((cat) => cat.parent_id === id)
  }

  const handleChangeCategory = (index, value) => {
    if (!value) {
      // if user select "empty or select option"
      const newChain = selectedChain.slice(0, index)
      setSelectedChain(newChain)
      const lastSelectedId =
        newChain.length > 0 ? newChain[newChain.length - 1] : ''
      setProduct({ ...product, category_id: lastSelectedId })
      return
    }

    const newChain = [...selectedChain.slice(0, index), value]
    setSelectedChain(newChain)
    setProduct({ ...product, category_id: value })
  }
  /* -- category logic end -- */

  // 2. General input handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }

  // 3. Main image handling
  const handleMainImage = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProduct({ ...product, mainImage: file })
    }
  }

  // 4. Sub image array handling
  // Array.from(), Convert e.target.files (which is a FileList, not a real array) into a true array
  // so we can easily use array operations like spread, map, etc.
  const handleSubImages = (e) => {
    const files = Array.from(e.target.files)
    setProduct({ ...product, subImages: [...product.subImages, ...files] })
  }

  // 4. variant logic
  const addVariant = () => {
    setProduct({
      ...product,
      variants: [
        ...product.variants,
        {
          price_modifier: 0,
          quantity: 0,
          options: [
            { option_name: 'Color', option_value: '' },
            { option_name: 'Size', option_value: '' },
          ],
        },
      ],
    })
  }

  const removeVariant = (index) => {
    setProduct({
      ...product,
      variants: product.variants.filter((_, i) => i !== index),
    })
  }

  const updateVariantOption = (vIndex, oName, value) => {
    const updatedVariants = [...product.variants]
    const opt = updatedVariants[vIndex].options.find(
      (o) => o.option_name === oName,
    )

    // Since find() returns a reference to the original object,
    // updating opt will directly update the object inside updatedVariants
    if (opt) opt.option_value = value
    setProduct({ ...product, variants: updatedVariants })
  }

  const handleVariantFieldChange = (vIndex, field, value) => {
    const updatedVariants = [...product.variants]
    updatedVariants[vIndex][field] = value
    setProduct({ ...product, variants: updatedVariants })
  }

  // 5. Final upload handler
  const handleSubmit = async () => {
    const formData = new FormData()

    // General data append
    formData.append('title', product.title)
    formData.append('description', product.description)
    formData.append('base_price', product.base_price)
    formData.append('discount_percent', product.discount_percent)
    formData.append('category_id', product.category_id)

    // sending data according to variants logic
    if (hasVariants) {
      formData.append('variants', JSON.stringify(product.variants))
      formData.append('total_quantity', 0) // if variants exist
    } else {
      formData.append('variants', JSON.stringify([]))
      formData.append('total_quantity', product.single_quantity)
    }

    // image append
    if (product.mainImage) {
      formData.append('mainImage', product.mainImage)
    }

    if (product.subImages.length > 0) {
      product.subImages.forEach((file) => formData.append('subImages', file))
    }

    mutate(formData, {
      onSuccess: () => {
        setProduct({
          title: '',
          description: '',
          base_price: '',
          discount_percent: 0,
          category_id: '',
          single_quantity: 0,
          mainImage: null,
          subImages: [],
          variants: [],
        })

        setHasVariants(false)
        //navigate("/dashboard/product") -> later add it
      },
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans">
      <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Publish Product</h1>
          <p className="text-gray-500 text-sm">
            PostgreSQL & Cloudinary Architecture
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all disabled:bg-gray-400"
        >
          {isPending ? (
            <Loader2 size={18} className="text-gray-300 animate-spin" />
          ) : (
            'Upload to Store'
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 border-b pb-3 text-blue-600">
              <Tag size={20} />{' '}
              <h3 className="text-lg font-bold">Product Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Product Title
                </label>
                <input
                  name="title"
                  value={product.title}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Slim Fit Denim"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={product.base_price}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount_percent"
                    value={product.discount_percent}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  onChange={handleChange}
                  value={product.description}
                  rows="4"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>
          </div>

          {/* Inventory & Variants Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
                <Package size={20} /> Inventory Management
              </h3>
              <label className="flex items-center cursor-pointer gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
                <span className="text-xs font-bold text-gray-600">
                  Enable Variants?
                </span>
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
              </label>
            </div>

            {!hasVariants ? (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="single_quantity"
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300"
                  placeholder="How many items in stock?"
                />
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-end">
                  <button
                    onClick={addVariant}
                    className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    + Add New Variant
                  </button>
                </div>
                {product.variants.map((v, vIndex) => (
                  <div
                    key={vIndex}
                    className="p-4 border border-gray-200 bg-white rounded-xl relative shadow-sm"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-10">
                      <input
                        value={v.options[0].option_value}
                        onChange={(e) =>
                          updateVariantOption(vIndex, 'Color', e.target.value)
                        }
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        placeholder="Color (Red)"
                      />
                      <input
                        value={v.options[1].option_value}
                        onChange={(e) =>
                          updateVariantOption(vIndex, 'Size', e.target.value)
                        }
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        placeholder="Size (e.g. XL)"
                      />
                      <input
                        type="number"
                        value={v.price_modifier}
                        onChange={(e) =>
                          handleVariantFieldChange(
                            vIndex,
                            'price_modifier',
                            e.target.value,
                          )
                        }
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        placeholder="+ Price"
                      />
                      <input
                        type="number"
                        value={v.quantity}
                        onChange={(e) =>
                          handleVariantFieldChange(
                            vIndex,
                            'quantity',
                            e.target.value,
                          )
                        }
                        className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                        placeholder="Stock"
                      />
                    </div>
                    <button
                      onClick={() => removeVariant(vIndex)}
                      className="absolute top-1/2 -translate-y-1/2 right-3 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                {product.variants.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">
                    Click &apos;Add New Variant&apos; to start
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Media Gallery */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ImageIcon size={20} /> Media Gallery
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Main Display Image
                </p>
                <label className="border-2 border-dashed border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all min-h-[140px]">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleMainImage}
                    accept="image/*"
                  />
                  {product.mainImage ? (
                    <div className="relative w-full">
                      <img
                        src={URL.createObjectURL(product.mainImage)}
                        className="h-32 w-full object-cover rounded-lg"
                        alt="Main"
                      />
                      <span className="absolute top-1 left-1 bg-green-500 text-[10px] text-white px-2 py-0.5 rounded font-bold uppercase">
                        Main
                      </span>
                    </div>
                  ) : (
                    <div className="text-center text-blue-400">
                      <Upload className="mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase">
                        Upload Cover
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Gallery Images Max-3
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {product.subImages.map((img, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg relative overflow-hidden group border border-gray-100"
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        className="w-full h-full object-cover"
                        alt="Sub"
                      />
                      <button
                        onClick={() =>
                          setProduct({
                            ...product,
                            subImages: product.subImages.filter(
                              (_, idx) => idx !== i,
                            ),
                          })
                        }
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-300 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleSubImages}
                    />
                    <Plus className="text-gray-300" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Level Category Select */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
              <ChevronDown size={20} /> Categories
            </h3>

            {/* Main Level */}
            <div className="relative">
              <select
                value={selectedChain[0] || ''}
                onChange={(e) => handleChangeCategory(0, e.target.value)}
                disabled={isLoading}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {isLoading ? (
                  <option>Fetching categories...</option>
                ) : (
                  <>
                    <option value="">Select Main Category</option>
                    {getSubCategories(null).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>

              <div className="absolute right-3 top-3.5 pointer-events-none">
                {isLoading ? (
                  <Loader2 className="text-blue-500 animate-spin" size={18} />
                ) : (
                  <ChevronDown className="text-gray-400" size={18} />
                )}
              </div>
            </div>

            {/* Sub Levels (Dynamic) */}
            {selectedChain.map((id, index) => {
              const subCats = getSubCategories(id)
              if (subCats.length === 0) return null

              return (
                <div
                  key={index}
                  className="relative animate-in fade-in slide-in-from-top-1"
                >
                  <select
                    value={selectedChain[index + 1] || ''}
                    onChange={(e) =>
                      handleChangeCategory(index + 1, e.target.value)
                    }
                    className="w-full p-3 text-[15px] bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="">Select Sub-Category (Optional)</option>
                    {subCats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              )
            })}

            {product.category_id && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-600 font-semibold truncate">
                  Active ID: {product.category_id}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddProduct

// import React, { useState, useEffect } from 'react'
// import { useSearchParams, useNavigate } from 'react-router-dom'
// import {
//   Upload,
//   X,
//   Plus,
//   Trash2,
//   ChevronDown,
//   Tag,
//   Package,
//   Loader2,
//   Image as ImageIcon,
//   ArrowLeft,
// } from 'lucide-react'

// import useGetCategories from '../../hooks/useCategoryQueries'
// import {
//   useCreateProducts,
//   useUpdateProduct,
// } from '../../hooks/useProductMutations'
// import { useGetProduct } from '../../hooks/useProductQueries'

// const AddProduct = () => {
//   const navigate = useNavigate()
//   const [searchParams] = useSearchParams()
//   const slug = searchParams.get('slug')

//   // স্ল্যাগ যদি ইউআরএল-এ থাকে তবেই এটি এডিট মোড হিসেবে ট্রিগার হবে
//   const isEditMode = !!slug

//   // ১. কুয়েরি ও মিউটেশন হুকগুলোর কানেকশন
//   const { data: categories = [], isLoading: isCategoriesLoading } =
//     useGetCategories()
//   const { data: existingProduct, isLoading: isProductLoading } =
//     useGetProduct(slug)
//   const { mutate: createProduct, isPending: isCreatePending } =
//     useCreateProducts()
//   const { mutate: updateProduct, isPending: isUpdatePending } =
//     useUpdateProduct()

//   const isPending = isCreatePending || isUpdatePending

//   // ২. ফর্মের ইনিশিয়াল স্টেট
//   const [hasVariants, setHasVariants] = useState(false)
//   const [selectedChain, setSelectedChain] = useState([])
//   const [product, setProduct] = useState({
//     title: '',
//     description: '',
//     base_price: '',
//     discount_percent: 0,
//     category_id: '',
//     single_quantity: 0,
//     mainImage: null,
//     subImages: [],
//     variants: [],
//   })

//   // ৩. ইউআরএল স্ল্যাগ এবং ডাটাবেজ রেসপন্সের ওপর ভিত্তি করে কন্ডিশনাল রেন্ডারিং
//   useEffect(() => {
//     if (isEditMode && existingProduct?.product) {
//       const prodData = existingProduct.product
//       const imgsData = existingProduct.images || []
//       const varsData = existingProduct.variants || []
//       const treeData = existingProduct.categoryTree || []

//       // মেইন ইমেজ এবং সাব ইমেজ আলাদা করা
//       const mainImgObj = imgsData.find((img) => img.is_main)
//       const subImgObjs = imgsData.filter((img) => !img.is_main)

//       // ভেরিয়েন্টগুলোর কী (key) ডাটাবেজ স্কিমার সাথে ফর্মের ফিল্ড ম্যাচ করানো
//       const mappedVariants = varsData.map((v) => ({
//         price_modifier: v.price_modifier || 0,
//         quantity: v.stock_quantity || 0,
//         options: v.options || [
//           { option_name: 'Color', option_value: '' },
//           { option_name: 'Size', option_value: '' },
//         ],
//       }))

//       // এডিট মোড হলে আগের ডেটা ফর্মে সেট হবে
//       setProduct({
//         title: prodData.title || '',
//         description: prodData.description || '',
//         base_price: prodData.base_price || '',
//         discount_percent: prodData.discount_percent || 0,
//         category_id: prodData.category_id || '',
//         single_quantity:
//           varsData.length === 0 ? varsData[0]?.stock_quantity || 0 : 0,
//         mainImage: mainImgObj ? mainImgObj.image_url : null,
//         subImages: subImgObjs.map((img) => img.image_url),
//         variants: mappedVariants,
//       })

//       if (mappedVariants.length > 0) {
//         setHasVariants(true)
//       } else {
//         setHasVariants(false)
//       }

//       // এপিআই থেকে সরাসরি ক্যাটাগরি চেইন সেট করা
//       if (treeData.length > 0) {
//         setSelectedChain(treeData.map((cat) => cat.id))
//       }
//     } else if (!isEditMode) {
//       // ফ্রেশ বা অ্যাড মোড হলে ফর্ম একদম খালি বা রিসেট থাকবে
//       setHasVariants(false)
//       setSelectedChain([])
//       setProduct({
//         title: '',
//         description: '',
//         base_price: '',
//         discount_percent: 0,
//         category_id: '',
//         single_quantity: 0,
//         mainImage: null,
//         subImages: [],
//         variants: [],
//       })
//     }
//   }, [isEditMode, existingProduct])

//   const getSubCategories = (id) => {
//     return categories.filter((cat) => cat.parent_id === id)
//   }

//   const handleChangeCategory = (index, value) => {
//     if (!value) {
//       const newChain = selectedChain.slice(0, index)
//       setSelectedChain(newChain)
//       const lastSelectedId =
//         newChain.length > 0 ? newChain[newChain.length - 1] : ''
//       setProduct((prev) => ({ ...prev, category_id: lastSelectedId }))
//       return
//     }

//     const newChain = [...selectedChain.slice(0, index), value]
//     setSelectedChain(newChain)
//     setProduct((prev) => ({ ...prev, category_id: value }))
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setProduct((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleMainImage = (e) => {
//     const file = e.target.files[0]
//     if (file) setProduct((prev) => ({ ...prev, mainImage: file }))
//   }

//   const handleSubImages = (e) => {
//     const files = Array.from(e.target.files)
//     setProduct((prev) => ({
//       ...prev,
//       subImages: [...prev.subImages, ...files],
//     }))
//   }

//   const addVariant = () => {
//     setProduct((prev) => ({
//       ...prev,
//       variants: [
//         ...prev.variants,
//         {
//           price_modifier: 0,
//           quantity: 0,
//           options: [
//             { option_name: 'Color', option_value: '' },
//             { option_name: 'Size', option_value: '' },
//           ],
//         },
//       ],
//     }))
//   }

//   const removeVariant = (index) => {
//     setProduct((prev) => ({
//       ...prev,
//       variants: prev.variants.filter((_, i) => i !== index),
//     }))
//   }

//   const updateVariantOption = (vIndex, oName, value) => {
//     setProduct((prev) => {
//       const updatedVariants = [...prev.variants]
//       if (!updatedVariants[vIndex].options) updatedVariants[vIndex].options = []

//       const opt = updatedVariants[vIndex].options.find(
//         (o) => o.option_name === oName,
//       )
//       if (opt) {
//         opt.option_value = value
//       } else {
//         updatedVariants[vIndex].options.push({
//           option_name: oName,
//           option_value: value,
//         })
//       }
//       return { ...prev, variants: updatedVariants }
//     })
//   }

//   const handleVariantFieldChange = (vIndex, field, value) => {
//     setProduct((prev) => {
//       const updatedVariants = [...prev.variants]
//       updatedVariants[vIndex][field] = value
//       return { ...prev, variants: updatedVariants }
//     })
//   }

//   // ৪. সাবমিট মেথড
//   const handleSubmit = async () => {
//     const formData = new FormData()

//     formData.append('title', product.title)
//     formData.append('description', product.description)
//     formData.append('base_price', product.base_price)
//     formData.append('discount_percent', product.discount_percent)
//     formData.append('category_id', product.category_id)

//     if (hasVariants) {
//       formData.append('variants', JSON.stringify(product.variants))
//       formData.append('total_quantity', '0')
//     } else {
//       formData.append('variants', JSON.stringify([]))
//       formData.append('total_quantity', String(product.single_quantity))
//     }

//     if (product.mainImage instanceof File) {
//       formData.append('mainImage', product.mainImage)
//     } else if (typeof product.mainImage === 'string') {
//       formData.append('existingMainImage', product.mainImage)
//     }

//     const existingSubImages = []
//     product.subImages.forEach((img) => {
//       if (img instanceof File) {
//         formData.append('subImages', img)
//       } else if (typeof img === 'string') {
//         existingSubImages.push(img)
//       }
//     })
//     formData.append('existingSubImages', JSON.stringify(existingSubImages))

//     const mutationOptions = {
//       onSuccess: () => {
//         navigate('/dashboard/products')
//       },
//     }

//     if (isEditMode) {
//       updateProduct({ slug, formData }, mutationOptions)
//     } else {
//       createProduct(formData, mutationOptions)
//     }
//   }

//   if (isEditMode && isProductLoading) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-gray-50/50">
//         <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
//         <p className="text-gray-500 font-medium text-sm">
//           Fetching product specifications...
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen font-sans">
//       <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate('/dashboard/products')}
//             className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
//           >
//             <ArrowLeft size={20} className="text-gray-600" />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">
//               {isEditMode
//                 ? 'Modify Product Specifications'
//                 : 'Publish New Product'}
//             </h1>
//             <p className="text-gray-500 text-sm">
//               PostgreSQL & Cloudinary Core Infrastructure
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={handleSubmit}
//           disabled={isPending}
//           className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
//         >
//           {isPending ? (
//             <>
//               <Loader2 size={18} className="animate-spin" />
//               <span>Processing...</span>
//             </>
//           ) : isEditMode ? (
//             'Update Product'
//           ) : (
//             'Upload to Store'
//           )}
//         </button>
//       </header>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-6">
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//             <div className="flex items-center gap-2 mb-6 border-b pb-3 text-blue-600">
//               <Tag size={20} />
//               <h3 className="text-lg font-bold">Product Information</h3>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
//                   Product Title
//                 </label>
//                 <input
//                   name="title"
//                   value={product.title}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g. Premium Leather Jacket"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
//                     Base Price (৳)
//                   </label>
//                   <input
//                     type="number"
//                     name="base_price"
//                     value={product.base_price}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
//                     Discount (%)
//                   </label>
//                   <input
//                     type="number"
//                     name="discount_percent"
//                     value={product.discount_percent}
//                     onChange={handleChange}
//                     className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
//                     placeholder="0"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   onChange={handleChange}
//                   value={product.description}
//                   rows="4"
//                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
//                 <Package size={20} /> Inventory Management
//               </h3>
//               <label className="flex items-center cursor-pointer gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
//                 <span className="text-xs font-bold text-gray-600">
//                   Enable Variants?
//                 </span>
//                 <input
//                   type="checkbox"
//                   checked={hasVariants}
//                   onChange={(e) => setHasVariants(e.target.checked)}
//                   className="w-4 h-4 accent-blue-600"
//                 />
//               </label>
//             </div>

//             {!hasVariants ? (
//               <div className="animate-in fade-in duration-300">
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
//                   Stock Quantity
//                 </label>
//                 <input
//                   type="number"
//                   name="single_quantity"
//                   value={product.single_quantity}
//                   onChange={handleChange}
//                   className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-300"
//                   placeholder="How many items in stock?"
//                 />
//               </div>
//             ) : (
//               <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
//                 <div className="flex justify-end">
//                   <button
//                     onClick={addVariant}
//                     className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
//                   >
//                     + Add New Variant
//                   </button>
//                 </div>
//                 {product.variants.map((v, vIndex) => (
//                   <div
//                     key={vIndex}
//                     className="p-4 border border-gray-200 bg-white rounded-xl relative shadow-sm"
//                   >
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-10">
//                       <input
//                         value={
//                           v.options?.find((o) => o.option_name === 'Color')
//                             ?.option_value || ''
//                         }
//                         onChange={(e) =>
//                           updateVariantOption(vIndex, 'Color', e.target.value)
//                         }
//                         className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
//                         placeholder="Color"
//                       />
//                       <input
//                         value={
//                           v.options?.find((o) => o.option_name === 'Size')
//                             ?.option_value || ''
//                         }
//                         onChange={(e) =>
//                           updateVariantOption(vIndex, 'Size', e.target.value)
//                         }
//                         className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
//                         placeholder="Size"
//                       />
//                       <input
//                         type="number"
//                         value={v.price_modifier}
//                         onChange={(e) =>
//                           handleVariantFieldChange(
//                             vIndex,
//                             'price_modifier',
//                             e.target.value,
//                           )
//                         }
//                         className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
//                         placeholder="+ Price Mod"
//                       />
//                       <input
//                         type="number"
//                         value={v.quantity}
//                         onChange={(e) =>
//                           handleVariantFieldChange(
//                             vIndex,
//                             'quantity',
//                             e.target.value,
//                           )
//                         }
//                         className="p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
//                         placeholder="Stock"
//                       />
//                     </div>
//                     <button
//                       onClick={() => removeVariant(vIndex)}
//                       className="absolute top-1/2 -translate-y-1/2 right-3 text-red-400 hover:text-red-600 transition-colors"
//                     >
//                       <Trash2 size={20} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
//               <ImageIcon size={20} /> Media Gallery
//             </h3>
//             <div className="space-y-4">
//               <div>
//                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
//                   Main Display Image
//                 </p>
//                 <label className="border-2 border-dashed border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all min-h-[140px]">
//                   <input
//                     type="file"
//                     className="hidden"
//                     onChange={handleMainImage}
//                     accept="image/*"
//                   />
//                   {product.mainImage ? (
//                     <div className="relative w-full">
//                       <img
//                         src={
//                           product.mainImage instanceof File
//                             ? URL.createObjectURL(product.mainImage)
//                             : product.mainImage
//                         }
//                         className="h-32 w-full object-cover rounded-lg"
//                         alt="Main Preview"
//                       />
//                       <span className="absolute top-1 left-1 bg-green-500 text-[10px] text-white px-2 py-0.5 rounded font-bold uppercase">
//                         Main
//                       </span>
//                     </div>
//                   ) : (
//                     <div className="text-center text-blue-400">
//                       <Upload className="mx-auto mb-2" />
//                       <p className="text-[10px] font-bold uppercase">
//                         Upload Cover
//                       </p>
//                     </div>
//                   )}
//                 </label>
//               </div>

//               <div>
//                 <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
//                   Gallery Images Max-3
//                 </p>
//                 <div className="grid grid-cols-3 gap-2">
//                   {product.subImages.map((img, i) => (
//                     <div
//                       key={i}
//                       className="aspect-square rounded-lg relative overflow-hidden group border border-gray-100"
//                     >
//                       <img
//                         src={
//                           img instanceof File ? URL.createObjectURL(img) : img
//                         }
//                         className="w-full h-full object-cover"
//                         alt="Sub Preview"
//                       />
//                       <button
//                         onClick={() =>
//                           setProduct((prev) => ({
//                             ...prev,
//                             subImages: prev.subImages.filter(
//                               (_, idx) => idx !== i,
//                             ),
//                           }))
//                         }
//                         className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   ))}
//                   <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-300 transition-colors">
//                     <input
//                       type="file"
//                       className="hidden"
//                       multiple
//                       onChange={handleSubImages}
//                     />
//                     <Plus className="text-gray-300" />
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
//             <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
//               <ChevronDown size={20} /> Categories Hierarchy
//             </h3>

//             <div className="relative">
//               <select
//                 value={selectedChain[0] || ''}
//                 onChange={(e) => handleChangeCategory(0, e.target.value)}
//                 disabled={isCategoriesLoading}
//                 className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-500 font-medium"
//               >
//                 {isCategoriesLoading ? (
//                   <option>Fetching categories...</option>
//                 ) : (
//                   <>
//                     <option value="">Select Main Category</option>
//                     {getSubCategories(null).map((cat) => (
//                       <option key={cat.id} value={cat.id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </>
//                 )}
//               </select>
//               <div className="absolute right-3 top-3.5 pointer-events-none">
//                 <ChevronDown className="text-gray-400" size={18} />
//               </div>
//             </div>

//             {selectedChain.map((id, index) => {
//               const subCats = getSubCategories(id)
//               if (subCats.length === 0) return null

//               return (
//                 <div
//                   key={index}
//                   className="relative animate-in fade-in slide-in-from-top-1"
//                 >
//                   <select
//                     value={selectedChain[index + 1] || ''}
//                     onChange={(e) =>
//                       handleChangeCategory(index + 1, e.target.value)
//                     }
//                     className="w-full p-3 text-[15px] bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none focus:ring-2 focus:ring-blue-500 font-medium"
//                   >
//                     <option value="">Select Sub-Category (Optional)</option>
//                     {subCats.map((cat) => (
//                       <option key={cat.id} value={cat.id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown
//                     className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
//                     size={18}
//                   />
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AddProduct
