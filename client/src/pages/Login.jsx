import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // No global error to clear, just ensure local is empty
        setLoginError('');
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(''); 
        setLoading(true);
        try {
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/dashboard');
            } else {
                setLoginError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            setLoginError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100/50">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <span className="text-2xl">📄</span> {/* Placeholder for logo */}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Welcome to DocumentFlow Pro</h2>
                    <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
                </div>

                {loginError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {loginError}
                    </div>
                )}



                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="email"
                                name="email"
                                className="input-field pl-10"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="password"
                                name="password"
                                className="input-field pl-10"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-blue-700">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary py-2.5 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign in'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-center text-sm text-gray-500 mb-4">Don't have an account yet?</p>
                    <Link 
                        to="/signup" 
                        className="w-full block text-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Create an account
                    </Link>
                </div>
            </div>
            
            <div className="absolute top-8 right-8">
                 {/* Optional: Add Help or About links here */}
            </div>
        </div>
    );
};

export default Login;
