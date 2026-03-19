import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, User } from 'lucide-react';
import { getTheme, COMMON_STYLES } from './theme';

export default function AdminSettingsModal({ open, onClose, restaurantId, isDarkMode }) {
  // Use fallback if env variable is missing
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const [upiId, setUpiId] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = getTheme(isDarkMode);
  const [kitchenCapacity, setKitchenCapacity] = useState(20);
  // 1. Fetch Settings on Load
  useEffect(() => {
    if (open) {
      const fetchSettings = async () => {
        try { 
            const token = localStorage.getItem("auth_token"); 
            if (!token) return;

            // GET request to /settings
            const res = await fetch(`${API_URL}/settings`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }); 

            if (res.ok) { 
                const data = await res.json(); 
                // Database returns snake_case, so we read those keys
                setUpiId(data.upi_id || ""); 
                setPayeeName(data.payee_name || ""); 
                setKitchenCapacity(data.kitchen_capacity || 20); // Add this
            } 
        } catch (e) { 
            console.error("Fetch settings failed:", e); 
        }
      };
      fetchSettings();
    }
  }, [open, API_URL]);

  // 2. Save Settings
  const handleSave = async () => {
    setLoading(true);
    try { 
        const token = localStorage.getItem("auth_token"); 
        
        // ✅ CRITICAL FIX: Method MUST be PUT to match router.put('/')
        const res = await fetch(`${API_URL}/settings`, { 
            method: "PUT", 
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            }, 
            // ✅ CRITICAL FIX: Send camelCase keys to match backend controller
            body: JSON.stringify({ 
                upiId: upiId,          
                payeeName: payeeName,  
                kitchenCapacity: Number(kitchenCapacity), // Add this
                restaurantId 
            }) 
        }); 

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || "Failed to save settings"); 
        }
        
        alert("Settings Saved!"); 
        onClose(); 
    } catch (e) { 
        alert(e.message); 
    } finally { 
        setLoading(false); 
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${COMMON_STYLES.modal(isDarkMode)}`}>
        {/* Header */}
        <div className={`p-5 border-b flex justify-between items-center ${theme.border.default}`}>
            <h2 className={`text-lg font-semibold ${theme.text.main}`}>System Settings</h2>
            <button onClick={onClose} className={`p-2 rounded-lg ${theme.button.ghost}`}>
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
            <div>
                <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>UPI ID (VPA)</label>
                <div className="relative">
                    <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.secondary}`} size={18}/>
                    <input 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)} 
                        placeholder="merchant@upi" 
                        className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(isDarkMode)}`} 
                    />
                </div>
                <p className={`text-[10px] mt-1 ${theme.text.muted}`}>Your UPI ID for generating QR codes.</p>
            </div>
            
            <div>
                <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>Payee Name</label>
                <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.secondary}`} size={18}/>
                    <input 
                        value={payeeName} 
                        onChange={(e) => setPayeeName(e.target.value)} 
                        placeholder="Business Name" 
                        className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(isDarkMode)}`} 
                    />
                </div>
                <p className={`text-[10px] mt-1 ${theme.text.muted}`}>The name customers see when scanning.</p>
            </div>
            <div>
    <label className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}>Kitchen Capacity</label>
    <div className="relative">
        <Box className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.secondary}`} size={18}/>
        <input 
            type="number"
            value={kitchenCapacity} 
            onChange={(e) => setKitchenCapacity(e.target.value)} 
            className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(isDarkMode)}`} 
        />
    </div>
    <p className={`text-[10px] mt-1 ${theme.text.muted}`}>Max active orders before warning cashier.</p>
</div>
        </div>

        {/* Footer */}
        <div className={`p-5 border-t flex justify-end gap-3 ${theme.border.default} ${theme.bg.subtle}`}>
            <button 
                onClick={onClose} 
                className={`px-4 py-2 rounded-lg font-medium text-sm ${theme.button.secondary}`}
            >
                Cancel
            </button>
            <button 
                onClick={handleSave} 
                disabled={loading} 
                className={`px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${theme.button.primary}`}
            >
                <Save size={16}/> {loading ? "Saving..." : "Save Settings"}
            </button>
        </div>
      </div>
    </div>
  );
}