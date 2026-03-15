import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Key, ArrowRight, Loader, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, setupRecaptcha } from '../config/firebase';
import api from '../utils/api';

const FirebasePhoneLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        // Setup reCAPTCHA when component mounts
        setupRecaptcha('recaptcha-container');
    }, []);

    useEffect(() => {
        // Countdown timer for resend OTP
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleSendOTP = async (e) => {
        e.preventDefault();

        // Validate phone number format
        if (!phoneNumber.startsWith('+91') || phoneNumber.length !== 13) {
            alert('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            const appVerifier = window.recaptchaVerifier;
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

            setConfirmationResult(confirmation);
            setStep(2);
            setTimer(60); // 60 second countdown
            console.log('✅ OTP sent successfully');
            alert('OTP sent to your phone!');
        } catch (error) {
            console.error('❌ Error sending OTP:', error);

            if (error.code === 'auth/invalid-phone-number') {
                alert('Invalid phone number. Use format: +911234567890');
            } else if (error.code === 'auth/too-many-requests') {
                alert('Too many requests. Please try again later.');
            } else {
                alert('Failed to send OTP. Please try again.');
            }

            // Reset reCAPTCHA
            window.recaptchaVerifier.clear();
            setupRecaptcha('recaptcha-container');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            alert('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            // Verify OTP with Firebase
            const result = await confirmationResult.confirm(otp);
            const user = result.user;

            // Get ID Token
            const idToken = await user.getIdToken();

            console.log('✅ Phone verified successfully:', user.phoneNumber);

            // Send ID Token to backend
            const { data } = await api.post('/auth/firebase-login', {
                idToken
            });

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Trigger event for navbar update
            window.dispatchEvent(new Event('userLoggedIn'));

            console.log('✅ User logged in successfully');
            alert('Login successful!');
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('❌ Error verifying OTP:', error);

            if (error.code === 'auth/invalid-verification-code') {
                alert('Invalid OTP. Please check and try again.');
            } else if (error.code === 'auth/code-expired') {
                alert('OTP expired. Please request a new one.');
                setStep(1);
                setOtp('');
            } else if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Verification failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0) return;

        setOtp('');
        setStep(1);
        setConfirmationResult(null);

        // Reset reCAPTCHA
        window.recaptchaVerifier.clear();
        setupRecaptcha('recaptcha-container');
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
                    <h1 className="text-3xl font-bold text-slate-900">Phone Login</h1>
                    <p className="text-slate-600 mt-2">
                        {step === 1 ? 'Enter your phone number to receive OTP' : 'Enter the OTP sent to your phone'}
                    </p>
                </div>

                <div className="glass-card p-8">
                    {/* Step 1: Enter Phone Number */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative flex items-center">
                                    <div className="absolute left-3 flex items-center gap-1 border-r border-slate-200 pr-2 h-6 pointer-events-none">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600 font-medium text-sm">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        maxLength={10}
                                        value={phoneNumber.replace('+91', '')}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) {
                                                setPhoneNumber('+91' + val);
                                            }
                                        }}
                                        placeholder="1234567890"
                                        className="w-full pl-16 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                                    <Info className="w-3 h-3" /> Enter your 10-digit mobile number
                                </p>
                            </div>

                            {/* reCAPTCHA container */}
                            <div id="recaptcha-container"></div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send OTP <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-2xl tracking-widest"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Sent to {phoneNumber}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg shadow-sky-200 text-lg font-medium text-white bg-primary hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Verify & Login <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={timer > 0}
                                    className="text-sm text-primary hover:text-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-slate-600">
                            Prefer email?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:text-sky-600 transition-colors">
                                Login with Email
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FirebasePhoneLogin;
