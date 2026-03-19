import React, { useState } from "react";

import { getTheme, COMMON_STYLES, FONTS } from "./theme";
import { Plus, Trash2, Edit2, Box, Check } from "lucide-react";
export default function ProductManagement({
  rawProducts,
  categories,
  isDarkMode,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const theme = getTheme(isDarkMode);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const resetForm = () => {
    setForm({ id: null, name: "", price: "", stock: "", category: "" });
    setIsAdding(false);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    // 1. Check for empty required fields
    if (!form.name || form.price === "" || !form.category) {
      alert("Fill required fields");
      return;
    }

    // 2. Parse numbers for validation
    const priceNum = parseFloat(form.price);
    const stockNum = parseInt(form.stock);

    // 3. STRICT VALIDATION: Prevent negative values
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Price cannot be negative");
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      alert("Stock cannot be negative");
      return;
    }

    // 4. Proceed with API logic
    if (isEditing) {
      await onUpdate(form);
    } else {
      await onAdd(form);
    }

    resetForm();
  };

  const startEdit = (p) => {
    setIsAdding(true);
    setIsEditing(true);
    
    // ✅ FIX: Use fallback values to prevent "null" crashing the inputs
    setForm({
      id: p.id,
      name: p.name || "",
      price: p.price !== undefined && p.price !== null ? p.price.toString() : "",
      stock: p.stock !== undefined && p.stock !== null ? p.stock.toString() : "0",
      category: p.category || "",
    });

    // Smooth scroll to the form at the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`p-8 ${theme.bg.main} ${theme.text.main}`}
      style={{ fontFamily: FONTS.sans }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Products ({rawProducts.length})
        </h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setIsEditing(false);
          }}
          className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${theme.button.primary}`}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isAdding && (
        <div className={`p-6 mb-6 rounded-lg border ${COMMON_STYLES.card(isDarkMode)}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Name Input */}
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={COMMON_STYLES.input(isDarkMode)}
            />
            
            {/* Price Input with Red Border on Negative */}
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`${COMMON_STYLES.input(isDarkMode)} w-full ${
                  parseFloat(form.price) < 0 ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
              />
              {parseFloat(form.price) < 0 && (
                <p className="text-[10px] text-red-500 mt-1 absolute">Negative price not allowed</p>
              )}
            </div>

            {/* Stock Input with Red Border on Negative */}
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className={`${COMMON_STYLES.input(isDarkMode)} w-full ${
                  parseInt(form.stock) < 0 ? "border-red-500 ring-1 ring-red-500" : ""
                }`}
              />
              {parseInt(form.stock) < 0 && (
                <p className="text-[10px] text-red-500 mt-1 absolute">Negative stock not allowed</p>
              )}
            </div>

            {/* Category Select */}
            <input
              list="category-options"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={COMMON_STYLES.input(isDarkMode)}
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="flex justify-end items-center gap-3 mt-8 pt-4 border-t border-zinc-800/50">
  <button 
    onClick={resetForm} 
    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all opacity-70 hover:opacity-100 hover:bg-zinc-800/50 ${theme.text.main}`}
  >
    Cancel
  </button>
  
  <button
    onClick={handleSubmit}
    disabled={parseFloat(form.price) < 0 || parseInt(form.stock) < 0 || !form.name}
    className={`px-8 py-2 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${theme.button.primary} ${
      (parseFloat(form.price) < 0 || parseInt(form.stock) < 0 || !form.name) 
      ? "opacity-40 cursor-not-allowed grayscale" 
      : "hover:scale-105 active:scale-95"
    }`}
  >
    {isEditing ? <Check size={16} /> : <Plus size={16} />}
    {isEditing ? "Update Product" : "Save Product"}
  </button>
</div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className={`${theme.bg.subtle} text-xs uppercase`}>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rawProducts.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 opacity-70">{p.category}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Box size={14} className="opacity-50" />
                    <span className={p.stock <= 5 ? "text-red-500 font-bold" : ""}>
                      {p.stock}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-semibold">₹{p.price}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => startEdit(p)} className="p-2 hover:text-blue-500">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onDelete(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}