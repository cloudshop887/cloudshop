"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLLMoMr4qGTQw3GaWscH3uIoSy-NTV1LoR5jBcDVHWBIwrm8FBb00CLFrbyDuJo0RzJJ3EOPuR1skvRdx8ICf30';

export default function PushNotificationManager() {
    const [showPopup, setShowPopup] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Check if browser supports push and service worker
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            setIsSubscribed(true);
        } else {
            // Show popup after 3 seconds if not subscribed
            const hasDenied = localStorage.getItem('notifications-denied');
            if (!hasDenied) {
                setTimeout(() => setShowPopup(true), 3000);
            }
        }
    };

    const subscribe = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const subObj = subscription.toJSON();

            await axios.post(`${API_URL}/notifications/subscribe`, {
                endpoint: subObj.endpoint,
                keys: {
                    p256dh: subObj.keys.p256dh,
                    auth: subObj.keys.auth
                }
            });

            setIsSubscribed(true);
            setShowPopup(false);
        } catch (error) {
            console.error('Subscription failed:', error);
        }
    };

    const deny = () => {
        localStorage.setItem('notifications-denied', 'true');
        setShowPopup(false);
    };

    if (!showPopup || isSubscribed) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[100] max-w-sm w-full animate-bounce-in">
            <div className="glass rounded-2xl p-6 shadow-2xl border-blue-500/30">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-600/20 p-2 rounded-lg">
                        <Bell className="text-blue-500 w-6 h-6" />
                    </div>
                    <button onClick={deny} className="text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <h3 className="text-lg font-bold mb-2">Enable Alerts?</h3>
                <p className="text-sm text-slate-400 mb-6">
                    Get real-time notifications for emergency alerts, lost items, and job vacancies in your area.
                </p>
                <div className="flex space-x-3">
                    <button
                        onClick={subscribe}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-bold transition-all text-sm glow"
                    >
                        Allow
                    </button>
                    <button
                        onClick={deny}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl font-bold transition-all text-sm text-slate-400"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    );
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
