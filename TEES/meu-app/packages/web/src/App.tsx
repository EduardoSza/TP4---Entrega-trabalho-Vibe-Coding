import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import Login from '@/pages/Login';
import StudentDashboard from '@/pages/StudentDashboard';
import AdvisorDashboard from '@/pages/AdvisorDashboard';
import DocumentUpload from '@/pages/DocumentUpload';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'ADVISOR' || user?.role === 'ADMIN') return <AdvisorDashboard />;
  return <StudentDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardRedirect /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><DocumentUpload /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
