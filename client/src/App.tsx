import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { HomePage } from './pages/Home/HomePage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { ProductsPage } from './pages/Dashboard/ProductsPage';
import { UsersPage } from './pages/Dashboard/UsersPage';
import { RolesPage } from './pages/Dashboard/RolesPage';
import { PermissionsPage } from './pages/Dashboard/PermissionsPage';
import { SettingsPage } from './pages/Dashboard/SettingsPage';
import { PlaceholderPage } from './pages/Dashboard/PlaceholderPage';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { useAuthStore } from './store/useAuthStore';

// Admin-only Protected Route - chỉ cho phép Admin truy cập
// User role sẽ bị redirect về trang Home
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAuthStore();

    // Chưa đăng nhập -> redirect về login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Kiểm tra nếu không phải Admin -> redirect về Home
    const isAdmin = user?.roles?.includes('Admin');
    if (!isAdmin) {
        // User cố truy cập trang admin -> redirect về Home
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Admin-Only Dashboard Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <AdminProtectedRoute>
                            <DashboardLayout />
                        </AdminProtectedRoute>
                    }
                >
                    <Route index element={<DashboardPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="customers" element={<UsersPage />} />
                    <Route path="roles" element={<RolesPage />} />
                    <Route path="permissions" element={<PermissionsPage />} />

                    {/* Placeholder Routes */}
                    <Route path="orders" element={<PlaceholderPage title="Orders Management" description="Track and fulfill customer orders efficiently." />} />
                    <Route path="messages" element={<PlaceholderPage title="Messages" description="Centralized communication hub for customers and team." />} />
                    <Route path="integrations" element={<PlaceholderPage title="Integrations" description="Connect your favorite tools and services." />} />
                    <Route path="analytics" element={<PlaceholderPage title="Analytics" description="Deep dive into your business performance metrics." />} />
                    <Route path="invoice" element={<PlaceholderPage title="Invoices" description="Manage billing and generate professional invoices." />} />
                    <Route path="discount" element={<PlaceholderPage title="Discounts" description="Create and manage promotional campaigns." />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="security" element={<PlaceholderPage title="Security" description="Manage security settings, password, and 2FA." />} />
                    <Route path="help" element={<PlaceholderPage title="Help & Support" description="Get help with tutorials, documentation, and support." />} />
                    <Route path="profile" element={<SettingsPage />} />
                    <Route path="billing" element={<PlaceholderPage title="Billing" description="View subscription plans and payment history." />} />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App
