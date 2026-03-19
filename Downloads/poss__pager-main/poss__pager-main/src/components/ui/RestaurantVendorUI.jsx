// ✅ Added useCallback to the imports
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  LogOut,
  LayoutDashboard,
  Coffee,
  Settings,
  User,
  Sun,
  Moon,
  Bell,
  Plus,
  Trash2,
  Wifi,
  Box,
  BookOpen
} from "lucide-react";
import { getTheme, COMMON_STYLES, FONTS } from "./theme";
import POSView from "./POSView";
import CheckoutModal from "./CheckoutModal";
import SalesReport from "./SalesReport";
import AdminSettingsModal from "./AdminSettingsModal";
import ActiveOrdersDrawer from "./ActiveOrdersDrawer";
import { getUPIQR } from "./utils";
import InventoryManager from "./InventoryManager";
import ManagerDashboard from "./ManagerDashboard";
import ProductManagement from "./ProductManagement";
import RecipeManager from "./RecipeManager";
const API_URL = import.meta.env.VITE_API_URL ;
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("auth_token");
  // Ensure we don't have double slashes if the user provided one in .env
  const cleanUrl = url.replace(/([^:]\/)\/+/g, "$1"); 
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(cleanUrl, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    window.location.reload(); 
  }
  return response;
};


 

export default function RestaurantVendorUI({
  user,
  onLogout,
  isDarkMode,
  onToggleTheme,
}) {
 
  const theme = getTheme(isDarkMode);
  const token = localStorage.getItem("auth_token");
  const getUsername = () => 
  user?.username || localStorage.getItem("username") || "User";
  // Helpers
  const getRestaurantId = () =>
    user?.restaurantId || user?.user?.restaurantId || user?.restaurant_id || 1;
  const getUserRole = () =>
    user?.role ||
    user?.user?.role ||
    localStorage.getItem("user_role") ||
    "cashier";
  const userRole = getUserRole();
  const displayName = getUsername();

  // --- STATE ---
  const [orders, setOrders] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [menu, setMenu] = useState({});
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [reportDate, setReportDate] = useState(
    new Date().toLocaleDateString('en-CA')
  );
  const [showActiveOrders, setShowActiveOrders] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState(
    ["admin", "manager"].includes(userRole) ? "dashboard" : "pos"
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [dockConnected, setDockConnected] = useState(false);
  // Add this with your other refs/state
  const portRef = useRef(null);
  // Admin State (Shared with POSView)
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    id: null,
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "cashier",
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  // POS Logic
  const [selectedToken, setSelectedToken] = useState("1");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(5);
  const [settings, setSettings,] = useState({ upiId: "", payeeName: "",kitchenCapacity: 20 });
  const [activeUpiData, setActiveUpiData] = useState(null);

  const hasFetched = useRef(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- API ---
  const refreshProducts = async () => {
    try {
      const res = await apiRequest(`${API_URL}/products/`)
      if (res.ok) {
        const list = await res.json();
        const productList = Array.isArray(list) ? list : list.products || [];
        setRawProducts(productList);
        const grouped = {};
        const cats = new Set();
        productList.forEach((p) => {
          const cat = p.category || "General";
          if (!grouped[cat]) grouped[cat] = [];
          cats.add(cat);
          grouped[cat].push({
            id: Number(p.id),
            name: p.name,
            price: p.price !== null ? Number(p.price) : 0, // ✅ Ensure Number
            stock: p.stock !== null ? Number(p.stock) : 0, // ✅ Ensure Number
            category: cat,
          });
        });
        setMenu(grouped);
        setCategories(Array.from(cats));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshUsers = async () => {
    try {
      const userRes = await apiRequest(`${API_URL}/staff/`)
      if (userRes.ok) setUsersList(await userRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await apiRequest(`${API_URL}/orders/`);
      if (res.ok) {
        const serverOrders = await res.json();
        if (Array.isArray(serverOrders)) {
          // ✅ FIX: Strict filter for "active" status
          const activeOnly = serverOrders.filter(
            (o) => (o.status || "").toLowerCase() === "active"
          );

          setOrders(
            activeOnly.map((o) => ({
              ...o,
              // Use the actual backend keys
              startedAt: o.created_at || o.startedAt || Date.now(),
              paymentMethod: (o.payment_method || "cash").toLowerCase(),
              total: Number(o.total_amount || 0),
              // Ensure items are mapped correctly so they don't show as empty on refresh
              items: (o.items || []).map(it => {
                const product = rawProducts.find(p => p.id === it.product_id);
                return {
                  name: product ? product.name : "Item",
                  quantity: it.quantity
                };
              })
            }))
          );
        }
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  };
  const fetchSalesHistory = useCallback(async (date) => {
    if (activeTab !== "dashboard") return;
  
    setIsHistoryLoading(true);
    try {
      const res = await apiRequest(`${API_URL}/orders/history?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch history");
  
      const data = await res.json();
      setSalesHistory(data.orders || []);
    } catch (err) {
      console.error("Sales history fetch failed:", err);
      setSalesHistory([]);
    } finally {
      // Add a slight delay so the user sees the transition
      setTimeout(() => setIsHistoryLoading(false), 300);
    }
  }, [activeTab]); // Removed API_URL from deps if it's a constant to be safer
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const load = async () => {
      await refreshProducts();
      await fetchActiveOrders();
      try {
        const sRes = await apiRequest(`${API_URL}/settings/`)
        if (sRes.ok) {
          const s = await sRes.json();
          setSettings({ upiId: s.upi_id, payeeName: s.payee_name ,kitchenCapacity: s.kitchen_capacity || 20});
        }
        if (userRole === "admin") await refreshUsers();
      } catch (e) {}
    };
    load();
    const interval = setInterval(fetchActiveOrders, 3000);
    return () => clearInterval(interval);
  }, [token, API_URL, userRole]);

  useEffect(() => {
    if (!["admin", "manager"].includes(userRole) && activeTab === "dashboard") {
      setActiveTab("menu");
    }
  }, [userRole, activeTab]);

  useEffect(() => {
    if (activeTab === "dashboard" && ["admin", "manager"].includes(userRole)) {
      fetchSalesHistory(reportDate);
    }
  }, [activeTab, reportDate, userRole]);

  // --- HANDLERS ---

  // 1. ADD Product
  const handleAdminAddProduct = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        category: formData.category,
      };
  
      const res = await apiRequest(`${API_URL}/products/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Add failed:", data);
        alert(data.detail || "Failed to add product");
        return;
      }
  
      await refreshProducts();
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  // 2. UPDATE Product (New Function for PUT Route)
  const handleAdminUpdateProduct = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        category: formData.category,
      };
  
      const res = await apiRequest(
        `${API_URL}/products/${formData.id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Update failed:", data);
        alert(data.detail || "Failed to update product");
        return;
      }
  
      await refreshProducts();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleAdminAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      return alert("Fill all fields");
    }
    const res = await apiRequest(`${API_URL}/staff/`, {
      method: "POST",
     
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.detail || "Failed to create staff");
      return;
    }
    setNewUser({ username: "", email: "", password: "", role: "cashier" });
    refreshUsers();
  };
  const handleAdminUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(`${API_URL}/staff/${editingUser.id}`, {
        method: "PUT",
        body: JSON.stringify(editingUser),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Update failed");
  
      // Refresh the list and close the edit state
      await refreshUsers();
      setEditingUser(null);
      alert("Staff details updated successfully!");
    } catch (err) {
      // This catches the detail string from backend instead of [object Object]
      alert(err.message);
    }
  };
  const handleAdminDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
  
    try {
      const res = await apiRequest(`${API_URL}/staff/${id}`, {
        method: "DELETE",
      });
  
      const data = await res.json().catch(() => ({}));
  
      if (!res.ok) {
        // ✅ Now alerts the actual error string
        alert(data.detail || "Failed to delete staff member");
        return;
      }
  
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // --- DOCK LOGIC ---
  const connectDock = async () => {
    try {
      if ("serial" in navigator) {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        // STORE THE PORT HERE
        portRef.current = port;

        setDockConnected(true);
        alert("✅ Dock Connected Successfully!");
      } else {
        alert("⚠️ Web Serial API not supported in this browser.");
      }
    } catch (err) {
      console.error("Dock Connection Failed:", err);
      setDockConnected(false);
    }
  };

  const sendToDock = async (tokenNum) => {
    // Check if port exists and is writable
    if (!dockConnected || !portRef.current || !portRef.current.writable) {
      alert("Dock not connected or not writable! Please connect dock.");
      return;
    }

    // 1. Get the writer
    const writer = portRef.current.writable.getWriter();

    try {
      // 2. Write the data

      console.log(`Sending Token ${tokenNum} to Dock...`);

      const data = new TextEncoder().encode(`${tokenNum}\n`);
      await writer.write(data);
    } catch (error) {
      console.error("Error writing to serial port:", error);
      alert("Failed to send to dock");
    } finally {
      // 3. CRITICAL: Release the lock so the port can be used again later
      writer.releaseLock();
    }
  };

  // Cart Logic
  const cartSubtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = Math.max(0, cartSubtotal - discount) * (taxRate / 100);
  const grandTotal = Math.round(
    Math.max(0, cartSubtotal - discount) + taxAmount
  );

  // Find this line in RestaurantVendorUI.jsx (around line 325)
const availableTokens = useMemo(() => {
  const used = orders.map((o) => String(o.token));
  // ✅ Change length from 6 to 8
  return Array.from({ length: 8 }, (_, i) => String(i + 1)).filter(
    (t) => !used.includes(t)
  );
}, [orders]);

  // Only auto-switch if the CURRENT selected token is actually in use (invalid)
  // or if no token is selected at all.
  useEffect(() => {
    if (availableTokens.length > 0) {
      // If current selection is valid, DO NOTHING. Keep user selection.
      if (availableTokens.includes(selectedToken)) return;

      // If current selection is invalid (used), pick the first available one.
      setSelectedToken(availableTokens[0]);
    }
  }, [availableTokens, selectedToken]); // Keep dependencies the same

  const addToCart = (item) =>
    setCart((p) => {
      const f = p.find((i) => i.id === item.id);
      return f
        ? p.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...p, { ...item, quantity: 1 }];
    });
  const removeFromCart = (item) =>
    setCart((p) => {
      const f = p.find((i) => i.id === item.id);
      if (!f) return p;
      if (f.quantity === 1) return p.filter((i) => i.id !== item.id);
      return p.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });

  // --- 1. FIXED: Handle the Checkout Button Click ---
  const handleCheckoutClick = () => {
    // FORCE a log to see if the function even fires
    if (orders.length >= settings.kitchenCapacity) {
      const proceed = window.confirm(
        `⚠️ WARNING: Kitchen is at capacity (${orders.length}/${settings.kitchenCapacity}).\n\nPlacing this order may cause significant delays. Continue?`
      );
      if (!proceed) return;
    }
    console.log("!!! handleCheckoutClick TRIGGERED !!!");
    console.log("Current selectedToken:", selectedToken);
    console.log("Dock Status:", dockConnected);
    setActiveUpiData(null);
    if (dockConnected && selectedToken) {
      console.log(`Sending token ${selectedToken} to dock hardware...`);
      sendToDock(selectedToken);
    } else {
      console.warn("Signal not sent: Dock not connected or Token missing.");
    }

    setShowCheckout(true);
  };

  // --- 2. FIXED: Handle the Database Save ---
  const finalizeOrder = async (payData) => {
    console.log("FINALIZE ORDER CALLED:", payData);
    
    if (payData?.paymentMethod === "upi" && !activeUpiData) {
      const qrConfig = {
        pa: settings.upiId,
        pn: settings.payeeName,
        cu: "INR",
      };
      const qrUrl = getUPIQR(qrConfig, grandTotal, selectedToken);
      setActiveUpiData({ qr: qrUrl, payee: settings.payeeName });
      return;
    }

    let method = typeof payData === "object" ? payData.paymentMethod : payData;
    const tokenToSave = Number(selectedToken);
    const localItems = cart.map(i => ({ name: i.name, quantity: i.quantity }));

    const payload = {
      total_amount: grandTotal,
      payment_method: method,
      token: tokenToSave,
      items: cart.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
        subtotal: i.price * i.quantity
      })),
    };
  
    try {
      const res = await apiRequest(`${API_URL}/orders/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
  
      const r = await res.json();
      if (!res.ok) throw new Error(r.detail || "Order failed");
  
      if (method === "upi" && !payData.confirmed) {
         const qrConfig = { pa: settings.upiId, pn: settings.payeeName, cu: "INR" };
         const qrUrl = getUPIQR(qrConfig, grandTotal, tokenToSave, r.id);
         setActiveUpiData({ qr: qrUrl });
      } else {
        // ✅ KITCHEN FIX: Use "active" status to match server-side polling filter
        const newO = {
          id: r.id,
          token: tokenToSave,
          items: localItems,
          startedAt: new Date().toISOString(),
          total: grandTotal,
          status: "active", 
        };
  
        setOrders((p) => [newO, ...p]);
        
        // ✅ STOCK FIX: Immediately trigger product refresh to update card counts
        await refreshProducts();

        setCart([]);
        setDiscount(0);
        setShowCheckout(false);
        setActiveUpiData(null);
      }
    } catch (e) {
      alert(e.message);
      setShowCheckout(false);
    }
  };

  const handleMarkReady = async (id) => {
    if (!confirm("Complete Order?")) return;
  
    try {
      const res = await apiRequest(`${API_URL}/orders/${id}/complete`, {
        method: "PUT",
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.detail || "Failed to complete order");
  
      setOrders((p) => p.filter((o) => String(o.id) !== String(id)));
    } catch (e) {
      console.error("Complete order error:", e);
      alert(e.message);
    }
  };

  const handlePaymentSuccess = async(method) => {
    setCart([]);
    setDiscount(0);
    setActiveUpiData(null);
    await finalizeOrder({ paymentMethod: method,confirmed: true });
    setShowCheckout(false);
    setTimeout(fetchActiveOrders, 500);
  };

  return (
    <div
      className={`flex flex-col h-screen overflow-hidden ${theme.bg.main} ${theme.text.main}`}
      style={{ fontFamily: FONTS.sans }}
    >
      {/* Header */}
      <header
        className={`h-16 flex items-center justify-between px-6 border-b ${theme.border.default} ${theme.bg.card}`}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme.bg.subtle}`}>
              <Settings size={20} />
            </div>
            <h1 className="text-lg font-semibold">POS</h1>
          </div>
          <nav className="flex items-center gap-1">
            {[
            {
              id: "dashboard",
              icon: LayoutDashboard,
              label: "Dashboard",
              roles: ["admin", "manager"],
            },
            {
              id: "pos",
              icon: Coffee,
              label: "MENU",
              roles: ["cashier"],
            },
            {
              id: "products",
              icon: Box,
              label: "Products",
              roles: ["admin", "manager"],
            },
            {
              id: "kitchen",
              icon: Bell,
              label: "Kitchen",
              roles: ["cashier", "manager"],
              action: () => setShowActiveOrders(true),
              badge: orders.length,
              isCritical: orders.length >= settings.kitchenCapacity
            },
            {
              id: "users",
              icon: User,
              label: "Staff",
              roles: ["admin","manager"],
            },
            {
              id: "inventory",
              icon: Box,
              label: "Inventory",
              roles: ["admin", "manager"],
            },
            {
              id: "recipes",
              icon: BookOpen,
              label: "Recipes",
              roles: ["admin","manager"]
            }
          ].map(
              (item) =>
              (!item.roles || item.roles.includes(userRole)) && (
                <button
                key={item.id}
                onClick={() => item.action ? item.action() : setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors relative
                ${activeTab === item.id && !item.action ? `${theme.bg.active} ${theme.text.main}` : theme.button.ghost}
                ${item.id === 'kitchen' && orders.length >= settings.kitchenCapacity ? 'text-red-500 animate-pulse bg-red-500/10' : ''}`}
              >
                <item.icon size={16} className={item.id === 'kitchen' && orders.length >= settings.kitchenCapacity ? 'text-red-500' : ''} />
                <span>{item.label}</span>
                {/* Update badge styling */}
                {item.badge > 0 && (
                  <span className={`${orders.length >= settings.kitchenCapacity ? 'bg-red-600' : 'bg-blue-600'} text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center`}>
                    {item.badge}
                  </span>
                )}
              </button>
                )
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userRole !== "admin" && (
            <button
              onClick={connectDock}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                dockConnected
                  ? `${theme.bg.active} ${theme.border.default} ${theme.text.main}`
                  : `${theme.border.default} ${theme.button.ghost}`
              }`}
            >
              <Wifi
                size={16}
                className={dockConnected ? "animate-pulse" : ""}
              />
              <span className="hidden sm:inline">
                {dockConnected ? "Dock" : "Connect"}
              </span>
            </button>
          )}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg ${theme.button.ghost}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {userRole === "admin" && (
            <button
              onClick={() => setSettingsOpen(true)}
              className={`p-2 rounded-lg ${theme.button.ghost}`}
            >
              <Settings size={18} />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p
                className={`text-xs uppercase font-medium tracking-wider ${theme.text.tertiary}`}
              >
                {userRole}
              </p>
            </div>
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center border ${theme.border.default} ${theme.bg.subtle}`}
            >
              <User size={16} className={theme.text.secondary} />
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`p-2 rounded-lg ${theme.button.ghost}`}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-hidden ${theme.bg.main}`}>
        <div className="flex-1 overflow-y-auto p-0 relative">
        {activeTab === "dashboard" && ["admin","manager"].includes(userRole) && (
  <div className="p-8">
    <SalesReport
      history={salesHistory}
      reportDate={reportDate}
      setReportDate={setReportDate}
      fetchSalesHistory={fetchSalesHistory} // This triggers the API
      isHistoryLoading={isHistoryLoading}
      isDarkMode={isDarkMode}
    />
  </div>
)}

        {activeTab === "dashboard" && userRole === "manager" && (
          <div className="p-8">
            <ManagerDashboard
              apiRequest={apiRequest}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
  
  {activeTab === "pos" && userRole === "cashier" && (
  <POSView
    menu={menu}
    categories={categories}
    cart={cart}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
    availableTokens={availableTokens}
    selectedToken={selectedToken}
    onSetToken={setSelectedToken}
    onAddToCart={addToCart}
    onRemoveFromCart={removeFromCart}
    onCheckout={handleCheckoutClick}
    isDarkMode={isDarkMode}
    discount={discount}
    setDiscount={setDiscount}
    taxRate={taxRate}
  />
)}
{activeTab === "products" && ["admin","manager"].includes(userRole) && (
  <ProductManagement
    rawProducts={rawProducts}
    categories={categories}
    isDarkMode={isDarkMode}
    onAdd={handleAdminAddProduct}
    onUpdate={handleAdminUpdateProduct}
    onDelete={(id) => {
      if (confirm("Delete?"))
        apiRequest(`${API_URL}/products/${id}`, {
          method: "DELETE",
        }).then(refreshProducts);
    }}
  />
)}
          {activeTab === "inventory" && ["admin","manager"].includes(userRole) && (
  <InventoryManager
    apiRequest={apiRequest}
    isDarkMode={isDarkMode}
  />
)}
{activeTab === "recipes" && ["admin","manager"].includes(userRole) && (
  <RecipeManager
    apiRequest={apiRequest}
    isDarkMode={isDarkMode}
    products={rawProducts}
  />
)}
          {activeTab === "users" && ["admin","manager"].includes(userRole) && (
            
            <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-semibold mb-8">Staff Management</h2>
              <div
                className={`p-6 rounded-lg border mb-8 ${COMMON_STYLES.card(
                  isDarkMode
                )}`}
              >
                <h3
                  className={`text-sm font-semibold mb-4 flex items-center gap-2 ${theme.text.main}`}
                >
                  <Plus size={16} /> Add User
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="col-span-1">
                    <label
                      className={`text-xs font-medium uppercase mb-1.5 block ${theme.text.secondary}`}
                    >
                      Username
                    </label>
                    <input
                      className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      placeholder="john_doe"
                    />
                  </div>
                  <div className="col-span-1">
                    <label
                      className={`text-xs font-medium uppercase mb-1.5 block ${theme.text.secondary}`}
                    >
                      Email
                    </label>
                    <input
                      className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="email@pos.com"
                    />
                  </div>
                  <div className="col-span-1">
                    <label
                      className={`text-xs font-medium uppercase mb-1.5 block ${theme.text.secondary}`}
                    >
                      Password
                    </label>
                    <input
                      className={`w-full ${COMMON_STYLES.input(isDarkMode)}`}
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="••••"
                    />
                  </div>
                  <div className="col-span-1 flex gap-2">
                    <div className="flex-1">
                      <label
                        className={`text-xs font-medium uppercase mb-1.5 block ${theme.text.secondary}`}
                      >
                        Role
                      </label>
                      <select
                        className={`w-full ${COMMON_STYLES.select(isDarkMode)}`}
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                      >
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      onClick={handleAdminAddUser}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors outline-none mt-auto ${theme.button.primary}`}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersList.map((u) => (
        <div
          key={u.id}
          className={`p-5 rounded-lg border flex justify-between items-center group transition-colors ${COMMON_STYLES.card(isDarkMode)}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-md ${theme.bg.subtle}`}>
              <User size={20} />
            </div>
            <div>
              <p className="font-medium text-sm">{u.username}</p>
              <p className={`text-xs font-medium ${theme.text.tertiary}`}>{u.role}</p>
              <p className={`text-xs ${theme.text.muted}`}>{u.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={() => setEditingUser(u)}
              className={`p-2 rounded-md hover:bg-blue-500/10 text-blue-500 transition-colors`}
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => handleAdminDeleteUser(u.id)}
              className={`p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onConfirm={finalizeOrder}
        cartSubtotal={cartSubtotal}
        taxAmount={taxAmount}
        discount={discount}
        grandTotal={grandTotal}
        orderId={orders.length + 1}
        isDarkMode={isDarkMode}
        upiId={settings.upiId}
        payeeName={settings.payeeName}
        backendUpiData={activeUpiData}
        onPaymentComplete={handlePaymentSuccess}
      />
      <ActiveOrdersDrawer
        isOpen={showActiveOrders}
        onClose={() => setShowActiveOrders(false)}
        orders={orders}
        onCompleteOrder={handleMarkReady}
        onCallCustomer={(t) => sendToDock(t)}
        isDarkMode={isDarkMode}
      />
      {userRole === "admin" && (
        <AdminSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          restaurantId={getRestaurantId()}
        />
      )}
      {/* ✅ INSERT THE EDIT MODAL CODE HERE */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           {/* ... modal content ... */}
        </div>
      )}
    </div>
  );
}
