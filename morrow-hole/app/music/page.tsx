"use client";
export default function MusicPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Music</h1>
            <p className="text-white/70">Coming soon...</p>
            <button
                onClick={() => window.location.href = '/'}
                className="mt-8 px-6 py-2 rounded-full backdrop-blur-md border border-white/10 bg-white/10 hover:bg-white/20 transition-all"
            >
                Back to Home
            </button>
        </div>
    )
}