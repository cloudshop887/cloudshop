import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from 'lucide-react';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Get user data from URL params
                const userParam = searchParams.get('user');
                const error = searchParams.get('error');

                if (error) {
                    console.error('Google auth error:', error);
                    alert('Google authentication failed. Please try again.');
                    navigate('/login');
                    return;
                }

                if (userParam) {
                    // Decode and parse user data
                    const userData = JSON.parse(decodeURIComponent(userParam));

                    // Store token and user info
                    localStorage.setItem('token', userData.token);
                    localStorage.setItem('userInfo', JSON.stringify(userData));

                    // Dispatch event for navbar update
                    window.dispatchEvent(new Event('userLoggedIn'));

                    console.log('✅ Google login successful:', userData.email);

                    // Redirect to home page
                    navigate('/');
                } else {
                    console.error('No user data received');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error processing Google callback:', error);
                alert('Failed to process login. Please try again.');
                navigate('/login');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">
                    Completing Google Sign-In...
                </h2>
                <p className="text-slate-500 mt-2">Please wait while we log you in</p>
            </div>
        </div>
    );
};

export default GoogleCallback;
