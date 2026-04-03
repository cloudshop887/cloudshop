import React from 'react';
import PostAlertForm from '../components/Community/PostAlertForm';

export default function CommunityPost() {
    return (
        <main className="min-h-screen pt-8 pb-12 bg-slate-50 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <PostAlertForm />
            </div>
        </main>
    );
}
