import React, { useState } from "react";
import { ChefHat } from "lucide-react";

export default function Auth({ onLogin, onSignup, users, theme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "", // We will use email as username for login check
    password: "",
    role: "cashier",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- SIMULATED BACKEND LOGIC ---
    // (Replace this setTimeout with your fetch() calls when your backend is ready)
    setTimeout(() => {
        try {
            if (isLogin) {
                // LOGIN LOGIC
                // Check if user exists in the 'users' prop passed from Parent
                const foundUser = users.find(u => 
                    (u.username.toLowerCase() === form.email.toLowerCase() || u.email?.toLowerCase() === form.email.toLowerCase()) && 
                    u.password === form.password
                );

                if (foundUser) {
                    onLogin(foundUser);
                } else {
                    throw new Error("Invalid credentials. Try admin / 1234");
                }
            } else {
                // SIGNUP LOGIC
                if (!form.name || !form.email || !form.password) throw new Error("All fields required");
                
                // Create new user object
                const newUser = {
                    id: Date.now(),
                    name: form.name,
                    username: form.email.split('@')[0], // Generate username from email
                    email: form.email,
                    password: form.password,
                    role: form.role
                };
                
                onSignup(newUser);
                alert("Account created! Logging you in...");
                onLogin(newUser);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, 800);
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bgMain}`}>
      <div className={`${theme.bgCard} p-8 rounded-2xl shadow-2xl w-[380px] border ${theme.border} animate-in fade-in zoom-in`}>
        
        <div className="text-center mb-6">
            <div className={`mx-auto w-16 h-16 ${theme.accent} rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-12`}>
                <ChefHat size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className={`text-xs ${theme.textSec}`}>POS Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className={`w-full border ${theme.border} ${theme.inputBg} p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
            />
          )}

          <input
            name="email"
            type="text" // Changed to text to allow simple usernames like 'admin'
            placeholder="Email or Username"
            value={form.email}
            onChange={handleChange}
            required
            className={`w-full border ${theme.border} ${theme.inputBg} p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={`w-full border ${theme.border} ${theme.inputBg} p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500`}
          />

          {!isLogin && (
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full border ${theme.border} ${theme.inputBg} p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
            >
              <option value="employee">Cashier / Staff</option>
              <option value="admin">Admin</option>
            </select>
          )}

          {error && <p className="text-red-500 text-sm font-bold bg-red-100 p-2 rounded text-center">{error}</p>}

          <button disabled={loading} className={`w-full ${theme.accent} text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95`}>
            {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        <p className={`text-sm text-center mt-6 ${theme.textSec}`}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}