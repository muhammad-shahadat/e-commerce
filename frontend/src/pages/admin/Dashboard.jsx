import React, { useState } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Layers,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Award,
  Loader2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import {
  useGetDashboardStats,
  useGetDashboardCharts,
  useGetLowStockWidget,
} from '../../hooks/useDashboardQueries'

// পাই চার্টের স্ট্যাটাস কালার কনস্ট্যান্ট
const STATUS_COLORS = {
  completed: '#10B981',
  paid: '#10E082EF',
  pending: '#F59E0B',
  shipped: '#3B82F6',
  cancelled: '#EF4444',
}
const DEFAULT_PIE_COLOR = '#6B7280'

const DashboardOverview = () => {
  // ── লো-স্টক উইজেটের ডাইনামিক ফিল্টার স্টেট ──
  const [lowStockPage, setLowStockPage] = useState(1)
  const [lowStockSearch, setLowStockSearch] = useState('')

  // ── কাস্টম হুক থেকে ক্লিন ডাটা ফেচিং ──
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats()
  const { data: charts, isLoading: chartsLoading } = useGetDashboardCharts()

  // হুকে স্টেট অবজেক্ট পাস (উইজেটের স্ট্যান্ডার্ড সাইজের জন্য লিমিট ৫ ফিক্সড)
  const { data: lowStockData, isLoading: lowStockLoading } =
    useGetLowStockWidget({
      page: lowStockPage,
      limit: 5,
      threshold: 5,
      search: lowStockSearch,
    })

  const isLoading = statsLoading || chartsLoading || lowStockLoading

  // গ্লোবাল লোডিং স্টেট
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    )
  }

  // ডাটা স্ট্রাকচার এক্সট্রাক্ট এবং ফলব্যাক ডিফাইন
  const salesTrend = charts?.salesTrend || []
  const orderStatusDistribution = charts?.orderStatusDistribution || []
  const topSellingProducts = charts?.topSellingProducts || []
  const categoryDistribution = charts?.categoryDistribution || []

  const lowStockProducts = lowStockData?.products || []
  const pagination = lowStockData?.pagination || {}

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-400/20">
            E-COMMERCE Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-200">
              Rakib Islam
            </span>{' '}
            👋
          </h1>
          <p className="text-slate-400 text-sm max-w-md">
            Here is what&apos;s happening with your store operations today.
            Review sales analytics and inventory statuses.
          </p>
        </div>

        <a
          href={`${import.meta.env.VITE_CUSTOMER_SITE_URL || 'http://localhost:5173/'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="z-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl transition-all shadow-lg active:scale-95 text-sm whitespace-nowrap group cursor-pointer"
        >
          <span>Visit Customer Site</span>
          <ExternalLink
            size={16}
            className="text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </a>

        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      </div>

      {/* ─── TOP STATISTICS CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign size={24} strokeWidth={2.5} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              {(stats?.totalOrders || 0).toLocaleString()}
            </h3>
          </div>
          <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Products
            </p>
            <h3 className="text-2xl font-black text-gray-800">
              {stats?.totalProducts || 0}
            </h3>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
            <Layers size={24} />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          className={`bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
            (stats?.lowStockProducts || 0) > 0
              ? 'border-amber-200 bg-amber-50/20'
              : 'border-gray-100'
          }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Low Stock Variants
            </p>
            <h3
              className={`text-2xl font-black ${
                (stats?.lowStockProducts || 0) > 0
                  ? 'text-amber-600'
                  : 'text-gray-800'
              }`}
            >
              {stats?.lowStockProducts || 0}
            </h3>
          </div>
          <div
            className={`p-3.5 rounded-xl ${
              (stats?.lowStockProducts || 0) > 0
                ? 'bg-amber-100 text-amber-600'
                : 'bg-gray-50 text-gray-400'
            }`}
          >
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* ─── CHARTS SECTION ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend (Area Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-indigo-600" size={20} />
            <h4 className="text-base font-bold text-gray-800">
              Sales Analytics (Last 7 Days)
            </h4>
          </div>
          <div className="h-72 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                  }}
                  formatter={(value, name) => [
                    name === 'totalSales' ? `$${value}` : value,
                    name === 'totalSales' ? 'Sales' : 'Orders',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesColor)"
                  name="totalSales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status (Pie Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h4 className="text-base font-bold text-gray-800 mb-6">
            Order Status Matrix
          </h4>
          <div className="h-64 w-full flex items-center justify-center text-xs">
            {orderStatusDistribution.length === 0 ? (
              <p className="text-gray-400">No order status data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="totalOrders"
                    nameKey="status"
                  >
                    {orderStatusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.status.toLowerCase()] ||
                          DEFAULT_PIE_COLOR
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} Orders`, 'Volume']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Distribution (Bar Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-3 flex flex-col">
          <h4 className="text-base font-bold text-gray-800 mb-6">
            Inventory Volume per Category
          </h4>
          <div className="h-64 w-full text-xs font-medium">
            {categoryDistribution.length === 0 ? (
              <p className="text-gray-400">No category allocation available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F3F4F6"
                    vertical={false}
                  />
                  <XAxis dataKey="categoryName" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                    }}
                  />
                  <Bar
                    dataKey="totalProducts"
                    fill="#6366F1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                    name="Total Products"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ─── REAL-TIME TABLES / WIDGETS ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Top Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <Award className="text-amber-500" size={20} />
            <h4 className="text-base font-bold text-gray-800">
              Top Performing Products
            </h4>
          </div>
          <div className="divide-y divide-gray-50 flex-1 flex flex-col justify-center">
            {topSellingProducts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">
                No performance scale metrics yet
              </p>
            ) : (
              topSellingProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        product.main_image || 'https://via.placeholder.com/150'
                      }
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100 bg-gray-50"
                    />
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 max-w-[180px] truncate sm:max-w-xs">
                        {product.title}
                      </h5>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Slug: {product.slug.split('-').pop()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 whitespace-nowrap">
                      {product.sold_count} Sold
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Urgent Dynamic Low Stock Restock Panel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between xl:col-span-2">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className="text-rose-500 flex-shrink-0"
                  size={20}
                />
                <h4 className="text-base font-bold text-gray-800">
                  Critical Restock Radar
                </h4>
              </div>

              {/* রিয়েল-টাইম সার্চ ইনপুট */}
              <input
                type="text"
                placeholder="Search SKU or Title..."
                value={lowStockSearch}
                onChange={(e) => {
                  setLowStockSearch(e.target.value)
                  setLowStockPage(1)
                }}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 max-w-xs transition-all"
              />
            </div>

            {/* এক্স-অ্যাক্সিস স্ক্রল এবং টেবিল কন্টেইনার */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              {lowStockProducts.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10">
                  {lowStockSearch
                    ? 'No matching low-stock items found.'
                    : 'All variants are perfectly stocked.'}
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4 font-bold">Product Info</th>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Attributes</th>
                      <th className="py-3.5 px-4 font-bold">Price</th>
                      <th className="py-3.5 px-4 font-bold">Discount</th>
                      <th className="py-3.5 px-4 text-center font-bold">
                        Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm bg-white">
                    {lowStockProducts.map((prod) => {
                      const finalPrice =
                        Number(prod.base_price) + Number(prod.price_modifier)
                      const discount = Number(prod.discount_percent)

                      return (
                        <tr
                          key={prod.variant_id}
                          className="group hover:bg-gray-50/70 transition-colors"
                        >
                          {/* ১. প্রোডাক্ট ইনফো: শুধু ইমেজ এবং ফুল আনকাট টাইটেল */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  prod.main_image_url ||
                                  'https://via.placeholder.com/150'
                                }
                                alt={prod.product_title}
                                className="w-11 h-11 object-cover rounded-xl border border-gray-200 bg-gray-50 flex-shrink-0"
                              />
                              <div className="flex justify-center flex-col gap-1.5">
                                <span className="font-bold text-gray-800 text-sm min-w-[150px]">
                                  {prod.product_title}
                                </span>
                                <span className="bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-md text-[12px]">
                                  {prod.variant_sku}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ৩. ক্যাটাগরি কলাম */}
                          <td className="py-3.5 px-4 text-gray-600 font-medium">
                            {prod.category_name}
                          </td>

                          {/* ৪. অ্যাট্রিবিউটস কলাম */}
                          <td className="py-3.5 px-4">
                            {prod.variant_options &&
                            prod.variant_options.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                {prod.variant_options.map((opt, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200/30"
                                  >
                                    {opt.option_name}:{' '}
                                    <span className="text-slate-900 font-bold ml-1">
                                      {opt.option_value}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 font-mono">
                                —
                              </span>
                            )}
                          </td>

                          {/* ৫. প্রাইস কলাম */}
                          <td className="py-3.5 px-4 font-bold text-gray-800 font-mono">
                            ${finalPrice.toFixed(2)}
                          </td>

                          {/* ৬. ডিসকাউন্ট কলাম */}
                          <td className="py-3.5 px-4">
                            {discount > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {discount}% OFF
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 font-mono">
                                —
                              </span>
                            )}
                          </td>

                          {/* ৭. রিমেইনিং কোয়ান্টিটি কলাম */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black font-mono min-w-[90px] ${
                                prod.quantity === 0
                                  ? 'bg-rose-100 text-rose-600 animate-pulse'
                                  : prod.quantity <= 5
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {prod.quantity === 0
                                ? 'Out of Stock'
                                : `${prod.quantity} Pcs`}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Dynamic Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs font-semibold text-gray-500">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPrevious}
                  onClick={() => setLowStockPage((prev) => prev - 1)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setLowStockPage((prev) => prev + 1)}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
