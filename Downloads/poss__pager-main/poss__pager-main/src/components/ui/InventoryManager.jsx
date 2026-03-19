import React, { useEffect, useState } from "react";
import { Plus, Box, RefreshCw, AlertCircle, Edit2, X, Save } from "lucide-react";
import { getTheme, COMMON_STYLES } from "./theme";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function InventoryManager({ apiRequest, isDarkMode }) {
  const theme = getTheme(isDarkMode);

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track which item is being edited

  const [form, setForm] = useState({
    name: "",
    unit: "",
    current_stock: "",
    min_stock: ""
  });

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`${API_URL}/ingredients/`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");
      setIngredients(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const getErrorMessage = (data) => {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map(err => `${err.loc[1] || 'Error'}: ${err.msg}`).join("\n");
    }
    return "An unexpected error occurred";
  };

  // -----------------------------------------
  // HANDLE ADD OR UPDATE
  // -----------------------------------------
  const handleSubmit = async () => {
    if (!form.name || !form.unit) {
      alert("Name and unit required");
      return;
    }

    const isEditing = editingId !== null;
    const url = isEditing 
      ? `${API_URL}/ingredients/${editingId}` 
      : `${API_URL}/ingredients/`;
    
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await apiRequest(url, {
        method: method,
        body: JSON.stringify({
          name: form.name,
          unit: form.unit,
          current_stock: Number(form.current_stock) || 0,
          min_stock: Number(form.min_stock) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data));

      // Reset state
      setForm({ name: "", unit: "", current_stock: "", min_stock: "" });
      setEditingId(null);
      fetchIngredients();
    } catch (err) {
      alert(err.message);
    }
  };

  // -----------------------------------------
  // START EDITING
  // -----------------------------------------
  const startEdit = (ingredient) => {
    setEditingId(ingredient.id);
    setForm({
      name: ingredient.name,
      unit: ingredient.unit,
      current_stock: ingredient.current_stock,
      min_stock: ingredient.min_stock
    });
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: "", unit: "", current_stock: "", min_stock: "" });
  };

  // -----------------------------------------
  // RESTOCK INGREDIENT
  // -----------------------------------------
  const handleRestock = async (id) => {
    const amountStr = prompt("Enter restock amount:");
    if (amountStr === null) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    try {
      const res = await apiRequest(
        `${API_URL}/ingredients/${id}/restock?amount=${amount}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Restock failed");
      fetchIngredients();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Inventory Management</h2>
        {editingId && (
          <button 
            onClick={cancelEdit}
            className="flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            <X size={16} /> Cancel Editing
          </button>
        )}
      </div>

      {/* FORM SECTION (ADD/EDIT) */}
      <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 mb-8 border-2 ${editingId ? 'border-blue-500/50' : 'border-transparent'}`}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          {editingId ? <Edit2 size={16} className="text-blue-500" /> : <Plus size={16} />}
          {editingId ? "Edit Ingredient" : "Add New Ingredient"}
        </h3>

        <div className="grid grid-cols-4 gap-4">
          <input
            placeholder="Name"
            className={COMMON_STYLES.input(isDarkMode)}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Unit (g, pcs, ml)"
            className={COMMON_STYLES.input(isDarkMode)}
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />

          <input
            type="number"
            placeholder="Stock"
            disabled={editingId !== null} // Usually current stock is changed via Restock or automated deduction
            className={`${COMMON_STYLES.input(isDarkMode)} ${editingId ? 'opacity-50' : ''}`}
            value={form.current_stock}
            onChange={(e) => setForm({ ...form, current_stock: e.target.value })}
          />

          <input
            type="number"
            placeholder="Min Stock"
            className={COMMON_STYLES.input(isDarkMode)}
            value={form.min_stock}
            onChange={(e) => setForm({ ...form, min_stock: e.target.value })}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium ${theme.button.primary}`}
          >
            {editingId ? <Save size={18} /> : <Plus size={18} />}
            {editingId ? "Update Ingredient" : "Add Ingredient"}
          </button>
          
          {editingId && (
            <button
              onClick={cancelEdit}
              className={`px-4 py-2 rounded-lg border ${theme.border.default} ${theme.text.secondary} hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className={`${COMMON_STYLES.card(isDarkMode)} overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className={`${theme.bg.subtle}`}>
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Unit</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Min</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((i) => {
              const isLow = i.current_stock <= i.min_stock;
              const isBeingEdited = editingId === i.id;

              return (
                <tr key={i.id} className={`border-t transition-colors ${isBeingEdited ? 'bg-blue-500/5' : ''}`}>
                  <td className="p-4 font-medium">{i.name}</td>
                  <td className="p-4">{i.unit}</td>
                  <td className={`p-4 ${isLow ? "text-red-500 font-bold" : ""}`}>
                    <div className="flex items-center gap-2">
                      <Box size={14} />
                      {i.current_stock}
                      {isLow && <AlertCircle size={14} />}
                    </div>
                  </td>
                  <td className="p-4 text-zinc-500">{i.min_stock}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button
                      title="Edit Details"
                      onClick={() => startEdit(i)}
                      className="p-2 rounded-md hover:bg-blue-500/10 text-blue-500"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      title="Quick Restock"
                      onClick={() => handleRestock(i.id)}
                      className="p-2 rounded-md hover:bg-emerald-500/10 text-emerald-500"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}