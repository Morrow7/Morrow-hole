"use client";
import Galaxy from '../../component/Galaxy';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
})

function formatDate(value: string) {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return dateFormatter.format(d)
}

type CommentItem = {
    id: number
    post_slug: string
    author: string
    content: string
    created_at: string
}

type LikeItem = {
    id: number
    post_slug: string
    client_id: string
    author: string
    avatar_url: string | null
    created_at: string
}

type PostItem = {
    id: number
    title: string
    summary: string
    slug: string
    created_at: string
    comments?: CommentItem[]
    likes?: LikeItem[]
}

export default function ArticlePage() {
    const router = useRouter();
    const [items, setItems] = useState<PostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openCommentsSlug, setOpenCommentsSlug] = useState<string>("");
    const [openLikesSlug, setOpenLikesSlug] = useState<string>("");
    const [commentsBySlug, setCommentsBySlug] = useState<Record<string, CommentItem[]>>({});
    const [likesBySlug, setLikesBySlug] = useState<Record<string, LikeItem[]>>({});
    const [loadingCommentsSlug, setLoadingCommentsSlug] = useState<string>("");
    const [loadingLikesSlug, setLoadingLikesSlug] = useState<string>("");
    const [isGalaxyActive, setIsGalaxyActive] = useState(false);

    useEffect(() => {
        const ac = new AbortController();
        const loadPosts = async () => {
            try {
                const firstRes = await fetch('/api/posts?limit=12', { signal: ac.signal });
                if (firstRes.ok) {
                    const firstData = await firstRes.json().catch(() => null);
                    const firstItems = Array.isArray(firstData?.items) ? firstData.items : [];
                    setItems(firstItems);
                }
                setIsLoading(false);

                const restRes = await fetch('/api/posts?limit=12&offset=12', { signal: ac.signal });
                if (!restRes.ok) return;
                const restData = await restRes.json().catch(() => null);
                const restItems = Array.isArray(restData?.items) ? restData.items : [];
                if (restItems.length === 0) return;
                setItems(prev => {
                    const seen = new Set(prev.map(x => x.slug));
                    const merged = [...prev];
                    for (const it of restItems) {
                        if (!it?.slug || seen.has(it.slug)) continue;
                        seen.add(it.slug);
                        merged.push(it);
                    }
                    return merged;
                });
            } catch {
                setIsLoading(false);
            }
        };

        loadPosts();
        return () => ac.abort();
    }, []);

    useEffect(() => {
        if (isLoading) return;
        if (isGalaxyActive) return;

        let cancelled = false;
        const activate = () => {
            if (cancelled) return;
            setIsGalaxyActive(true);
        };

        const w = window as unknown as {
            requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
            cancelIdleCallback?: (id: number) => void
        };

        const id = typeof w.requestIdleCallback === 'function'
            ? w.requestIdleCallback(activate, { timeout: 600 })
            : window.setTimeout(activate, 180);

        return () => {
            cancelled = true;
            if (typeof w.cancelIdleCallback === 'function') {
                w.cancelIdleCallback(id as unknown as number);
            } else {
                window.clearTimeout(id as unknown as number);
            }
        };
    }, [isLoading, isGalaxyActive]);

    const openArticle = useCallback((slug: string) => {
        router.push(`/article/${slug}`);
    }, [router]);

    const loadComments = useCallback(async (slug: string) => {
        if (!slug) return;
        if (Array.isArray(commentsBySlug[slug])) return;
        setLoadingCommentsSlug(slug);
        try {
            const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setCommentsBySlug(prev => ({ ...prev, [slug]: [] }));
                return;
            }
            const list = Array.isArray(data?.items) ? data.items : [];
            setCommentsBySlug(prev => ({ ...prev, [slug]: list }));
        } finally {
            setLoadingCommentsSlug(prev => (prev === slug ? "" : prev));
        }
    }, [commentsBySlug]);

    const loadLikes = useCallback(async (slug: string) => {
        if (!slug) return;
        if (Array.isArray(likesBySlug[slug])) return;
        setLoadingLikesSlug(slug);
        try {
            const res = await fetch(`/api/likes?slug=${encodeURIComponent(slug)}`);
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setLikesBySlug(prev => ({ ...prev, [slug]: [] }));
                return;
            }
            const list = Array.isArray(data?.items) ? data.items : [];
            setLikesBySlug(prev => ({ ...prev, [slug]: list }));
        } finally {
            setLoadingLikesSlug(prev => (prev === slug ? "" : prev));
        }
    }, [likesBySlug]);

    const toggleComments = useCallback((slug: string) => {
        setOpenCommentsSlug(prev => {
            const next = prev === slug ? "" : slug;
            if (next) loadComments(next);
            return next;
        });
        setOpenLikesSlug("");
    }, [loadComments]);

    const toggleLikes = useCallback((slug: string) => {
        setOpenLikesSlug(prev => {
            const next = prev === slug ? "" : slug;
            if (next) loadLikes(next);
            return next;
        });
        setOpenCommentsSlug("");
    }, [loadLikes]);

    return (
        <div className="relative min-h-screen bg-black text-white  overflow-hidden">
            <div className="absolute inset-0">
                {isGalaxyActive ? <GalaxyBackground /> : null}
            </div>
            <div className="relative z-20 px-4 py-8 sm:px-6 sm:py-10">
                <div className="mx-auto w-full max-w-6xl">
                    <h1 className="text-2xl font-bold text-center sm:text-4xl">Article</h1>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                        {isLoading ? (
                            Array.from({ length: 9 }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-left backdrop-blur-md shadow-lg"
                                >
                                    <div className="h-5 w-2/3 rounded bg-white/10" />
                                    <div className="mt-3 h-4 w-full rounded bg-white/10" />
                                    <div className="mt-2 h-4 w-5/6 rounded bg-white/10" />
                                    <div className="mt-4 h-8 w-full rounded-full bg-white/10" />
                                </div>
                            ))
                        ) : items.map(item => (
                            <PostCard
                                key={item.id}
                                item={item}
                                isCommentsOpen={openCommentsSlug === item.slug}
                                isLikesOpen={openLikesSlug === item.slug}
                                onOpen={openArticle}
                                onToggleComments={toggleComments}
                                onToggleLikes={toggleLikes}
                                comments={commentsBySlug[item.slug]}
                                likes={likesBySlug[item.slug]}
                                isCommentsLoading={loadingCommentsSlug === item.slug}
                                isLikesLoading={loadingLikesSlug === item.slug}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const GalaxyBackground = memo(function GalaxyBackground() {
    return (
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
    );
});

const PostCard = memo(function PostCard(props: {
    item: PostItem
    isCommentsOpen: boolean
    isLikesOpen: boolean
    onOpen: (slug: string) => void
    onToggleComments: (slug: string) => void
    onToggleLikes: (slug: string) => void
    comments?: CommentItem[]
    likes?: LikeItem[]
    isCommentsLoading: boolean
    isLikesLoading: boolean
}) {
    const { item, isCommentsOpen, isLikesOpen, onOpen, onToggleComments, onToggleLikes, comments, likes, isCommentsLoading, isLikesLoading } = props;

    const createdAtLabel = useMemo(() => formatDate(item.created_at), [item.created_at]);
    const hasPanelOpen = isCommentsOpen || isLikesOpen;
    const commentsCount = Array.isArray(comments) ? comments.length : null;
    const likesCount = Array.isArray(likes) ? likes.length : null;
    const commentsLabel = commentsCount === null ? (isCommentsLoading ? "评论 ..." : "评论") : `评论 ${commentsCount}`;
    const likesLabel = likesCount === null ? (isLikesLoading ? "点赞 ..." : "点赞") : `点赞 ${likesCount}`;

    return (
        <div
            className={`relative w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-left backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/20 ${hasPanelOpen ? "z-30" : ""}`}
            style={{ contentVisibility: hasPanelOpen ? "visible" : "auto", containIntrinsicSize: "220px 260px" }}
        >
            <button
                type="button"
                onClick={() => onOpen(item.slug)}
                className="block w-full text-left"
            >
                <div className="text-lg font-semibold text-white/90 sm:text-xl">{item.title}</div>
                <div className="mt-2 text-sm text-white/70">{item.summary}</div>
                <div className="mt-3 text-xs text-white/50">{createdAtLabel}</div>
            </button>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onToggleComments(item.slug)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-all hover:bg-white/10"
                        aria-expanded={isCommentsOpen}
                    >
                        {commentsLabel}
                    </button>
                    <button
                        type="button"
                        onClick={() => onToggleLikes(item.slug)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-all hover:bg-white/10"
                        aria-expanded={isLikesOpen}
                    >
                        {likesLabel}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => onOpen(item.slug)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition-all hover:bg-white/10"
                >
                    查看正文
                </button>
            </div>

            {isCommentsOpen ? (
                <div
                    className="absolute left-0 right-0 top-full mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                    style={{ contain: "layout paint" }}
                >
                    {isCommentsLoading ? (
                        <div className="space-y-2">
                            <div className="h-12 animate-pulse rounded-xl bg-white/5" />
                            <div className="h-12 animate-pulse rounded-xl bg-white/5" />
                        </div>
                    ) : !Array.isArray(comments) || comments.length === 0 ? (
                        <div className="text-xs text-white/45">暂无评论</div>
                    ) : (
                        <div className="max-h-56 space-y-2 overflow-auto pr-1">
                            {comments.map(c => (
                                <CommentRow key={c.id} item={c} />
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            {isLikesOpen ? (
                <div
                    className="absolute left-0 right-0 top-full mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                    style={{ contain: "layout paint" }}
                >
                    {isLikesLoading ? (
                        <div className="space-y-2">
                            <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                            <div className="h-10 animate-pulse rounded-xl bg-white/5" />
                        </div>
                    ) : !Array.isArray(likes) || likes.length === 0 ? (
                        <div className="text-xs text-white/45">暂无点赞</div>
                    ) : (
                        <div className="max-h-56 space-y-2 overflow-auto pr-1">
                            {likes.map(l => (
                                <LikeRow key={l.id} item={l} />
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
});

const CommentRow = memo(function CommentRow(props: { item: CommentItem }) {
    const { item } = props;
    const createdAtLabel = useMemo(() => formatDate(item.created_at), [item.created_at]);
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-white/80">{item.author}</div>
                <div className="text-[11px] text-white/35">{createdAtLabel}</div>
            </div>
            <div className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-white/80">{item.content}</div>
        </div>
    );
});

const LikeRow = memo(function LikeRow(props: { item: LikeItem }) {
    const { item } = props;
    const createdAtLabel = useMemo(() => formatDate(item.created_at), [item.created_at]);
    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="min-w-0 truncate text-xs font-medium text-white/80">{item.author}</div>
            <div className="shrink-0 text-[11px] text-white/35">{createdAtLabel}</div>
        </div>
    );
});
