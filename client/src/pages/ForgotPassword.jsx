import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/forgotpassword', { email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Email could not be sent. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100/50">
                <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Forgot Password?</h2>
                    <p className="text-gray-500 text-sm mt-2">Enter your email and we'll send you a reset link.</p>
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
                        <h3 className="text-lg font-bold text-green-900 mb-2">Email Sent!</h3>
                        <p className="text-sm text-green-700">
                            Check your inbox for a link to reset your password. The link expires in 10 minutes.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-2.5 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
