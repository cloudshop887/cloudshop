import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import Navbar from '../components/Navbar';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndRedirect();
    }, []);

    const checkAuthAndRedirect = () => {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');

        if (token && userInfo) {
            const parsedUser = JSON.parse(userInfo);

            // Redirect based on user role
            // If an ADMIN is found in the customer session (legacy/error), clear it and stay on Landing
            if (parsedUser.role === 'ADMIN') {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                setLoading(false);
                return;
            }

            // Redirect based on user role
            // Always send users (including shop owners) to the customer dashboard first
            // Shop owners can access their shop via the Navbar "My Shop" link
            navigate('/dashboard');
        } else {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show Landing page for non-logged-in users
    return (
        <>
            <Navbar />
            <Landing />
        </>
    );
};

export default HomePage;
