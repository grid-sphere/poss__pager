import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { getTheme, COMMON_STYLES } from "./theme";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeManager({ apiRequest, isDarkMode, products }) {
  const theme = getTheme(isDarkMode);

  const [ingredients, setIngredients] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipe, setRecipe] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingQty, setEditingQty] = useState("");

  const [newEntry, setNewEntry] = useState({
    ingredient_id: "",
    quantity_required: ""
  });

  const [error, setError] = useState(null);

  // ------------------------------------------------
  // FETCH INGREDIENTS
  // ------------------------------------------------
  const fetchIngredients = async () => {
    try {
      const res = await apiRequest(`${API_URL}/ingredients/`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to load ingredients");

      setIngredients(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // ------------------------------------------------
  // FETCH PRODUCT RECIPE
  // ------------------------------------------------
  const fetchRecipe = async (productId) => {
    if (!productId) return;

    try {
      setLoading(true);

      const res = await apiRequest(`${API_URL}/recipes/product/${productId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to fetch recipe");

      setRecipe(data);
    } catch (err) {
      setError(err.message);
      setRecipe([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (selectedProduct) fetchRecipe(selectedProduct);
  }, [selectedProduct]);

  // ------------------------------------------------
  // ADD RECIPE ENTRY
  // ------------------------------------------------
  const handleAddRecipe = async () => {
    if (!selectedProduct) {
      alert("Select a product first");
      return;
    }
    const qty = parseFloat(newEntry.quantity_required);
    if (!newEntry.ingredient_id || isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity greater than 0 (e.g., 0.5)");
      return;
    }

    try {
      setSubmitting(true);

      const res = await apiRequest(`${API_URL}/recipes/`, {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(selectedProduct),
          ingredient_id: Number(newEntry.ingredient_id),
          quantity_required: qty
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to add recipe");

      setNewEntry({
        ingredient_id: "",
        quantity_required: ""
      });

      fetchRecipe(selectedProduct);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------
  // DELETE RECIPE
  // ------------------------------------------------
  const handleDelete = async (recipeId) => {
    if (!confirm("Remove ingredient from recipe?")) return;

    try {
      const res = await apiRequest(`${API_URL}/recipes/${recipeId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete recipe");

      setRecipe((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (err) {
      alert(err.message);
    }
  };

  // ------------------------------------------------
  // START EDIT
  // ------------------------------------------------
  const startEdit = (recipe) => {
    setEditingId(recipe.id);
    setEditingQty(recipe.quantity_required);
  };

  // ------------------------------------------------
  // CANCEL EDIT
  // ------------------------------------------------
  const cancelEdit = () => {
    setEditingId(null);
    setEditingQty("");
  };

  // ------------------------------------------------
  // SAVE EDIT
  // ------------------------------------------------
  const saveEdit = async (recipeId) => {
    if (isNaN(qty) || qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }
    try {
      const res = await apiRequest(`${API_URL}/recipes/${recipeId}`, {
        method: "PUT",
        body: JSON.stringify({
          product_id: Number(selectedProduct),
          ingredient_id: recipe.find((r) => r.id === recipeId).ingredient_id,
          quantity_required: qty
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Update failed");

      setRecipe((prev) =>
        prev.map((r) =>
          r.id === recipeId ? { ...r, quantity_required: editingQty } : r
        )
      );

      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // ------------------------------------------------
  // UTILS
  // ------------------------------------------------
  const getIngredientName = (id) => {
    const ing = ingredients.find((i) => i.id === id);
    return ing ? ing.name : "Unknown";
  };

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-8">Recipe Management</h2>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      {/* PRODUCT SELECT */}
      <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 mb-8`}>
        <label className="block mb-2 text-sm font-medium">
          Select Product
        </label>

        <select
          className={COMMON_STYLES.select(isDarkMode)}
          value={selectedProduct || ""}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Choose product</option>

          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          {/* ADD RECIPE */}
          <div className={`${COMMON_STYLES.card(isDarkMode)} p-6 mb-8`}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Plus size={16} /> Add Ingredient
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <select
                className={COMMON_STYLES.select(isDarkMode)}
                value={newEntry.ingredient_id}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    ingredient_id: e.target.value
                  })
                }
              >
                <option value="">Select Ingredient</option>

                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Quantity"
                step="any" 
                min="0.01"
                className={COMMON_STYLES.input(isDarkMode)}
                value={newEntry.quantity_required}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    quantity_required: e.target.value
                  })
                }
              />

              <button
                onClick={handleAddRecipe}
                disabled={submitting}
                className={theme.button.primary}
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* RECIPE TABLE */}
          <div className={`${COMMON_STYLES.card(isDarkMode)} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className={theme.bg.subtle}>
                <tr>
                  <th className="p-4 text-left">Ingredient</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {recipe.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-4">
                      {getIngredientName(r.ingredient_id)}
                    </td>

                    <td className="p-4">
                      {editingId === r.id ? (
                        <input
                          type="number"
                          step="any"    // ✅ Allows any decimal point
                          min="0.001"
                          className={COMMON_STYLES.input(isDarkMode)}
                          value={editingQty}
                          onChange={(e) => setEditingQty(e.target.value)}
                        />
                      ) : (
                        r.quantity_required
                      )}
                    </td>

                    <td className="p-4 text-right flex justify-end gap-2">
                      {editingId === r.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(r.id)}
                            className="text-green-500"
                          >
                            <Check size={16} />
                          </button>

                          <button
                            onClick={cancelEdit}
                            className="text-gray-500"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(r)}
                            className="text-blue-500"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && recipe.length === 0 && (
              <div className="p-6 text-center text-sm opacity-70">
                No recipe defined for this product
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}