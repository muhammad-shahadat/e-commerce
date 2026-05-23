import React from 'react'

const InvoicePrint = ({ order, items }) => {
  if (!order) return null

  return (
    <div className="hidden print:block p-8 bg-white text-black text-sm uppercase-none leading-relaxed">
      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            AISORIX
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Premium E-Commerce Platform
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-xs text-gray-500 mt-1">
            Order ID: #{order.id.slice(0, 8)}
          </p>
          <p className="text-xs text-gray-500">
            Date: {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Customer & Billing Info */}
      <div className="grid grid-cols-2 gap-6 mb-8 text-xs">
        <div className="p-4 bg-gray-50 rounded-xl border">
          <h3 className="font-bold text-gray-700 mb-2">Merchant Details:</h3>
          <p className="font-semibold">Aisorix Tech Ltd.</p>
          <p className="text-gray-500">Dhaka, Bangladesh</p>
          <p className="text-gray-500">support@aisorix.com</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border">
          <h3 className="font-bold text-gray-700 mb-2">Billing To:</h3>
          <p className="font-semibold">{order.customer_name}</p>
          <p className="text-gray-500">{order.customer_phone}</p>
          <p className="text-gray-500">{order.customer_email}</p>
          <p className="text-gray-500 mt-1">
            {order.shipping_address_line1}, {order.shipping_city}-
            {order.shipping_postal_code}, {order.shipping_country}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border-collapse mb-8 text-xs">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-100">
            <th className="py-3 px-2 font-bold">Product / Variant</th>
            <th className="py-3 px-2 font-bold">SKU</th>
            <th className="py-3 px-2 text-right font-bold">Price</th>
            <th className="py-3 px-2 text-center font-bold">Qty</th>
            <th className="py-3 px-2 text-right font-bold">Total</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => (
            <tr key={item.item_id} className="border-b border-gray-200">
              <td className="py-3 px-2">
                <span className="font-medium text-gray-900">
                  {item.product_title}
                </span>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {item.variant_options
                    ?.map((opt) => `${opt.option_name}: ${opt.option_value}`)
                    .join(' | ')}
                </div>
              </td>
              <td className="py-3 px-2 font-mono text-gray-600">
                {item.final_sku}
              </td>
              <td className="py-3 px-2 text-right">
                ${parseFloat(item.price).toFixed(2)}
              </td>
              <td className="py-3 px-2 text-center">{item.quantity}</td>
              <td className="py-3 px-2 text-right font-semibold">
                ${parseFloat(item.subtotal).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Breakdown */}
      <div className="flex justify-end text-xs">
        <div className="w-64 space-y-2 border-t pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>
              $
              {(
                parseFloat(order.total) - parseFloat(order.shipping_charge)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping Charge:</span>
            <span>${parseFloat(order.shipping_charge).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-2">
            <span>Grand Total:</span>
            <span>${parseFloat(order.total).toFixed(2)}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed text-center text-[10px] text-gray-400">
            Payment Method:{' '}
            <span className="font-bold text-gray-700">
              {order.payment_method}
            </span>
            <p className="mt-1">Thank you for shopping with us!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoicePrint
