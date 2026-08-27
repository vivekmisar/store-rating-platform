import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import StoresPage from './pages/StoresPage.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminUserDetailPage from './pages/AdminUserDetailPage.jsx';
import AdminStoresPage from './pages/AdminStoresPage.jsx';
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <HomePage />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute roles={['USER']} />}>
          <Route path="/stores" element={<StoresPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['USER', 'STORE_OWNER', 'ADMIN']} />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/stores" element={<AdminStoresPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={['STORE_OWNER']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
