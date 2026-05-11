import { useLocation, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react' // আইকন ইমপোর্ট করলাম

const OrderSuccess = () => {
  const location = useLocation()

  // আপনার ব্যাকএন্ড থেকে আসা payload অবজেক্টটা এখানে 'orderData' হিসেবে রিসিভ হচ্ছে
  const orderData = location.state?.orderData

  // যদি ডাটা না থাকে
  if (!orderData || !orderData.order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-xl font-bold text-gray-500">
          No order details found!
        </p>
        <Link to="/" className="mt-4 text-indigo-600 underline">
          Go Back to Shopping
        </Link>
      </div>
    )
  }

  // ক্লিন রাখার জন্য payload থেকে order এবং items আলাদা করে নিচ্ছি
  const { order, items } = orderData

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 text-center">
      <div className="mb-6 flex justify-center">
        {/* SVG এর বদলে এখন Lucide-এর আইকন */}
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-3xl font-black text-green-600 mb-2">
        Congratulations!
      </h1>
      <p className="text-gray-600 mb-8">
        Your order has been placed successfully.
      </p>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl text-left mb-8">
        <h2 className="font-black text-xl mb-4 border-b border-gray-50 pb-4 text-gray-900">
          Order Summary
        </h2>

        {/* মেইন অর্ডার ইনফো */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-600 uppercase tracking-widest text-[10px] font-bold">
              Order ID
            </p>
            <p className="font-bold text-gray-700">#{order.id}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase tracking-widest text-[10px] font-bold">
              Customer Name
            </p>
            <p className="font-bold text-gray-700">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase tracking-widest text-[10px] font-bold">
              Phone
            </p>
            <p className="font-bold text-gray-700">{order.customer_phone}</p>
          </div>
          <div>
            <p className="text-gray-600 uppercase tracking-widest text-[10px] font-bold">
              Payment Method
            </p>
            <p className="font-bold text-indigo-400">{order.payment_method}</p>
          </div>
        </div>

        {/* প্রোডাক্ট লিস্ট */}
        <div className="mt-6">
          <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold mb-3">
            Purchased Items
          </p>
          <div className="space-y-3">
            {items?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">
                    {item.product_name}
                  </span>
                  {item.variant_options.map((op, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{op.option_name}:</span>
                      <span className="text-gray-700">{op.option_value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <p className="font-black text-gray-700">
                    Price: ${item.price}
                  </p>
                  <p className="font-black text-gray-700">
                    Qty: {item.quantity}
                  </p>
                  <p className="font-black text-gray-700">
                    Subtotal: ${item.subtotal}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* টোটাল */}
        <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Total Paid</h3>
          <p className="text-3xl font-black text-indigo-600">
            ${Number(order.total).toFixed(2)}
          </p>
        </div>
      </div>

      <Link
        to="/"
        className="inline-block bg-gray-700 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
      >
        Continue Shopping
      </Link>
    </div>
  )
}

export default OrderSuccess
