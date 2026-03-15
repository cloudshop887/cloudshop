import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetUrl, setResetUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setResetUrl(null);

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
            setMessage(data.data);
            if (data.resetUrl) {
                setResetUrl(data.resetUrl);
            }
            setEmail('');
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full glass-card p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h1>
                    <p className="text-slate-600">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        <p className="font-medium">{message}</p>
                        {!resetUrl && <p className="mt-2 text-xs">Please check your email inbox and spam folder.</p>}
                    </div>
                )}

                {resetUrl && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-bold mb-2">
                            Development Mode - Instant Access:
                        </p>
                        <p className="text-xs text-blue-600 mb-2">
                            Since you are in development mode, here is the link directly:
                        </p>
                        <a
                            href={resetUrl}
                            className="text-sm text-primary hover:text-sky-700 underline break-all font-medium"
                        >
                            Click here to Reset Password
                        </a>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
