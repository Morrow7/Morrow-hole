"use client";
import Galaxy from '../../component/Galaxy';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

type DailyPostItem = {
    id: number
    content: string
    media_type: 'none' | 'image' | 'video'
    created_at: string
    has_media: 0 | 1
    likes_count: number
    comments_count: number
}

export default function ArticlePage() {
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postMode, setPostMode] = useState<'text' | 'image' | 'video'>('text');
    const [postText, setPostText] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState('');
    const [items, setItems] = useState<DailyPostItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [oauthClientId, setOauthClientId] = useState(
        process.env.NEXT_PUBLIC_CLIENT_ID ?? process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? ""
    );
    const [oauthError, setOauthError] = useState("");
    const [likedPostIds, setLikedPostIds] = useState<number[]>([]);
    const [commentBoxForId, setCommentBoxForId] = useState<number | null>(null);
    const [commentDraft, setCommentDraft] = useState("");
    const [isCommentPosting, setIsCommentPosting] = useState(false);
    const [commentError, setCommentError] = useState("");

    const normalizeDailyPostItem = (raw: unknown): DailyPostItem | null => {
        if (!raw || typeof raw !== 'object') return null;
        const r = raw as Record<string, unknown>;

        const id = typeof r.id === 'number' ? r.id : Number(r.id);
        if (!Number.isFinite(id) || id <= 0) return null;

        const content = typeof r.content === 'string' ? r.content : '';
        const mediaType = r.media_type === 'image' || r.media_type === 'video' || r.media_type === 'none' ? r.media_type : 'none';
        const createdAt = typeof r.created_at === 'string' ? r.created_at : new Date().toISOString();
        const hasMedia = r.has_media === 1 || r.has_media === 0 ? r.has_media : 0;
        const likesCount = typeof r.likes_count === 'number' && Number.isFinite(r.likes_count) ? r.likes_count : 0;
        const commentsCount = typeof r.comments_count === 'number' && Number.isFinite(r.comments_count) ? r.comments_count : 0;

        return {
            id,
            content,
            media_type: mediaType,
            created_at: createdAt,
            has_media: hasMedia,
            likes_count: likesCount,
            comments_count: commentsCount,
        };
    };


    useEffect(() => {
        return () => {
            if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
        };
    }, [mediaPreviewUrl]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/daily-posts');
                if (!res.ok) return;
                const data: unknown = await res.json().catch(() => null);
                const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
                const rawItems = obj && Array.isArray(obj.items) ? obj.items : [];
                setItems(rawItems.map(normalizeDailyPostItem).filter((x): x is DailyPostItem => x !== null));
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/auth/client-id", { cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json().catch(() => null);
            const id = typeof data?.clientId === "string" ? data.clientId : "";
            if (id) setOauthClientId(id);
        })();
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("daily_liked_post_ids") ?? "[]";
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setLikedPostIds(parsed.filter((x): x is number => typeof x === "number" && Number.isFinite(x)));
            }
        } catch { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("daily_liked_post_ids", JSON.stringify(likedPostIds));
        } catch { }
    }, [likedPostIds]);

    const closePostModal = useCallback(() => {
        if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
        setIsPostModalOpen(false);
        setPostMode('text');
        setPostText('');
        setMediaFile(null);
        setMediaPreviewUrl('');
        setIsPosting(false);
        setPostError('');
    }, [mediaPreviewUrl]);

    useEffect(() => {
        if (!isPostModalOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePostModal();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isPostModalOpen, closePostModal]);

    const handlePublish = async () => {
        setIsPosting(true);
        setPostError('');
        try {
            const form = new FormData();
            form.set('text', postText);
            form.set('mode', postMode);
            if (mediaFile) form.set('file', mediaFile);

            const res = await fetch('/api/daily-posts', { method: 'POST', body: form });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setPostError(typeof data?.message === 'string' ? data.message : '发布失败');
                return;
            }

            if (data?.item) {
                const next = normalizeDailyPostItem(data.item as unknown);
                if (!next) {
                    closePostModal();
                    return;
                }
                setItems(prev => [
                    next,
                    ...prev,
                ]);
            }

            closePostModal();
        } finally {
            setIsPosting(false);
        }
    };

    const switchPostMode = (mode: 'text' | 'image' | 'video') => {
        setPostMode(mode);
        setMediaFile(null);
        if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
        setMediaPreviewUrl('');
    };

    const toggleLike = (postId: number) => {
        const isLiked = likedPostIds.includes(postId);
        setLikedPostIds(prev => (isLiked ? prev.filter(x => x !== postId) : [...prev, postId]));
        setItems(prev =>
            prev.map(it => {
                if (it.id !== postId) return it;
                const current = Number.isFinite(it.likes_count) ? it.likes_count : 0;
                return { ...it, likes_count: Math.max(0, current + (isLiked ? -1 : 1)) };
            })
        );
    };

    const submitComment = async (postId: number) => {
        const content = commentDraft.trim();
        if (!content) return;
        setIsCommentPosting(true);
        setCommentError("");
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: `daily:${postId}`,
                    name: "匿名",
                    content,
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setCommentError(typeof data?.message === "string" ? data.message : "评论失败");
                return;
            }
            setItems(prev =>
                prev.map(it => {
                    if (it.id !== postId) return it;
                    const current = Number.isFinite(it.comments_count) ? it.comments_count : 0;
                    return { ...it, comments_count: current + 1 };
                })
            );
            setCommentDraft("");
            setCommentBoxForId(null);
        } finally {
            setIsCommentPosting(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white">
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
                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            />

            <div className="relative z-10 p-8">
                <div className="mx-auto w-full max-w-8xl">
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-3 lg:sticky lg:top-8">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                                <div className="text-lg font-semibold">登录与发帖</div>
                                <div className="mt-4 space-y-3">
                                    <button
                                        className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20"
                                        onClick={() => {
                                            const clientId = oauthClientId.trim();
                                            if (!clientId) {
                                                setOauthError("未读取到 GitHub Client ID，请确认已在 Vercel 配置 NEXT_PUBLIC_CLIENT_ID 或 NEXT_PUBLIC_GITHUB_CLIENT_ID 并重新部署");
                                                return;
                                            }
                                            setOauthError("");
                                            const redirectUri = `${window.location.origin}/api/auth/callback`;
                                            const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('read:user')}`;
                                            window.location.href = authUrl;
                                        }}
                                    >
                                        github登录
                                    </button>
                                    {oauthError ? <div className="text-xs text-red-400">{oauthError}</div> : null}
                                    <button
                                        className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20"
                                        onClick={() => setIsPostModalOpen(true)}
                                    >
                                        发帖
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-9">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                                <div className="text-lg font-semibold">帖子内容</div>
                                <div className="mt-4 space-y-3">
                                    {isLoading ? null : items.length === 0 ? (
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
                                            暂无帖子
                                        </div>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                                <div className="text-xs text-white/50">{new Date(item.created_at).toLocaleString()}</div>
                                                {item.content ? <div className="mt-2 whitespace-pre-wrap text-white/90">{item.content}</div> : null}
                                                {item.has_media ? (
                                                    item.media_type === 'image' ? (
                                                        <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl border border-white/10">
                                                            <Image
                                                                src={`/api/daily-posts/media?id=${item.id}`}
                                                                alt="media"
                                                                fill
                                                                className="object-contain"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    ) : item.media_type === 'video' ? (
                                                        <video
                                                            src={`/api/daily-posts/media?id=${item.id}`}
                                                            controls
                                                            className="mt-3 max-h-80 w-full rounded-xl border border-white/10"
                                                        />
                                                    ) : null
                                                ) : null}
                                                <div className="mt-4 flex items-center justify-end gap-2 text-xs text-white/70">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleLike(item.id)}
                                                        className={`rounded-full border border-white/10 px-3 py-1 transition-all hover:bg-white/10 ${likedPostIds.includes(item.id) ? 'bg-white/15 text-white' : 'bg-white/5 text-white/80'}`}
                                                    >
                                                        赞 {Number.isFinite(item.likes_count) ? item.likes_count : 0}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCommentError("");
                                                            setCommentDraft("");
                                                            setCommentBoxForId(prev => (prev === item.id ? null : item.id));
                                                        }}
                                                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/80 transition-all hover:bg-white/10"
                                                    >
                                                        评 {Number.isFinite(item.comments_count) ? item.comments_count : 0}
                                                    </button>
                                                </div>
                                                {commentBoxForId === item.id ? (
                                                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                                                        {commentError ? <div className="text-xs text-red-400">{commentError}</div> : null}
                                                        <textarea
                                                            value={commentDraft}
                                                            onChange={e => setCommentDraft(e.target.value)}
                                                            placeholder="写下你的评论"
                                                            rows={3}
                                                            className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                                                        />
                                                        <div className="mt-2 flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/10"
                                                                onClick={() => {
                                                                    setCommentError("");
                                                                    setCommentDraft("");
                                                                    setCommentBoxForId(null);
                                                                }}
                                                            >
                                                                取消
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={isCommentPosting || !commentDraft.trim()}
                                                                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20 disabled:opacity-50"
                                                                onClick={() => submitComment(item.id)}
                                                            >
                                                                {isCommentPosting ? '发送中...' : '发送'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                isPostModalOpen ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/70"
                            onClick={closePostModal}
                            aria-label="Close"
                        />
                        <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-black/80 p-5 backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold">发帖</div>
                                <button
                                    type="button"
                                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/80 transition-all hover:bg-white/20"
                                    onClick={closePostModal}
                                >
                                    关闭
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => switchPostMode('text')}
                                    className={`rounded-full border border-white/10 px-4 py-2 text-sm transition-all hover:bg-white/10 ${postMode === 'text' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/80'}`}
                                >
                                    仅文字
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchPostMode('image')}
                                    className={`rounded-full border border-white/10 px-4 py-2 text-sm transition-all hover:bg-white/10 ${postMode === 'image' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/80'}`}
                                >
                                    上传图片
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchPostMode('video')}
                                    className={`rounded-full border border-white/10 px-4 py-2 text-sm transition-all hover:bg-white/10 ${postMode === 'video' ? 'bg-white/15 text-white' : 'bg-white/5 text-white/80'}`}
                                >
                                    上传视频
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                {postError ? <div className="text-sm text-red-400">{postError}</div> : null}
                                {postMode === 'image' || postMode === 'video' ? (
                                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm text-white/80">
                                                {postMode === 'image' ? '选择一张图片' : '选择一个视频'}
                                            </div>
                                            <label className="cursor-pointer rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20">
                                                选择文件
                                                <input
                                                    type="file"
                                                    accept={postMode === 'image' ? 'image/*' : 'video/*'}
                                                    className="hidden"
                                                    onChange={e => {
                                                        const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                                        if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
                                                        setMediaFile(f);
                                                        setMediaPreviewUrl(f ? URL.createObjectURL(f) : '');
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {mediaFile ? (
                                            <div className="mt-3">
                                                <div className="text-xs text-white/50">{mediaFile.name}</div>
                                                {postMode === 'image' ? (
                                                    <div className="relative mt-3 h-64 w-full overflow-hidden rounded-xl border border-white/10">
                                                        <Image src={mediaPreviewUrl} alt="preview" fill className="object-contain" unoptimized />
                                                    </div>
                                                ) : (
                                                    <video
                                                        src={mediaPreviewUrl}
                                                        controls
                                                        className="mt-3 max-h-64 w-full rounded-xl border border-white/10"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="mt-3 text-xs text-white/50">未选择文件</div>
                                        )}
                                    </div>
                                ) : null}

                                <textarea
                                    value={postText}
                                    onChange={e => setPostText(e.target.value)}
                                    placeholder="写点什么..."
                                    rows={6}
                                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
                                />

                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/10"
                                        onClick={closePostModal}
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20 disabled:opacity-50"
                                        disabled={!postText.trim() && !mediaFile}
                                        onClick={() => {
                                            if (isPosting) return;
                                            handlePublish();
                                        }}
                                    >
                                        {isPosting ? '发布中...' : '发布'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null
            }
        </div >
    )
}
