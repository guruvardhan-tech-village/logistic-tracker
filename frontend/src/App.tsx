import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/pages/DashboardLayout';
import DashboardHome from '@/pages/DashboardHome';
import LiveMap from '@/pages/LiveMap';
import VehicleList from '@/pages/VehicleList';
import VehicleDetail from '@/pages/VehicleDetail';
import GeofencingView from '@/pages/GeofencingView';
import Settings from '@/pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  // Theme is managed by useThemeStore

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="vehicles" element={<VehicleList />} />
          <Route path="vehicles/:id" element={<VehicleDetail />} />
          <Route path="geofencing" element={<GeofencingView />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
