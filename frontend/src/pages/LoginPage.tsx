import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data.user, response.data.accessToken);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Username</label>
            <Input 
              type="text" 
              placeholder="admin" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
