import React from 'react';
import { X, ChefHat, Check, BellRing, Utensils, Clock, ReceiptText } from 'lucide-react';
import { getTheme, COMMON_STYLES, FONTS } from './theme';

export default function ActiveOrdersDrawer({ 
  isOpen, onClose, orders = [], onCompleteOrder, onCallCustomer, isDarkMode 
}) {
  if (!isOpen) return null;
  const theme = getTheme(isDarkMode);

  // Consistent with the 'Hot and Sour' card colors
  const UI_COLORS = {
    bg: '#000000',
    card: '#0a0a0a',
    accent: '#ffffff',
    muted: '#1a1a1a',
    textSecondary: '#a1a1aa'
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300" style={{ fontFamily: FONTS.sans }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full sm:w-[420px] h-full flex flex-col border-l border-white/10 shadow-2xl`} style={{ backgroundColor: UI_COLORS.bg }}>
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 text-white">
              <ChefHat size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white tracking-tight">Kitchen Queue</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {orders.length} PENDING TICKETS
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] opacity-20">
              <ReceiptText size={40} className="text-white mb-2" />
              <p className="text-sm font-medium text-white">No active orders</p>
            </div>
          ) : (
            orders.map((order) => (
              <div 
                key={order.id} 
                className="relative rounded-xl border border-white/5 bg-[#0a0a0a] overflow-hidden"
              >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-bold font-mono text-zinc-400">
                      {new Date(order.startedAt || order.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* TOKEN TAG - Consistent with 'soup' tag style */}
                  <div className="bg-[#1a1a1a] px-3 py-1 rounded-md border border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                      #{order.token}
                    </span>
                  </div>
                </div>

                {/* Items Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded border border-white/10 bg-white/5 text-[10px] font-bold text-white">
                              {item.quantity}
                            </div>
                            <span className="text-sm font-medium text-zinc-200 tracking-tight">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-2 flex items-center gap-3 opacity-40">
                        <div className="w-4 h-4 rounded-full border border-t-white animate-spin" />
                        <span className="text-[10px] text-white uppercase tracking-widest font-bold">Synchronizing...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons - White button style like 'Add' */}
                <div className="p-4 pt-0 flex gap-2">
                  <button 
                    onClick={() => onCallCustomer?.(order.token)} 
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    <BellRing size={14} /> Call
                  </button>
                  <button 
                    onClick={() => onCompleteOrder(order.id)} 
                    className="flex-[1.5] flex items-center justify-center gap-2 py-2 rounded-lg bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                  >
                    <Check size={16} strokeWidth={3} /> Done
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}