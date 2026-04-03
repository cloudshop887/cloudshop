import React from 'react';
import Navbar from '../components/Navbar';
import PostAlertForm from '../components/Community/PostAlertForm';

export default function CommunityPost() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-12 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4">
                    <PostAlertForm />
                </div>
            </main>
        </>
    );
}
