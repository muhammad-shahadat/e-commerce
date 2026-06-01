import React, { useState, useEffect } from 'react'
import { Package, Trash2, Plus, Loader2, Save, AlertCircle } from 'lucide-react'
import { useSyncProductVariants } from '../../hooks/useProductMutations'

const ProductVariantsForm = ({ productSlug, initialVariants = [] }) => {
  const { mutate: syncVariants, isPending } = useSyncProductVariants()
  const [variants, setVariants] = useState([])

  // single product conversion
  const [totalQuantity, setTotalQuantity] = useState('')

  // helper function to format data  (Deep Equality and Payload generation )

  const formatVariantsForSync = (rawVariants) => {
    return rawVariants.map((v) => {
      const colorOptVal =
        v.options?.find((o) => o.option_name === 'Color')?.option_value || ''

      const sizeOptVal =
        v.options?.find((o) => o.option_name === 'Size')?.option_value || ''

      return {
        product_variant_id: v.product_variant_id || null,
        price_modifier: Number(v.price_modifier) || 0,
        quantity: Number(v.stock_quantity ?? v.quantity ?? 0),
        options: [
          { option_name: 'Color', option_value: colorOptVal.trim() },
          { option_name: 'Size', option_value: sizeOptVal.trim() },
        ],
      }
    })
  }

  // 1. initial data state sync
  useEffect(() => {
    if (initialVariants && initialVariants.length > 0) {
      // যদি ডাটাবেজে অলরেডি ভ্যারিয়েন্ট থাকে (এবং সেগুলো ডিফল্ট সিঙ্গেল প্রোডাক্ট না হয়)
      const isSingleProduct =
        initialVariants.length === 1 &&
        (!initialVariants[0].options || initialVariants[0].options.length === 0)

      if (isSingleProduct) {
        setVariants([])
        setTotalQuantity(initialVariants[0].stock_quantity ?? 0)
      } else {
        setVariants(formatVariantsForSync(initialVariants))
        setTotalQuantity('')
      }
    } else {
      setVariants([])
      setTotalQuantity('')
    }
  }, [initialVariants])

  // ২. নতুন ভ্যারিয়েন্ট অ্যাড হ্যান্ডলার
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        product_variant_id: null,
        price_modifier: 0,
        quantity: 0,
        options: [
          { option_name: 'Color', option_value: '' },
          { option_name: 'Size', option_value: '' },
        ],
      },
    ])
  }

  // ৩. ভ্যারিয়েন্ট রিমুভ হ্যান্ডলার
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  // ৪. ডাইনামিক অপশন ভ্যালু আপডেট হ্যান্ডলার (Color/Size)
  const updateVariantOption = (vIndex, oName, value) => {
    const updatedVariants = [...variants]
    const opt = updatedVariants[vIndex].options.find(
      (o) => o.option_name === oName,
    )
    if (opt) opt.option_value = value
    setVariants(updatedVariants)
  }

  // ৫. অন্যান্য ফিল্ড আপডেট হ্যান্ডলার (Price/Quantity)
  const handleVariantFieldChange = (vIndex, field, value) => {
    const updatedVariants = [...variants]
    updatedVariants[vIndex][field] = value
    setVariants(updatedVariants)
  }

  // 💡 ৬. চেঞ্জ ডিটেকশন গার্ড (Deep Equality Check with Single Product Support)
  const checkIfDataChanged = () => {
    const isOriginalSingle =
      initialVariants.length === 1 &&
      (!initialVariants[0].options || initialVariants[0].options.length === 0)
    const isCurrentSingle = variants.length === 0

    // ক) ডাটাবেজেও সিঙ্গেল ছিল, এখনও সিঙ্গেল আছে -> শুধু কোয়ান্টিটি চেঞ্জ হয়েছে কিনা চেক
    if (isOriginalSingle && isCurrentSingle) {
      const origQty = Number(initialVariants[0].stock_quantity ?? 0)
      return origQty !== Number(totalQuantity)
    }

    // খ) আগে সিঙ্গেল ছিল এখন ভ্যারিয়েন্ট বানাইছে, অথবা আগে ভ্যারিয়েন্ট ছিল এখন সিঙ্গেল বানাইছে -> চেঞ্জ হয়েছে
    if (isOriginalSingle !== isCurrentSingle) return true

    // গ) দুই ক্ষেত্রেই একাধিক বা নরমাল ভ্যারিয়েন্ট লিস্ট আছে -> ডিপ কম্প্যারিসন লুপ
    const originalFormatted = formatVariantsForSync(initialVariants)
    const currentFormatted = formatVariantsForSync(variants)

    if (originalFormatted.length !== currentFormatted.length) return true

    for (let i = 0; i < currentFormatted.length; i++) {
      const orig = originalFormatted[i]
      const curr = currentFormatted[i]

      if (orig.product_variant_id !== curr.product_variant_id) return true
      if (orig.price_modifier !== curr.price_modifier) return true
      if (orig.quantity !== curr.quantity) return true

      const origColor = orig.options.find(
        (o) => o.option_name === 'Color',
      )?.option_value
      const currColor = curr.options.find(
        (o) => o.option_name === 'Color',
      )?.option_value
      const origSize = orig.options.find(
        (o) => o.option_name === 'Size',
      )?.option_value
      const currSize = curr.options.find(
        (o) => o.option_name === 'Size',
      )?.option_value

      if (origColor !== currColor || origSize !== currSize) return true
    }

    return false
  }

  // ৭. ফাইনাল সাবমিট হ্যান্ডলার
  const handleSubmit = (e) => {
    e.preventDefault()

    // সিনারিও ১: ইউজার সব ভ্যারিয়েন্ট ডিলিট করে সিঙ্গেল প্রোডাক্ট বানাতে চাচ্ছে
    if (variants.length === 0) {
      if (
        totalQuantity === undefined ||
        totalQuantity === null ||
        totalQuantity === '' ||
        Number(totalQuantity) < 0
      ) {
        alert('Please enter a valid stock quantity for the single product.')
        return
      }
    } else {
      // সিনারিও ২: ভ্যারিয়েন্ট মোড অন, তাই খালি ইনপুট ভ্যালিডেশন চেক
      for (let i = 0; i < variants.length; i++) {
        const hasEmptyOption = variants[i].options.some(
          (opt) => !opt.option_value.trim(),
        )
        if (hasEmptyOption) {
          alert(
            `Please fill all attributes (Color & Size) for variant #${i + 1}`,
          )
          return
        }
      }
    }

    // 💡 সাবমিট করার আগে ব্যান্ডউইথ সেভিং গার্ড চেক
    const hasChanges = checkIfDataChanged()
    if (!hasChanges) {
      alert(
        'No changes detected. Request cancelled to save server resources! 🛡️',
      )
      return
    }

    // ডাটা ফরম্যাট এবং পেলোড জেনারেশন
    const payload = formatVariantsForSync(variants)

    // ব্যাকএন্ড কন্ট্রোলারের রিকোয়ারমেন্ট অনুযায়ী variants এবং total_quantity পাঠানো হচ্ছে
    syncVariants(
      {
        slug: productSlug,
        variants: payload,
        total_quantity: variants.length === 0 ? Number(totalQuantity) : null,
      },
      {
        // 💡 মিউটেশন শেষ হলে (এরর আসলেও) ডাটাবেজের আসল ডাটা দিয়ে লোকাল স্টেট সাথে সাথে রিসেট হবে
        onError: () => {
          if (initialVariants) {
            setVariants(formatVariantsForSync(initialVariants))
          }
        },
      },
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
            <Package size={22} />
            <span>Product Variants & Stock Sync</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {variants.length === 0
              ? 'Currently operating as a Single Product (No variants).'
              : `Managing ${variants.length} active variants for this product.`}
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          <span>Add New Variant</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 💡 যখন কোনো ভ্যারিয়েন্ট থাকবে না: সিঙ্গেল প্রোডাক্ট ইনপুট ভিউ */}
        {variants.length === 0 && (
          <div className="p-6 border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-2xl space-y-4">
            <div className="flex items-start gap-2.5 text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Converting to Single Product Mode</p>
                <p className="text-blue-600/90">
                  Saving will delete all existing specific variants and options
                  from database, resetting this product back to a baseline
                  regular item.
                </p>
              </div>
            </div>

            <div className="max-w-xs">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                Total Available Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={totalQuantity}
                onChange={(e) => setTotalQuantity(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:border-blue-400 shadow-2xs transition-all"
                placeholder="Enter total product stock (e.g. 150)"
              />
            </div>
          </div>
        )}

        {/* 💡 যখন এক বা একাধিক ভ্যারিয়েন্ট থাকবে: ডাইনামিক লিস্ট ভিউ */}
        {variants.length > 0 &&
          variants.map((v, vIndex) => (
            <div
              key={
                v.product_variant_id
                  ? `db-${v.product_variant_id}`
                  : `new-${vIndex}`
              }
              className="p-4 border border-gray-200 bg-white rounded-xl relative shadow-2xs group hover:border-blue-200 transition-all animate-fadeIn"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-10">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    value={
                      v.options.find((o) => o.option_name === 'Color')
                        ?.option_value || ''
                    }
                    onChange={(e) =>
                      updateVariantOption(vIndex, 'Color', e.target.value)
                    }
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-300 focus:bg-white transition-all"
                    placeholder="e.g. Red"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    required
                    value={
                      v.options.find((o) => o.option_name === 'Size')
                        ?.option_value || ''
                    }
                    onChange={(e) =>
                      updateVariantOption(vIndex, 'Size', e.target.value)
                    }
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-300 focus:bg-white transition-all"
                    placeholder="e.g. XL"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Price Modifier ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price_modifier}
                    onChange={(e) =>
                      handleVariantFieldChange(
                        vIndex,
                        'price_modifier',
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-300 focus:bg-white transition-all"
                    placeholder="+ Price"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.quantity}
                    onChange={(e) =>
                      handleVariantFieldChange(
                        vIndex,
                        'quantity',
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-300 focus:bg-white transition-all"
                    placeholder="Stock"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeVariant(vIndex)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all duration-150"
              >
                <Trash2 size={18} />
              </button>

              {v.product_variant_id && (
                <span className="absolute -top-2 -left-1 bg-gray-100 text-[8px] text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-medium scale-90">
                  Synced
                </span>
              )}
            </div>
          ))}

        <div className="flex justify-end pt-4 border-t">
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
                <span>Save & Update Variants</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductVariantsForm
