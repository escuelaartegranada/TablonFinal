import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { isSupabaseConfigured } from './lib/supabase';

// Layouts
import AdminLayout from './components/admin/AdminLayout';

// Pages
import PublicBoard from './pages/public/PublicBoard';
import AnnouncementDetail from './pages/public/AnnouncementDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminAnnouncementForm from './pages/admin/AdminAnnouncementForm';
import AdminSettings from './pages/admin/AdminSettings';
import SetupRequired from './components/SetupRequired';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    if (isSupabaseConfigured) {
      initialize();
    }
  }, [initialize]);

  if (!isSupabaseConfigured) {
    return <SetupRequired />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicBoard />} />
        <Route path="/anuncio/:slug" element={<AnnouncementDetail />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="anuncios" element={<AdminAnnouncements />} />
          <Route path="anuncios/nuevo" element={<AdminAnnouncementForm />} />
          <Route path="anuncios/:id" element={<AdminAnnouncementForm />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
