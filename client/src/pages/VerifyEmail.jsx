import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || localStorage.getItem('registrationEmail') || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const success = await verifyEmail(email, otp);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                 <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <p className="text-red-500 mb-4">Email address missing.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary w-full">Back to Login</button>
                    <p className="mt-4 text-sm text-gray-500">Or try signing up again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        We sent a verification code to <span className="font-medium text-gray-900">{email}</span>
                    </p>
                    {location.state?.otp && (
                        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                            <strong>Demo Mode:</strong> Your code is <span className="font-mono font-bold text-lg select-all">{location.state.otp}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                        <input
                            type="text"
                            className="input-field text-center text-2xl tracking-widest"
                            placeholder="123456"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary py-2.5 flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify Email'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
