import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { Suppliers } from './pages/Suppliers';
import { SupplierDetails } from './pages/SupplierDetails';
import { AIChat } from './pages/AIChat';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="ai-chat" element={<AIChat />} />
        </Route>
        <Route path="/products/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
        <Route path="/suppliers/:id" element={<PrivateRoute><SupplierDetails /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
