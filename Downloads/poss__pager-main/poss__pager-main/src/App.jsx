import React, { useState, useEffect } from 'react';
import RestaurantVendorUI from './components/ui/RestaurantVendorUI';
import LoginView from './components/ui/LoginView'; // ✅ IMPORTED LOGIN VIEW

// ✅ DYNAMIC BACKEND CONNECTION
const API_URL =  "http://localhost:8000";

export default function App() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. Check for Session on Load
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const savedRole = localStorage.getItem("user_role");
    const savedName = localStorage.getItem("username");
    if (token) {
      console.log(`✅ Connected to Backend: ${API_URL}`);
      setUser({ 
        role: savedRole || "cashier", 
        username: savedName || "User", // ✅ Restore name here
        token 
      });
    }
  }, []);

  // 2. Handle Login Success (Called by LoginView)
  const handleLoginSuccess = (userData, token) => {
    // ✅ FIX: Extract name from userData
    const userName = userData?.username || "Admin"; 
    const userRole = userData?.role || "cashier";
    
    // Save to LocalStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user_role", userRole);
    localStorage.setItem("username", userName); // ✅ Use the correct variable
    
    // Update State
    setUser({ ...userData, username: userName, token });
  };

  // 3. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username");
    setUser(null);
  };

  // --- RENDER ---

  // If Logged In: Show Main POS UI
  if (user) {
    return (
      <RestaurantVendorUI 
        user={user} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        API_URL={API_URL} 
      />
    );
  }

  // If Logged Out: Show Login View
  return (
    <LoginView 
      onLogin={handleLoginSuccess} 
      isDarkMode={isDarkMode} 
      onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
    />
  );
}