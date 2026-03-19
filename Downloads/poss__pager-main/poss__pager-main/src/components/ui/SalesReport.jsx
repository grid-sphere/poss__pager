import React, { useMemo } from 'react';
import { Calendar, Clock, Info, Inbox, Loader2 } from 'lucide-react';
import { getTheme, COMMON_STYLES, FONTS } from './theme';

export default function SalesReport({
  history = [],
  reportDate,
  setReportDate,
  isDarkMode,
  isHistoryLoading, // Passed from parent
}) {
  const theme = getTheme(isDarkMode);

  // ✅ Process chart data using safe string splitting
  const chartData = useMemo(() => {
    const hours = Array(24).fill(0);
    const ordersArray = Array.isArray(history) ? history.filter(o => {
        // Match only the date portion (YYYY-MM-DD)
        return o.created_at.split('T')[0] === reportDate;
    }) : [];

    ordersArray.forEach(o => {
      let dateStr = o.created_at;
      if (!dateStr.includes('Z') && !dateStr.includes('+')) dateStr += 'Z';
      const dateObj = new Date(dateStr);
      if (!isNaN(dateObj.getTime())) {
        const h = dateObj.getHours();
        hours[h] += parseFloat(o.total_amount || 0);
      }
    });
    return hours;
  }, [history, reportDate]);

  const hasOrders = useMemo(() => chartData.some(val => val > 0), [chartData]);
  const maxSales = useMemo(() => {
    const high = Math.max(...chartData);
    return high > 0 ? high : 100;
  }, [chartData]);

  return (
    <div className="flex flex-col h-full antialiased" style={{ fontFamily: FONTS.sans }}>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm opacity-50">Activity Overview</p>
        </div>
        <div className="flex gap-3">
          <div className="relative h-10 w-48 group"> 
            <div className={`absolute inset-0 flex items-center gap-3 px-4 py-2 rounded-lg border ${COMMON_STYLES.card(isDarkMode)} border-zinc-800 group-hover:border-blue-500/50 transition-colors pointer-events-none z-10`}>
              <Calendar size={18} className="text-blue-400" />
              <span className="text-sm font-mono font-bold">{reportDate}</span>
            </div>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
          </div>
        </div>
      </div>

      {/* GRAPH CONTAINER */}
      <div className={`rounded-2xl border p-8 ${COMMON_STYLES.card(isDarkMode)} border-zinc-800 shadow-2xl min-h-[400px] flex flex-col relative overflow-hidden`}>
        
        {/* ✅ LOADING OVERLAY (Fixed: No more infinite spinner) */}
        {isHistoryLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-sm font-medium text-blue-400">Synchronizing data...</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-10">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock size={18} className="text-blue-500" /> Hourly Sales ({reportDate})
          </h2>
        </div>
        
        {!hasOrders && !isHistoryLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 space-y-4">
            <Inbox size={64} strokeWidth={1} />
            <p className="text-xl font-semibold">No orders placed</p>
          </div>
        ) : (
          <div className="h-56 flex gap-2 items-end px-2 border-b border-zinc-800/50 pb-2">
            {chartData.map((val, h) => {
              const heightPercentage = (val / maxSales) * 100;
              return (
                <div key={h} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {val > 0 && (
                    <div className="absolute -top-12 bg-zinc-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-40 border border-zinc-700 shadow-2xl">
                      <div className="font-bold text-blue-400">₹{val}</div>
                      <div className="text-[8px] opacity-50">{h}:00</div>
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-sm transition-all duration-700 ease-out ${
                      val > 0 ? 'bg-blue-500 border-t border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-zinc-800/10'
                    }`}
                    style={{ height: val > 0 ? `${Math.max(heightPercentage, 10)}%` : '2px' }}
                  />
                  <span className={`text-[9px] mt-3 font-mono ${val > 0 ? 'text-blue-400 font-bold' : 'opacity-20'}`}>
                    {h.toString().padStart(2, '0')}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-6 flex items-center gap-2 text-[11px] opacity-40 italic">
          <Info size={12} /> Data reflects local browser time (IST).
        </div>
      </div>
    </div>
  );
}