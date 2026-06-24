// src/components/account/OrderHistory.jsx - PINK THEME ✅
import { useState } from 'react';
import { Calendar, Package, ChevronDown, ChevronUp, Eye, Sparkles } from 'lucide-react';

export function OrderHistory({ orders }) {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-pink-50/30 to-rose-50/30 rounded-xl border border-pink-100">
        <div className="relative inline-block">
          <Package size={64} className="mx-auto text-pink-300 mb-4" />
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-pink-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-serif text-gray-700">No <span className="text-pink-gradient">Orders</span> Yet</h3>
        <p className="text-gray-500 mt-2">Start shopping to see your order history here.</p>
        <button 
          className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-pink-lg"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // Status color mapping
  const statusColors = {
    delivered: 'bg-green-100 text-green-700 border-green-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-serif text-gray-900">Order <span className="text-pink-gradient">History</span></h2>
      </div>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="border border-pink-100 rounded-xl overflow-hidden hover:border-pink-200 transition-all duration-300">
            {/* Order Header */}
            <div 
              className="flex flex-wrap items-center justify-between p-4 bg-gradient-to-r from-pink-50/50 to-rose-50/50 hover:from-pink-100/50 hover:to-rose-100/50 cursor-pointer transition-all duration-300"
              onClick={() => toggleOrder(order._id)}
            >
              <div>
                <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-pink-400" />
                    {new Date(order.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {order.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">₹{order.total.toFixed(2)}</span>
                {expandedOrder === order._id ? 
                  <ChevronUp size={20} className="text-pink-500" /> : 
                  <ChevronDown size={20} className="text-pink-400" />
                }
              </div>
            </div>

            {/* Order Details (Expandable) */}
            {expandedOrder === order._id && (
              <div className="p-4 border-t border-pink-100 bg-white">
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-pink-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.image || '/placeholder-product.jpg'} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-pink-100"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-pink-100 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">₹{order.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">₹{order.shipping?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-pink-100">
                      <span>Total</span>
                      <span className="text-pink-gradient">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="border-t border-pink-100 pt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600 bg-pink-50/50 p-3 rounded-lg">
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}