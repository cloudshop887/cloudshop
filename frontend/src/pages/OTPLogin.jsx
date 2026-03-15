import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Lock, ArrowRight, RefreshCw, Smartphone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const OTPLogin = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP
    const [phone, setPhone] = useState('');
    const [otp, setOTP] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // Format phone number as user types
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 10) {
            return cleaned;
        }
        return cleaned.slice(0, 10);
    };

    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhone(formatted);
        setError('');
    };

    const handleOTPChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOTP(value);
        setError('');
    };

    const validatePhone = () => {
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phone) {
            setError('Please enter your phone number');
            return false;
        }
        if (!phoneRegex.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }
        return true;
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!validatePhone()) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await api.post('/auth/send-otp', { phone: `+91${phone}` });

            if (data.success) {
                setSuccess('OTP sent successfully!');
                setStep(2);
                setResendTimer(60); // 60 seconds cooldown

                // Show OTP in development mode
                if (data.otp) {
                    console.log('🔐 OTP (Dev Mode):', data.otp);
                    alert(`Development Mode - Your OTP is: ${data.otp}`);
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';
            setError(message);

            // If rate limited, set timer
            if (error.response?.data?.retryAfter) {
                setResendTimer(error.response.data.retryAfter);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await api.post('/auth/resend-otp', { phone: `+91${phone}` });

            if (data.success) {
                setSuccess('OTP resent successfully!');
                setResendTimer(60);

                if (data.otp) {
                    console.log('🔐 OTP (Dev Mode):', data.otp);
                    alert(`Development Mode - Your OTP is: ${data.otp}`);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/verify-otp', {
                phone: `+91${phone}`,
                otp
            });

            if (data.success) {
                // Save token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                // Trigger navbar update
                window.dispatchEvent(new Event('userLoggedIn'));

                setSuccess('Login successful!');

                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'ADMIN') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 500);
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToPhone = () => {
        setStep(1);
        setOTP('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {step === 1 ? 'Login with Phone' : 'Verify OTP'}
                    </h1>
                    <p className="text-slate-600 mt-2">
                        {step === 1
                            ? 'Enter your phone number to receive OTP'
                            : `OTP sent to +91${phone}`
                        }
                    </p>
                </div>

                <div className="glass-card p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Step 1: Phone Number */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-3.5 flex items-center gap-2 text-slate-500">
                                        <Phone className="w-5 h-5" />
                                        <span className="text-sm">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        placeholder="9999999999"
                                        maxLength="10"
                                        className="w-full pl-20 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Enter 10-digit mobile number
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length !== 10}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={otp}
                                        onChange={handleOTPChange}
                                        placeholder="000000"
                                        maxLength="6"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl tracking-widest font-bold"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    6-digit code sent to your phone
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>

                            {/* Resend OTP */}
                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Resend OTP in <span className="font-bold text-primary">{resendTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                        className="text-sm text-primary hover:text-sky-600 font-medium flex items-center gap-1 mx-auto transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            {/* Back to Phone */}
                            <button
                                type="button"
                                onClick={handleBackToPhone}
                                className="w-full text-sm text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                ← Change phone number
                            </button>
                        </form>
                    )}

                    {/* Alternative Login */}
                    <div className="mt-6 text-center border-t border-slate-200 pt-6">
                        <p className="text-slate-600 text-sm mb-3">Or login with</p>
                        <Link
                            to="/login"
                            className="text-primary font-semibold hover:text-sky-600 transition-colors text-sm"
                        >
                            Email & Password
                        </Link>
                    </div>

                    {/* New User */}
                    <div className="mt-4 text-center">
                        <p className="text-slate-600 text-sm">
                            New user?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:text-sky-600 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OTPLogin;
