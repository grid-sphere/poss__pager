import React from 'react';

export default function OrderDetailsModal({ order, onClose, onComplete, isDarkMode }) {
  if (!order) return null;

  // FIX: Force numeric calculation for the display
  const total = order.items.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className={`w-full max-w-sm rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-100'} p-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Token {order.token}
              <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded uppercase">#{order.displayId}</span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">🕒 Preparing 3:11</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl">&times;</button>
        </div>

        <div className="border-y border-slate-800/50 py-4 my-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm">
              <span>{item.name} <span className="text-slate-500 text-xs">x{item.quantity}</span></span>
              <span className="font-semibold">₹{Number(item.price) * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* THE FIX: Ensure total is not blank */}
        <div className="flex justify-between items-center font-bold text-lg mb-6">
          <span>Total Bill</span>
          <span>₹{total.toFixed(0)}</span>
        </div>

        <button 
          onClick={() => onComplete(order.id)}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all active:scale-95"
        >
          ✓ Mark Ready
        </button>

        <button onClick={onClose} className="w-full mt-4 text-slate-500 text-xs hover:underline">
          Close Details
        </button>
      </div>
    </div>
  );
}