import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const { resetToken } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
           setError('Password must be at least 6 characters');
           return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/auth/resetpassword/${resetToken}`, { password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. Link might be expired.');
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
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-2">Enter your new password below.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="bg-green-50 p-6 rounded-xl text-center">
                        <div className="flex justify-center mb-3">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-green-900 mb-2">Password Updated!</h3>
                        <p className="text-sm text-green-700">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-2.5 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
