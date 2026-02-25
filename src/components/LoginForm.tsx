import { useState } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import RippleEffect from '../components/Layout/RippleEffect';
import { login } from '../stores/authStore';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { success, user: loggedInUser, error: authError } = await login(email, password);

        if (success && loggedInUser) {
            // Set cookie for middleware
            document.cookie = `synopgen_user=${JSON.stringify(loggedInUser)}; path=/; max-age=86400`;

            if (loggedInUser.is_admin || loggedInUser.role === 'Admin') {
                window.location.href = '/admin';
            } else {
                window.location.href = '/app';
            }
        } else {
            setError(authError || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8 border border-white/5">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-dark">SynopGen</h1>
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
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-shadow"
                                    placeholder="name@synopgen.com"
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
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-shadow"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-primary text-white font-semibold py-2.5 rounded-lg hover:bg-brand-bright transition-all shadow-lg shadow-brand-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                        {!loading && <RippleEffect />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
