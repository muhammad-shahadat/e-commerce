import React, { useState, useEffect } from 'react'
import { Server, Save, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useUpdateSingleInventory } from '../../hooks/useProductMutations'

const InventoryForm = ({ productSlug, variants = [], images = [] }) => {
  const { mutate: updateInventory, isPending } = useUpdateSingleInventory()

  const [stockInputs, setStockInputs] = useState({})
  const [submittingId, setSubmittingId] = useState(null)

  useEffect(() => {
    if (variants && variants.length > 0) {
      const initialStocks = {}
      variants.forEach((v) => {
        initialStocks[v.product_variant_id] = v.stock_quantity ?? 0
      })
      setStockInputs(initialStocks)
    }
  }, [variants])

  const handleStockChange = (variantId, value) => {
    setStockInputs((prev) => ({
      ...prev,
      [variantId]: value,
    }))
  }

  const handleSingleSubmit = (e, variantId) => {
    e.preventDefault()
    const currentQty = stockInputs[variantId]

    if (currentQty === undefined || currentQty === null || currentQty === '') {
      toast.error('Stock cannot be empty!')
      return
    }

    if (Number(currentQty) < 0) {
      toast.error('Stock cannot be negative!')
      return
    }

    const originalVariant = variants.find(
      (v) => v.product_variant_id === variantId,
    )
    const originalQty = originalVariant
      ? (originalVariant.stock_quantity ?? 0)
      : 0

    if (Number(currentQty) === Number(originalQty)) {
      toast.error('No changes detected! 🛡️')
      return
    }

    setSubmittingId(variantId)

    updateInventory(
      {
        slug: productSlug,
        product_variant_id: variantId,
        stock_quantity: Number(currentQty),
      },
      {
        onSettled: () => {
          setSubmittingId(null)
        },
      },
    )
  }

  const isSingleProduct =
    variants.length === 1 &&
    (!variants[0].options || variants[0].options.length === 0)

  return (
    <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 space-y-4">
      {/* Header */}
      <div className="border-b pb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5 text-emerald-600">
          <Server size={18} />
          <span>Inventory Live Ledger</span>
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Quickly sync variant stocks with the core server.
        </p>
      </div>

      {/* 💡 সিঙ্গেল প্রোডাক্ট মোড ভিউ */}
      {/* Instead of IIFE = Immediately Invoked Function Expression, you can use separate componenet */}
      {isSingleProduct &&
        (() => {
          const singleVariant = variants[0]
          const isCurrentPending =
            isPending && submittingId === singleVariant.product_variant_id

          return (
            <form
              onSubmit={(e) =>
                handleSingleSubmit(e, singleVariant.product_variant_id)
              }
              className="p-3 border border-emerald-100 bg-emerald-50/10 rounded-xl flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Base Product
                </span>
                <p className="text-[11px] font-mono text-gray-500 mt-1 truncate">
                  SKU:{' '}
                  <span className="text-gray-700 font-semibold">
                    {singleVariant.final_sku || 'N/A'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min="0"
                  required
                  value={stockInputs[singleVariant.product_variant_id] ?? ''}
                  onChange={(e) =>
                    handleStockChange(
                      singleVariant.product_variant_id,
                      e.target.value,
                    )
                  }
                  className="w-16 p-1.5 bg-white border border-gray-200 rounded-lg outline-none text-xs font-semibold text-center focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all"
                  placeholder="0"
                />
                <button
                  type="submit"
                  disabled={isCurrentPending || isPending}
                  className="flex items-center justify-center bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700 transition-all disabled:bg-gray-300"
                  title="Update Stock"
                >
                  {isCurrentPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                </button>
              </div>
            </form>
          )
        })()}

      {/* 💡 মাল্টি-ভ্যারিয়েন্ট লিস্ট ভিউ (টেবিল এর বদলে ফ্লুইড রো) */}
      {!isSingleProduct && variants.length > 0 && (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 subtle-scrollbar">
          {variants.map((v) => {
            const isCurrentPending =
              isPending && submittingId === v.product_variant_id
            const colorVal =
              v.options?.find((o) => o.option_name === 'Color')?.option_value ||
              'N/A'
            const sizeVal =
              v.options?.find((o) => o.option_name === 'Size')?.option_value ||
              'N/A'

            return (
              <div
                key={v.product_variant_id}
                className="p-2.5 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-all flex items-center justify-between gap-3"
              >
                {/* Left Side: Attributes & SKU */}
                <div className="min-w-0 flex-1 space-y-1">
                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-100">
                      {colorVal}
                    </span>
                    <span className="bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-100">
                      {sizeVal}
                    </span>
                  </div>
                  {/* SKU Area with Word Wrap and breaking capability */}
                  <p className="font-mono text-[10px] text-gray-500 bg-white/80 px-1 py-0.5 rounded border border-gray-100 break-all leading-tight">
                    {v.final_sku}
                  </p>
                </div>

                {/* Right Side: Stock Input & Action Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 font-medium mb-0.5">
                      Stock
                    </span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stockInputs[v.product_variant_id] ?? ''}
                      onChange={(e) =>
                        handleStockChange(v.product_variant_id, e.target.value)
                      }
                      className="w-16 p-1 bg-white border border-gray-200 rounded-md outline-none text-center text-xs font-semibold focus:border-emerald-400 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleSingleSubmit(e, v.product_variant_id)}
                    disabled={isCurrentPending || isPending}
                    className="self-end mb-0.5 inline-flex items-center justify-center p-1.5 bg-gray-600 text-white hover:bg-emerald-600 rounded-md shadow-xs transition-all disabled:bg-gray-300"
                    title="Update Stock"
                  >
                    {isCurrentPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Save size={13} />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Failsafe */}
      {!isPending && variants.length === 0 && (
        <div className="p-3 border border-dashed border-gray-200 rounded-xl flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50/50 justify-center">
          <AlertCircle size={12} />
          <span>No system variants loaded.</span>
        </div>
      )}
    </div>
  )
}

export default InventoryForm
