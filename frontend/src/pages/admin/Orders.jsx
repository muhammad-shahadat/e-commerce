import React, { useEffect, useState } from 'react'
import {
  Search,
  Eye,
  Printer,
  Loader2,
  ShoppingBag,
  Mail,
  Phone,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

import { useGetOrders, useGetOrder } from '../../hooks/useOrderQueries'
import { useUpdateOrderStatus } from '../../hooks/useOrderMutations'
import InvoicePrint from '../../components/admin/InvoicePrint'

// স্ট্যাটাস কালার স্কিম ম্যাপিং (UI/UX এনহ্যান্সমেন্ট)
const STATUS_STYLES = {
  pending: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
  },
  paid: { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  shipped: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Truck,
  },
  completed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
}

const Order = () => {
  // এপিআই স্টেট ফিল্টারসমূহ
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // মডাল এবং ডিটেইল ফেচিং স্টেট
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // TanStack Query Hooks Execution
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching,
  } = useGetOrders({
    page,
    status: statusFilter || null,
    search: debouncedSearch || null,
    limit: 10,
  })

  const { data: activeOrderData, isLoading: isActiveOrderLoading } =
    useGetOrder(selectedOrderId)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus()

  const orders = listData?.orders || []
  const pagination = listData?.pagination || {}

  // সিঙ্গেল অর্ডার ভিউ ও মডাল ট্রিগার
  const handleOpenDetails = (id) => {
    setSelectedOrderId(id)
    setIsModalOpen(true)
  }

  // সরাসরি ইনভয়েস প্রিন্ট করার ফাংশন
  const handleTriggerPrint = () => {
    window.print()
  }

  // ডেবউন্স লজিক: searchQuery চেঞ্জ হলে ৫০০ms অপেক্ষা করবে
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // সার্চ চেঞ্জ হলে পেজ ১ এ নিয়ে যাবে
    }, 700) // 700 মিলিমেকেন্ড (আধা সেকেন্ড)

    // ইউজার আবার টাইপ করা শুরু করলে আগের টাইমারটা ক্লিয়ার হয়ে যাবে
    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen print:bg-white print:p-0">
      {/* Printable Area Wrapper */}
      {activeOrderData && (
        <div className="print-invoice-area">
          <InvoicePrint
            order={activeOrderData.order}
            items={activeOrderData.items}
          />
        </div>
      )}

      {/* Non-Printable Main Dashboard View */}
      <div className="print:hidden">
        {/* Page Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="text-blue-600" size={26} /> Order
              Management
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Track customer entries, billing, invoices, and process shipping
              cycles
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-3.5 top-3 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Customer name, email, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl outline-none text-sm focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {['', 'pending', 'paid', 'shipped', 'completed', 'cancelled'].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st)
                    setPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border capitalize transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {st === '' ? 'All Orders' : st}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Orders Table Platform */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Preview</th>
                  <th className="py-4 px-4">Order ID / Date</th>
                  <th className="py-4 px-4">Customer Details</th>
                  <th className="py-4 px-4 text-center">Items</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {isListLoading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <Loader2
                        className="animate-spin text-blue-500 mx-auto"
                        size={32}
                      />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-20 text-center text-gray-400 text-xs"
                    >
                      No matching orders data available right now.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const StatusIcon =
                      STATUS_STYLES[order.status]?.icon || AlertCircle
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-5">
                          <img
                            src={order.preview_image}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-100 shadow-2xs"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-blue-600 block">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-0.5">
                            {new Date(order.created_at).toLocaleDateString(
                              undefined,
                              { dateStyle: 'medium' },
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">
                            {order.customer_name}
                          </span>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {order.customer_phone}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-gray-800">
                          {order.total_quantity}{' '}
                          <span className="text-xs text-gray-400 font-normal">
                            pcs
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900 block">
                            ${parseFloat(order.total).toFixed(2)}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block">
                            {order.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`mx-auto flex items-center justify-center gap-1.5 px-2.5 py-1 text-xs font-bold border rounded-full w-28 capitalize ${STATUS_STYLES[order.status]?.bg}`}
                          >
                            <StatusIcon size={14} />
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenDetails(order.id)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer rounded-lg transition-all"
                              title="View and Edit Order"
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Deck */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>
                Showing Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || isFetching}
                  className="px-3 py-1.5 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pagination.totalPages || isFetching}
                  className="px-3 py-1.5 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE COMPREHENSIVE MODAL FOR ORDER DETAILS & ACTIONS */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-end animate-fade-in print:hidden">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl p-6 relative animate-in slide-in-from-right duration-200">
            {/* Modal Top Controls */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Details{' '}
                  {activeOrderData && (
                    <span className="font-mono text-blue-600">
                      #{activeOrderData.order.id.slice(0, 8)}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Change shipping cycles and print official buyer logs
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedOrderId(null)
                }}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Core Body Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {isActiveOrderLoading ? (
                <div className="py-20 text-center">
                  <Loader2
                    className="animate-spin text-blue-500 mx-auto"
                    size={28}
                  />
                </div>
              ) : !activeOrderData ? (
                <p className="text-center text-xs text-red-500">
                  Failed to stream target order profile.
                </p>
              ) : (
                <>
                  {/* Status Processing Control Block */}
                  <div className="p-4 bg-slate-50 border rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Process Cycle Stage
                      </label>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize border ${STATUS_STYLES[activeOrderData.order.status]?.bg}`}
                        >
                          {activeOrderData.order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={activeOrderData.order.status}
                        disabled={
                          activeOrderData.order.status === 'completed' ||
                          isUpdating
                        }
                        onChange={(e) => {
                          updateStatus({
                            id: activeOrderData.order.id,
                            status: e.target.value,
                          })
                        }}
                        className="p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <button
                        onClick={handleTriggerPrint}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer rounded-lg font-medium flex items-center justify-center gap-1 text-xs transition-all shadow-xs"
                      >
                        <Printer size={15} /> <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Core Grid Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border p-3 rounded-xl bg-white space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">
                        Buyer Details
                      </h4>
                      <p className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                        <ShoppingBag size={14} className="text-gray-400" />{' '}
                        {activeOrderData.order.customer_name}
                      </p>
                      <p className="text-xs flex items-center gap-2 text-gray-500">
                        <Mail size={14} className="text-gray-400" />{' '}
                        {activeOrderData.order.customer_email}
                      </p>
                      <p className="text-xs flex items-center gap-2 text-gray-500">
                        <Phone size={14} className="text-gray-400" />{' '}
                        {activeOrderData.order.customer_phone}
                      </p>
                    </div>

                    <div className="border p-3 rounded-xl bg-white space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b pb-1">
                        Logistics Info
                      </h4>
                      <p className="text-xs flex items-center gap-2 text-gray-500">
                        <Calendar size={14} className="text-gray-400" />{' '}
                        Created:{' '}
                        {new Date(
                          activeOrderData.order.created_at,
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs font-semibold text-gray-700 mt-1">
                        Shipping Target Destination:
                      </p>
                      <p className="text-xs text-gray-500 leading-normal">
                        {activeOrderData.order.shipping_address_line1},{' '}
                        {activeOrderData.order.shipping_city} -{' '}
                        {activeOrderData.order.shipping_postal_code},{' '}
                        {activeOrderData.order.shipping_country}
                      </p>
                    </div>
                  </div>

                  {/* Order Line Items List Stack */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Line Items Ordered ({activeOrderData.order.total_items})
                    </h4>
                    <div className="divide-y border rounded-xl overflow-hidden bg-white">
                      {activeOrderData.items?.map((item) => (
                        <div
                          key={item.item_id}
                          className="p-3 flex gap-3 items-center hover:bg-gray-50/50 transition-all"
                        >
                          <img
                            src={item.main_image}
                            alt=""
                            className="w-14 h-14 object-cover border rounded-lg bg-gray-50"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-semibold text-gray-900 truncate">
                              {item.product_title}
                            </h5>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              SKU: {item.final_sku}
                            </p>
                            <div className="flex gap-1.5 mt-1">
                              {item.variant_options?.map((opt) => (
                                <span
                                  key={opt.option_name}
                                  className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-medium"
                                >
                                  {opt.option_name}: {opt.option_value}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right whitespace-nowrap pl-2">
                            <span className="text-xs font-bold text-gray-900 block">
                              ${parseFloat(item.subtotal).toFixed(2)}
                            </span>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              ${parseFloat(item.price).toFixed(2)} x{' '}
                              {item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Sheet Breakdown Calculation */}
                  <div className="bg-gray-50 p-4 border rounded-xl flex justify-end">
                    <div className="w-64 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Items Subtotal:</span>
                        <span>
                          $
                          {(
                            parseFloat(activeOrderData.order.total) -
                            parseFloat(activeOrderData.order.shipping_charge)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Shipping Cost:</span>
                        <span>
                          $
                          {parseFloat(
                            activeOrderData.order.shipping_charge,
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-900 border-t pt-2">
                        <span>Charged Grand Total:</span>
                        <span>
                          ${parseFloat(activeOrderData.order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Order
