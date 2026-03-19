import React, { useState } from 'react';
import { User, Lock, Loader, Moon, Sun, AtSign, Building2 } from 'lucide-react';

/* --- LOCAL STYLE CONFIGURATION (To ensure no crashes) --- */
const FONTS = {
  sans: '-apple-system, "Segoe UI", "Geist Sans", sans-serif',
};

const COMMON_STYLES = {
  input: (isDarkMode) =>
    `border px-3 py-2 rounded-md text-sm outline-none focus:border-neutral-400 transition-colors ${
      isDarkMode
        ? 'bg-black border-neutral-800 text-white placeholder:text-neutral-600'
        : 'bg-white border-neutral-200 text-black placeholder:text-neutral-400'
    }`,
  select: (isDarkMode) =>
    `border px-3 py-2 rounded-md text-sm outline-none appearance-none focus:border-neutral-400 cursor-pointer transition-colors ${
      isDarkMode
        ? 'bg-black border-neutral-800 text-white'
        : 'bg-white border-neutral-200 text-black'
    }`,
  modal: (isDarkMode) =>
    `rounded-2xl border shadow-2xl ${
      isDarkMode ? 'bg-black border-neutral-800' : 'bg-white border-neutral-200'
    }`,
};

const getTheme = (isDarkMode) => ({
  bg: {
    main: isDarkMode ? 'bg-black' : 'bg-white',
    hover: isDarkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-50',
  },
  text: {
    main: isDarkMode ? 'text-white' : 'text-black',
    secondary: isDarkMode ? 'text-neutral-400' : 'text-neutral-600',
  },
  button: {
    primary: isDarkMode
      ? 'bg-white text-black hover:bg-neutral-200'
      : 'bg-black text-white hover:bg-neutral-800',
    secondary: isDarkMode
      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
      : 'bg-neutral-100 text-black hover:bg-neutral-200',
  },
});

/* --- MAIN COMPONENT --- */
export default function LoginView({ onLogin, isDarkMode, onToggleTheme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    restaurantId: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;
  const theme = getTheme(isDarkMode);
// components/ui/LoginView.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (isLogin) {
      // LOGIN
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      onLogin(data.user, data.access_token); // FastAPI returns access_token
    } else {
     
      const res = await fetch(`${API_URL}/auth/restaurant-signup?restaurant_name=${encodeURIComponent(formData.restaurantId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: "admin",      // Hardcoded for signup
          restaurant_id: 0    // Dummy ID, backend ignores this on signup
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');
      alert('Success! Logging you in...');
      onLogin(data.user, data.access_token);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 antialiased ${theme.bg.main} ${theme.text.main}`}
      style={{ fontFamily: FONTS.sans }}
    >
      <button
        onClick={onToggleTheme}
        className={`absolute top-6 right-6 p-3 rounded-lg ${theme.button.secondary}`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`p-8 w-full max-w-md ${COMMON_STYLES.modal(isDarkMode)}`}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className={`text-sm ${theme.text.secondary}`}>POS System</p>
        </div>

        {error && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm font-medium text-center border ${
              isDarkMode
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-red-50 text-red-600 border-red-200'
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}
            >
              {isLogin ? 'Restaurant ID (Optional)' : 'Restaurant Name'}
            </label>
            <div className="relative group">
              <Building2
                className={`absolute left-3 top-3 ${theme.text.secondary}`}
                size={18}
              />
              <input
                required={!isLogin}
                className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(
                  isDarkMode
                )}`}
                placeholder={isLogin ? 'e.g. 1' : 'My Awesome Restaurant'}
                value={formData.restaurantId}
                onChange={(e) =>
                  setFormData({ ...formData, restaurantId: e.target.value })
                }
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label
                className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}
              >
                Username
              </label>
              <div className="relative group">
                <User
                  className={`absolute left-3 top-3 ${theme.text.secondary}`}
                  size={18}
                />
                <input
                  required
                  className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(
                    isDarkMode
                  )}`}
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div>
            <label
              className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}
            >
              Email
            </label>
            <div className="relative group">
              <AtSign
                className={`absolute left-3 top-3 ${theme.text.secondary}`}
                size={18}
              />
              <input
                type="email"
                required
                className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(
                  isDarkMode
                )}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-medium uppercase mb-2 ${theme.text.secondary}`}
            >
              Password
            </label>
            <div className="relative group">
              <Lock
                className={`absolute left-3 top-3 ${theme.text.secondary}`}
                size={18}
              />
              <input
                type="password"
                required
                className={`w-full pl-10 pr-4 py-2.5 ${COMMON_STYLES.input(
                  isDarkMode
                )}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium flex justify-center items-center gap-2 mt-6 ${theme.button.primary}`}
          >
            {loading && <Loader className="animate-spin" size={18} />}
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className={`font-medium text-sm transition-colors ${theme.text.secondary} ${theme.bg.hover.replace(
              'hover:',
              ''
            )}`}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}