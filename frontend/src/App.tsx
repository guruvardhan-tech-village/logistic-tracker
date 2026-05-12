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
import DriverLayout from '@/pages/DriverLayout';
import DriverDashboard from '@/pages/DriverDashboard';
import CustomerLayout from '@/pages/CustomerLayout';
import CustomerDashboard from '@/pages/CustomerDashboard';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     if (user.role === 'ROLE_DRIVER') return <Navigate to="/driver" replace />;
     if (user.role === 'ROLE_CUSTOMER') return <Navigate to="/customer" replace />;
     return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // Theme is managed by useThemeStore

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
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

        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['ROLE_DRIVER']}>
            <DriverLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DriverDashboard />} />
        </Route>

        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerDashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
