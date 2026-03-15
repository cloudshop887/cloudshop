import Navbar from "@/components/Navbar";
import PostAlertForm from "@/components/PostAlertForm";

export default function PostPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4">
                <PostAlertForm />
            </div>
        </main>
    );
}
