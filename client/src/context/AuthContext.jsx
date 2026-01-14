import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/auth/me');
                if (data.success) {
                    setUser(data.data);
                }
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data.success) {
            localStorage.setItem('token', data.token);
            // Fetch user details immediately or decode token
            // For simplicity, let's just refetch 'me' or assume success
            // But we need the user object. Let's fetch me.
            const meRes = await api.get('/auth/me');
            setUser(meRes.data.data);
            return true;
        }
        return false;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data;
        // Don't auto login, user needs to verify
    };

    const verifyEmail = async (email, otp) => {
        const { data } = await api.post('/auth/verify-email', { email, otp });
        if (data.success) {
            localStorage.setItem('token', data.token);
             const meRes = await api.get('/auth/me');
            setUser(meRes.data.data);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyEmail,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
