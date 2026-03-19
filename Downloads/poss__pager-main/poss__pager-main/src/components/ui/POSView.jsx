import React, { useState, useMemo } from "react";
import { Search, Plus, Minus, ShoppingCart, Box } from "lucide-react";
import { getTheme, COMMON_STYLES, FONTS } from "./theme";

export default function POSView({
  menu,
  categories,
  cart,
  selectedCategory,
  setSelectedCategory,
  availableTokens,
  selectedToken,
  onSetToken,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
  isDarkMode,
  discount,
  setDiscount,
  taxRate,
}) {
  const theme = getTheme(isDarkMode);
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    let list = [];
    if (selectedCategory === "All" || !selectedCategory) {
      Object.values(menu).forEach(arr => (list = list.concat(arr)));
    } else {
      list = menu[selectedCategory] || [];
    }
    if (search) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [menu, selectedCategory, search]);

  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = Math.max(0, cartSubtotal - discount) * (taxRate / 100);
  const grandTotal = Math.round(
    Math.max(0, cartSubtotal - discount) + taxAmount
  );

  const getCartQty = id => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <div
      className={`flex h-full transition-colors duration-300 ${theme.bg.main} ${theme.text.main}`}
      style={{ fontFamily: FONTS.sans }}
    >
      {/* LEFT: PRODUCTS */}
      <div className={`flex-1 flex flex-col border-r ${theme.border.default}`}>

        {/* SEARCH + CATEGORY */}
        <div className={`p-3 space-y-2 border-b ${theme.border.default} ${theme.bg.card}`}>
          <input
            className={COMMON_STYLES.input(isDarkMode)}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {["All", ...categories].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? theme.button.primary
                    : theme.button.secondary
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="flex-1 overflow-auto p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 content-start">
          {filteredProducts.map(p => {
            const qty = getCartQty(p.id);

            return (
              <div
                key={p.id}
                className={`${COMMON_STYLES.card(isDarkMode)} h-[105px] p-3 flex flex-col justify-between hover:border-blue-500 transition-all`}
              >
                <div>
                  <p className="text-[10px] uppercase font-bold opacity-40">{p.category}</p>
                  <h3 className="text-sm font-semibold leading-tight line-clamp-1">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] opacity-50 mt-1">
                    <Box size={10} />
                    <span>{p.stock}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold">₹{p.price}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRemoveFromCart(p)}
                      className={`p-1 rounded-md transition-colors ${theme.bg.subtle} hover:bg-red-500/20 text-red-500`}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{qty}</span>
                    <button
                      disabled={p.stock <= 0}
                      onClick={() => onAddToCart(p)}
                      className={`p-1 rounded-md transition-colors ${theme.bg.subtle} hover:bg-green-500/20 text-green-500 disabled:opacity-20`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: CART / KITCHEN QUEUE STYLE PANEL */}
      <div className={`w-84 flex flex-col border-l ${theme.border.default} ${theme.bg.card} transition-colors duration-300`}>
        
        {/* HEADER */}
        <div className={`p-4 flex justify-between items-center border-b ${theme.border.default}`}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-blue-500" />
            <span className="font-bold">Current Cart</span>
          </div>

          <select
            value={selectedToken}
            onChange={e => onSetToken(e.target.value)}
            className={`text-sm px-2 py-1 rounded border ${theme.bg.main} ${theme.border.default} outline-none`}
          >
            {availableTokens.map(t => (
              <option key={t}>Token {t}</option>
            ))}
          </select>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="text-xs font-bold uppercase mt-2">Empty Cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${theme.border.default} ${theme.bg.subtle}`}>
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-xs opacity-50">₹{item.price} × {item.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onRemoveFromCart(item)} className="p-1.5 rounded-md bg-zinc-500/10 hover:bg-zinc-500/20 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-bold text-xs">{item.quantity}</span>
                  <button onClick={() => onAddToCart(item)} className="p-1.5 rounded-md bg-zinc-500/10 hover:bg-zinc-500/20 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* TOTALS */}
        <div className={`p-4 border-t ${theme.border.default} space-y-3 bg-zinc-500/5`}>
          <div className="space-y-1">
            <div className="flex justify-between text-xs opacity-60">
              <span>Subtotal</span>
              <span>₹{cartSubtotal}</span>
            </div>
            <div className="flex justify-between text-xs opacity-60">
              <span>GST (5%)</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-bold">Payable Amount</span>
            <span className="text-xl font-black text-blue-500">₹{grandTotal}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className={`${theme.button.primary} w-full py-3 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-transform active:scale-95 disabled:opacity-30 disabled:grayscale`}
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}