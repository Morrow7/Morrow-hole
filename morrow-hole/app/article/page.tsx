"use client";
import Galaxy from '../../component/Galaxy';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type CommentItem = {
    id: number
    post_slug: string
    author: string
    content: string
    created_at: string
}

type PostItem = {
    id: number
    title: string
    summary: string
    slug: string
    created_at: string
    comments?: CommentItem[]
}

export default function ArticlePage() {
    const router = useRouter();
    const [items, setItems] = useState<PostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openCommentsSlug, setOpenCommentsSlug] = useState<string>("");

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const res = await fetch('/api/posts?includeComments=1');
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
            <div className="relative z-20 px-4 py-8 sm:px-6 sm:py-10">
                <div className="mx-auto w-full max-w-6xl">
                    <h1 className="text-2xl font-bold text-center sm:text-4xl">Article</h1>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                        {isLoading ? null : items.map(item => (
                            <div
                                key={item.id}
                                className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-left backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/20"
                            >
                                <button
                                    type="button"
                                    onClick={() => router.push(`/article/${item.slug}`)}
                                    className="block w-full text-left"
                                >
                                    <div className="text-lg font-semibold text-white/90 sm:text-xl">{item.title}</div>
                                    <div className="mt-2 text-sm text-white/70">{item.summary}</div>
                                    <div className="mt-3 text-xs text-white/50">{new Date(item.created_at).toLocaleString()}</div>
                                </button>

                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setOpenCommentsSlug(prev => (prev === item.slug ? "" : item.slug))}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-all hover:bg-white/10"
                                        aria-expanded={openCommentsSlug === item.slug}
                                    >
                                        评论 {Array.isArray(item.comments) ? item.comments.length : 0}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/article/${item.slug}`)}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-all hover:bg-white/10"
                                    >
                                        查看正文
                                    </button>
                                </div>

                                {openCommentsSlug === item.slug ? (
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                                        {!Array.isArray(item.comments) || item.comments.length === 0 ? (
                                            <div className="text-xs text-white/45">暂无评论</div>
                                        ) : (
                                            <div className="max-h-56 space-y-2 overflow-auto pr-1">
                                                {item.comments.map(c => (
                                                    <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="text-xs font-medium text-white/80">{c.author}</div>
                                                            <div className="text-[11px] text-white/35">{new Date(c.created_at).toLocaleString()}</div>
                                                        </div>
                                                        <div className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-white/80">{c.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
