import { useState, useEffect } from "react";

export default function AdminProductModal({ 
  open, 
  onClose, 
  onSave, 
  initialData 
}) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: ""
  });
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: "", price: "", stock: "", category: "" });
    }
  }, [initialData]);
  
   

  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    if (!form.name || !form.price || !form.stock) {
      alert("Fill all fields");
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Edit Product" : "Add Product"}
        </h2>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full mb-2" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" className="border p-2 w-full mb-2" />
        <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" type="number" className="border p-2 w-full mb-2" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="border p-2 w-full mb-4" />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1 bg-black text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
