import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Box } from 'lucide-react';

export default function MenuItemModal({ isOpen, onClose, onSave, onDelete, itemToEdit, categories, isDarkMode }) {
  // Initialize form with stock
  const [form, setForm] = useState({ name: '', price: '', category: 'General', stock: 0 });

  // Populate form if editing, otherwise reset
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setForm({
          name: itemToEdit.name || '',
          price: itemToEdit.price || '',
          category: itemToEdit.category || 'General',
          stock: itemToEdit.stock || 0,
        });
      } else {
        setForm({ name: '', price: '', category: 'General', stock: 0 });
      }
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic: Pass numeric values to match FastAPI/Pydantic expectations
    onSave({ 
        ...form, 
        price: Number(form.price),
        stock: Number(form.stock) 
    });
  };

  const theme = {
    bgCard: isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-stone-900',
    input: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-stone-50 border-stone-200',
    border: isDarkMode ? 'border-slate-800' : 'border-stone-200',
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md ${theme.bgCard} rounded-xl shadow-2xl overflow-hidden`}>
        
        <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}>
          <h2 className="font-bold text-lg">{itemToEdit ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="p-1 hover:opacity-70"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold mb-1 opacity-70 tracking-wider">ITEM NAME</label>
            <input 
              required
              className={`w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500 ${theme.input}`}
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Butter Chicken"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70 tracking-wider">PRICE (₹)</label>
              <input 
                required
                type="number"
                className={`w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                placeholder="0"
              />
            </div>

            {/* Stock - REQUIRED FOR FASTAPI MODEL */}
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70 tracking-wider">INITIAL STOCK</label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  className={`w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                  value={form.stock}
                  onChange={e => setForm({...form, stock: e.target.value})}
                  placeholder="0"
                />
                <Box size={14} className="absolute right-3 top-3 opacity-30" />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
             <label className="block text-xs font-bold mb-1 opacity-70 tracking-wider">CATEGORY</label>
             <div className="flex gap-2 flex-wrap mb-2">
                {categories.map(cat => (
                    <button 
                        type="button"
                        key={cat}
                        onClick={() => setForm({...form, category: cat})}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase border transition-all ${form.category === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : `${theme.border} opacity-70 hover:opacity-100`}`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
             <input 
                className={`w-full p-2 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-blue-500 ${theme.input}`}
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                placeholder="Or type custom category..."
             />
          </div>

          {/* Action Buttons */}
          <div className={`pt-4 border-t ${theme.border} flex gap-3`}>
             {itemToEdit && (
                 <button 
                    type="button" 
                    onClick={onDelete}
                    title="Delete Item"
                    className="p-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                 >
                    <Trash2 size={20}/>
                 </button>
             )}
             <button 
                type="submit" 
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
             >
                <Save size={18}/> {itemToEdit ? 'Update Item' : 'Save Item'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}