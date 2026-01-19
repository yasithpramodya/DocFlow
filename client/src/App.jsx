import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import RegisterDocument from './pages/RegisterDocument';
import TrackDocument from './pages/TrackDocument';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (!loading && user) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
};

function App() {
  return (
    <Router>
        <AuthProvider>
            <ThemeProvider>
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/signup" element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    } />
                    <Route path="/verify-email" element={
                        <PublicRoute>
                            <VerifyEmail />
                        </PublicRoute>
                    } />
                    <Route path="/forgot-password" element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    } />
                    <Route path="/reset-password/:resetToken" element={
                        <PublicRoute>
                            <ResetPassword />
                        </PublicRoute>
                    } />
                    
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/register" element={
                        <ProtectedRoute>
                            <RegisterDocument />
                        </ProtectedRoute>
                    } />
                    <Route path="/document/:id" element={
                        <ProtectedRoute>
                            <TrackDocument />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </ThemeProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;
