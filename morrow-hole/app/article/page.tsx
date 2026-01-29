"use client";
import Galaxy from '../../component/Galaxy';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type PostItem = {
    id: number
    title: string
    summary: string
    slug: string
    created_at: string
}

export default function ArticlePage() {
    const router = useRouter();
    const [items, setItems] = useState<PostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const res = await fetch('/api/posts');
                if (!res.ok) return;
                const data = await res.json();
                setItems(Array.isArray(data.items) ? data.items : []);
            } finally {
                setIsLoading(false);
            }
        };

        loadPosts();
    }, []);

    return (
        <div className="relative min-h-screen bg-black text-white  overflow-hidden">
            <div className="absolute inset-0">
                <Galaxy
                    mouseRepulsion
                    mouseInteraction
                    density={1}
                    glowIntensity={0.3}
                    saturation={0}
                    hueShift={140}
                    twinkleIntensity={0.3}
                    rotationSpeed={0.1}
                    repulsionStrength={2}
                    autoCenterRepulsion={0}
                    starSpeed={0.5}
                    speed={1}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <div className="relative z-20 px-6 py-10">
                <h1 className="text-4xl font-bold text-center">Article</h1>
                <div className="mt-8 grid grid-cols-3 ml-10 flex flex-wrap gap-8">
                    {isLoading ? null : items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => router.push(`/article/${item.slug}`)}
                            className="w-80 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-left backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/20"
                        >
                            <div className="text-xl font-semibold text-white/90">{item.title}</div>
                            <div className="mt-2 text-sm text-white/70">{item.summary}</div>
                            <div className="mt-3 text-xs text-white/50">{new Date(item.created_at).toLocaleString()}</div>
                        </button>
                    ))} 
                </div>
            </div>
        </div>
    )
}
