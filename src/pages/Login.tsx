import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { success, error: authError } = await login(email, password);

        if (success) {
            // Check role to redirect appropriately
            // Does not create a race condition because login updates state synchronously enough for this check 
            // or we can just check the email/logic again here for redirection
            if (email === 'admin@simpsis.com') {
                navigate('/admin');
            } else {
                navigate('/app');
            }
        } else {
            setError(authError || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary-600">SIMPSIS</h1>
                    <p className="text-gray-500 mt-2">Welcome back! Please login to your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                    placeholder="name@simpsis.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-500">
                    <p>Admin Login: admin@simpsis.com / admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
