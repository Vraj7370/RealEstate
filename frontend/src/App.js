import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import { Login, Register } from './pages/Auth';
import {
  DashboardOverview, MyFavorites, MyInquiries,
  MyVisits, MyPayments, SupportTickets,
} from './pages/dashboard/DashboardPages';
import ListProperty from './pages/dashboard/ListProperty';
import { MyProperties, OwnerVisits, Profile, ReceivedInquiries } from './pages/dashboard/OwnerPages';
import AdminPanel from './pages/admin/AdminPanel';
import About from './pages/About';
import './index.css';

// ── Route Guards ──────────────────────────────

/** Any logged-in user */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

/** ADMIN only */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
};

/** OWNER, AGENT, ADMIN */
const OwnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!['OWNER', 'AGENT', 'ADMIN'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/** Redirect to home if already logged in */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return !user ? children : <Navigate to="/" replace />;
};

const Loader = () => (
  <div className="page-loader"><div className="spinner" /></div>
);

// ── Layouts ──────────────────────────────────

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const NotFound = () => (
  <MainLayout>
    <div className="container section text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 90, fontWeight: 700, color: 'var(--border)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>404</div>
      <h2 style={{ marginBottom: 8 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
      <a href="/" className="btn btn-primary">← Go Home</a>
    </div>
  </MainLayout>
);

// ── App ───────────────────────────────────────

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 13, maxWidth: 380, borderRadius: '10px' },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/"             element={<MainLayout><Home /></MainLayout>} />
        <Route path="/properties"   element={<MainLayout><Properties /></MainLayout>} />
        <Route path="/properties/:id" element={<MainLayout><PropertyDetail /></MainLayout>} />
        <Route path="/about"        element={<MainLayout><About /></MainLayout>} />
        <Route path="/contact"      element={<MainLayout><About /></MainLayout>} />

        {/* ── Auth ── */}
        <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* ── Dashboard (all roles) ── */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><Navbar /><DashboardLayout /></PrivateRoute>}
        >
          <Route index                element={<DashboardOverview />} />
          <Route path="profile"       element={<Profile />} />
          <Route path="favorites"     element={<MyFavorites />} />
          <Route path="inquiries"     element={<MyInquiries />} />
          <Route path="visits"        element={<MyVisits />} />
          <Route path="payments"      element={<MyPayments />} />
          <Route path="support"       element={<SupportTickets />} />

          {/* Owner / Agent / Admin only */}
          <Route path="list-property" element={<OwnerRoute><ListProperty /></OwnerRoute>} />
          <Route path="my-properties" element={<OwnerRoute><MyProperties /></OwnerRoute>} />
          <Route path="owner-visits"  element={<OwnerRoute><OwnerVisits /></OwnerRoute>} />
          <Route path="owner-inquiries" element={<OwnerRoute><ReceivedInquiries /></OwnerRoute>} />
        </Route>

        {/* ── Admin Panel ── */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Navbar />
              <div style={{ padding: '32px', minHeight: 'calc(100vh - 68px)', background: 'var(--bg)' }}>
                <AdminPanel />
              </div>
            </AdminRoute>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);


export default App;
