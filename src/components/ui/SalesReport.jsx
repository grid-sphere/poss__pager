import React, { useMemo } from 'react';
import { Calendar, Download, TrendingUp, Banknote, Smartphone, Wallet } from 'lucide-react';
import { getTheme, COMMON_STYLES, FONTS } from './theme';

export default function SalesReport({
  history = [],
  reportDate,
  setReportDate,
  isDarkMode
}) {
  const theme = getTheme(isDarkMode);

  // ---------------- FILTER (BACKEND IS SOURCE OF TRUTH) ----------------
  const filteredOrders = useMemo(() => {
    return history
      .filter(o => {
        const d = new Date(o.created_at);
        return (
          !isNaN(d.getTime()) &&
          d.toLocaleDateString('en-CA') === reportDate
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [history, reportDate]);

  // ---------------- METRICS (NO RECOMPUTATION) ----------------
  const totalRevenue = filteredOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  );

  const totalCash = filteredOrders
    .filter(o => o.payment_method === 'cash')
    .reduce((sum, o) => sum + Number(o.total), 0);

  const totalDigital = filteredOrders
    .filter(o => o.payment_method !== 'cash')
    .reduce((sum, o) => sum + Number(o.total), 0);

  // ---------------- HOURLY GRAPH ----------------
  const chartData = useMemo(() => {
    const hours = Array(24).fill(0);
    filteredOrders.forEach(o => {
      const h = new Date(o.created_at).getHours();
      hours[h] += Number(o.total);
    });
    return hours;
  }, [filteredOrders]);

  const maxSales = Math.max(...chartData, 100);

  // ---------------- CSV EXPORT (EXACT UI DATA) ----------------
  const exportData = () => {
    if (filteredOrders.length === 0) {
      alert("No data");
      return;
    }

    const headers = ["ID", "Time", "Method", "Total"];
    const rows = filteredOrders.map(o =>
      [
        o.id,
        new Date(o.created_at).toLocaleTimeString(),
        o.payment_method.toUpperCase(),
        o.total
      ].join(",")
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Sales_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="flex flex-col h-full antialiased"
      style={{ fontFamily: FONTS.sans }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-semibold ${theme.text.main}`}>
            Dashboard
          </h1>
          <p className={`text-sm ${theme.text.secondary}`}>
            Overview for {reportDate}
          </p>
        </div>

        <div className="flex gap-3">
          <div
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg border ${COMMON_STYLES.card(isDarkMode)}`}
          >
            <Calendar size={18} className={theme.text.secondary} />
            <span className={`text-sm ${theme.text.main}`}>
              {reportDate}
            </span>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <button
            onClick={exportData}
            className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${theme.button.secondary}`}
          >
            <Download size={18} />
            <span className="text-sm">Export CSV</span>
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Wallet, label: 'Revenue', value: `₹${totalRevenue}` },
          { icon: Smartphone, label: 'Digital', value: `₹${totalDigital}` },
          { icon: Banknote, label: 'Cash', value: `₹${totalCash}` },
          { icon: TrendingUp, label: 'Orders', value: filteredOrders.length }
        ].map((m, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl border ${COMMON_STYLES.card(isDarkMode)}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${theme.text.secondary}`}>
              <m.icon size={16} />
              <span className="text-xs uppercase">{m.label}</span>
            </div>
            <div className={`text-2xl font-semibold ${theme.text.main}`}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* HOURLY GRAPH */}
      <div className={`mb-6 rounded-xl border p-6 ${COMMON_STYLES.card(isDarkMode)}`}>
        <h2 className={`font-semibold mb-4 ${theme.text.main}`}>
          Hourly Activity
        </h2>
        <div className="h-40 flex gap-2 items-end">
          {chartData.map((val, h) => (
            <div key={h} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-black dark:bg-white rounded-t"
                style={{ height: `${(val / maxSales) * 100}%` }}
              />
              <span className={`text-[10px] mt-1 ${theme.text.secondary}`}>
                {h}:00
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className={`flex-1 rounded-xl border ${COMMON_STYLES.card(isDarkMode)}`}>
        <table className="w-full text-sm">
          <thead className={COMMON_STYLES.tableHeader(isDarkMode)}>
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Method</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center">
                  No transactions.
                </td>
              </tr>
            ) : (
              filteredOrders.map(o => (
                <tr key={o.id} className={COMMON_STYLES.tableRow(isDarkMode)}>
                  <td className="p-3 font-mono">#{o.id}</td>
                  <td className="p-3">
                    {new Date(o.created_at).toLocaleTimeString()}
                  </td>
                  <td className="p-3 uppercase">
                    {o.payment_method}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    ₹{o.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}