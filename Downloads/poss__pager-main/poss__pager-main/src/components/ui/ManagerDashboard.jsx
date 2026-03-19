import React, { useEffect, useState } from "react";
import { getTheme, COMMON_STYLES } from "./theme";
import { TrendingUp, AlertTriangle, ShoppingCart, Package, Info } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ManagerDashboard({ apiRequest, isDarkMode, settings }) {
  const theme = getTheme(isDarkMode);

  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use dynamic setting from props, fallback to 20
  const KITCHEN_CAPACITY = settings?.kitchenCapacity || 20;

  const fetchDashboard = async () => {
    try {
      const [s, l, t, a] = await Promise.all([
        apiRequest(`${API_URL}/dashboard/summary`),
        apiRequest(`${API_URL}/dashboard/low-stock`),
        apiRequest(`${API_URL}/dashboard/top-products`),
        apiRequest(`${API_URL}/dashboard/active-orders`)
      ]);

      if (s.ok) setSummary(await s.json());
      if (l.ok) setLowStock(await l.json());
      if (t.ok) setTopProducts(await t.json());
      if (a.ok) setActiveOrders(await a.json());
      
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // ✅ FILTER: Only count orders that are truly 'active'
  const trueActiveOrders = activeOrders.filter(
    (o) => (o.status || "").toLowerCase() === "active"
  );

  const kitchenLoad = Math.min(trueActiveOrders.length / KITCHEN_CAPACITY, 1);

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm opacity-60">Synchronizing dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 flex items-center gap-4 border-l-4 border-l-green-500`}>
          <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
            <TrendingUp size={24}/>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60">Today's Revenue</p>
            <h2 className="text-2xl font-semibold font-mono">₹{summary?.today_revenue || 0}</h2>
          </div>
        </div>

        {/* Total Orders */}
        <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 flex items-center gap-4 border-l-4 border-l-blue-500`}>
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
            <ShoppingCart size={24}/>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60">Total Orders Today</p>
            <h2 className="text-2xl font-semibold">{summary?.today_orders || 0}</h2>
          </div>
        </div>

        {/* True Active Orders */}
        <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 flex items-center gap-4 border-l-4 border-l-orange-500`}>
          <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
            <Package size={24}/>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-60">Current Active Load</p>
            <h2 className="text-2xl font-semibold">{trueActiveOrders.length}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KITCHEN LOAD MONITOR */}
        <div className={`${COMMON_STYLES.card(isDarkMode)} p-6`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold">Live Kitchen Load</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              kitchenLoad > 0.8 ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
            }`}>
              {kitchenLoad > 0.8 ? "Critical" : "Stable"}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm opacity-70">
              <span>Capacity Utilization</span>
              <span className="font-mono font-bold">
                {trueActiveOrders.length} / {KITCHEN_CAPACITY}
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-zinc-800/50 overflow-hidden border border-zinc-700">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  kitchenLoad < 0.5 ? "bg-green-500" : kitchenLoad < 0.8 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${kitchenLoad * 100}%` }}
              />
            </div>
            <p className="text-[11px] opacity-50 flex items-center gap-1">
              <Info size={12} /> Real-time tracking of orders currently in preparation.
            </p>
          </div>
        </div>

        {/* INVENTORY ALERTS */}
        <div className={`${COMMON_STYLES.card(isDarkMode)} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-orange-400"/>
            <h3 className="text-lg font-semibold">Critical Stock Alerts</h3>
          </div>

          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-2">
            {lowStock.length === 0 ? (
              <p className="text-sm opacity-40 italic py-4">Inventory levels are healthy.</p>
            ) : (
              lowStock.map(i => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                  <div>
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-[10px] opacity-50 uppercase">Min: {i.min_stock}</p>
                  </div>
                  <span className="font-mono text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">
                    {i.current_stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE ORDERS REAL-TIME LIST */}
      <div className={`${COMMON_STYLES.card(isDarkMode)} overflow-hidden`}>
        <div className="p-6 border-b border-zinc-800/50 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Active Tokens in Kitchen</h3>
          <div className="flex items-center gap-2 text-xs opacity-50">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            Live Updates
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${theme.bg.subtle} text-[10px] uppercase tracking-wider opacity-60`}>
              <tr>
                <th className="p-4 text-left font-bold">Token #</th>
                <th className="p-4 text-left font-bold">Amount</th>
                <th className="p-4 text-left font-bold">Status</th>
                <th className="p-4 text-right font-bold">Order Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {trueActiveOrders.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center opacity-40 italic">No orders currently being prepared.</td>
                </tr>
              ) : (
                trueActiveOrders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-lg text-blue-400">{o.token}</td>
                    <td className="p-4 font-mono">₹{o.total_amount}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-[10px] rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right opacity-50 text-xs">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS */}
      <div className={`${COMMON_STYLES.card(isDarkMode)} p-6`}>
        <h3 className="text-lg font-semibold mb-5">Product Performance (Today)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topProducts.slice(0, 4).map((p, index) => (
            <div key={p.product_id} className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold opacity-30 mb-1">Rank #{index + 1}</span>
              <p className="font-semibold text-sm mb-2">{p.name}</p>
              <div className="text-xl font-bold text-green-400">{p.total_sold} <span className="text-[10px] opacity-50">Units</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}