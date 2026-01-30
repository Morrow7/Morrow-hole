"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

type GithubUser = {
    login: string
    name: string | null
    avatarUrl: string
};

type LibraryTrack = {
    id: string
    title: string
    artist: string
    file: string
    cover?: string
};

type QQMusicPlaylistSong = {
    songid: number
    songmid: string
    songname: string
    singers: string[]
    albumName: string
    durationSec: number
};

type QQMusicPlaylist = {
    disstid: string
    name: string
    cover: string
    desc: string
    songs: QQMusicPlaylistSong[]
};

export default function MusicPage() {
    const [oauthClientId, setOauthClientId] = useState(
        process.env.NEXT_PUBLIC_CLIENT_ID ?? process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? ""
    );
    const [oauthError, setOauthError] = useState("");
    const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "authed" | "error">("idle");
    const [authorName, setAuthorName] = useState("");
    const [authorAvatarUrl, setAuthorAvatarUrl] = useState("");
    const [libraryTracks, setLibraryTracks] = useState<LibraryTrack[]>([]);
    const [isLibraryLoading, setIsLibraryLoading] = useState(true);
    const [libraryError, setLibraryError] = useState("");
    const [playingLibraryId, setPlayingLibraryId] = useState<string | null>(null);
    const [playingLibraryName, setPlayingLibraryName] = useState("");
    const [libraryAudioUrl, setLibraryAudioUrl] = useState<string | null>(null);
    const [isSigningLibraryUrl, setIsSigningLibraryUrl] = useState(false);
    const [playlist, setPlaylist] = useState<QQMusicPlaylist | null>(null);
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(true);
    const [playlistError, setPlaylistError] = useState("");
    const [playingSongId, setPlayingSongId] = useState<number | null>(null);
    const [playingSongName, setPlayingSongName] = useState("");
    const [isOpeningQQMusicApp, setIsOpeningQQMusicApp] = useState(false);
    const [qqPlayerNonce, setQqPlayerNonce] = useState(0);
    const [qqWebModalUrl, setQqWebModalUrl] = useState<string | null>(null);
    const [qqWebModalTitle, setQqWebModalTitle] = useState("QQ 音乐");

    const openQQMusicInSite = (url: string, title?: string) => {
        setQqWebModalTitle((title ?? "QQ 音乐").trim() || "QQ 音乐");
        setQqWebModalUrl(url);
    };

    const closeQQMusicModal = () => {
        setQqWebModalUrl(null);
    };

    useEffect(() => {
        if (!qqWebModalUrl) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeQQMusicModal();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [qqWebModalUrl]);

    const tryOpenQQMusicApp = (fallbackUrl?: string) => {
        if (typeof window === "undefined") return;
        if (typeof sessionStorage !== "undefined") {
            const last = Number(sessionStorage.getItem("qqmusic_open_ts") ?? "0");
            const now = Date.now();
            if (now - last < 1500) return;
            sessionStorage.setItem("qqmusic_open_ts", String(now));
        }

        const ua = navigator.userAgent || "";
        const isAndroid = /Android/i.test(ua);
        const isIOS = /iPhone|iPad|iPod/i.test(ua);

        const intentUrl = "intent://#Intent;scheme=qqmusic;package=com.tencent.qqmusic;end";
        const schemeUrl = "qqmusic://";
        const targetUrl = isAndroid ? intentUrl : schemeUrl;

        setIsOpeningQQMusicApp(true);
        let finished = false;

        const stop = () => {
            if (finished) return;
            finished = true;
            setIsOpeningQQMusicApp(false);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };

        const onVisibilityChange = () => {
            if (document.hidden) stop();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        const timer = window.setTimeout(() => {
            stop();
            if (fallbackUrl && (isAndroid || isIOS)) {
                openQQMusicInSite(fallbackUrl, "QQ 音乐");
            }
        }, 1200);

        const a = document.createElement("a");
        a.href = targetUrl;
        a.rel = "noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.setTimeout(() => window.clearTimeout(timer), 2000);
    };

    useEffect(() => {
        if (oauthClientId.trim()) return;
        fetch("/api/auth/client-id")
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                const id = typeof data?.clientId === "string" ? data.clientId : "";
                if (id.trim()) setOauthClientId(id);
            })
            .catch(() => { });
    }, [oauthClientId]);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
        if (!token) {
            setAuthStatus("idle");
            return;
        }
        setAuthStatus("loading");
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((user: GithubUser) => {
                const name = (user.name ?? "").trim() || user.login || "github";
                setAuthorName(name);
                setAuthorAvatarUrl(typeof user.avatarUrl === "string" ? user.avatarUrl : "");
                setAuthStatus("authed");
            })
            .catch(() => {
                setAuthStatus("error");
            });
    }, []);

    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
        if (!token || authStatus !== "authed") {
            setLibraryTracks([]);
            setLibraryAudioUrl(null);
            setPlayingLibraryId(null);
            setPlayingLibraryName("");
            setLibraryError("");
            setIsLibraryLoading(false);
            return;
        }

        setIsLibraryLoading(true);
        fetch("/api/music/tracks", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((data: { tracks?: LibraryTrack[] }) => {
                const tracks = Array.isArray(data?.tracks) ? data.tracks : [];
                setLibraryTracks(tracks);
            })
            .catch(() => {
                setLibraryError("自建曲库读取失败（请确认已登录，并检查服务端配置）");
            })
            .finally(() => setIsLibraryLoading(false));
    }, [authStatus]);

    useEffect(() => {
        const disstid = "8991515350";
        fetch(`/api/qqmusic/playlist?disstid=${encodeURIComponent(disstid)}`)
            .then(res => {
                setPlaylistError("");
                return res.ok ? res.json() : Promise.reject(res.status);
            })
            .then((data: QQMusicPlaylist) => {
                setPlaylist(data && typeof data === "object" ? data : null);
            })
            .catch(() => {
                setPlaylistError("歌单读取失败（可能被平台限制或网络问题）");
            })
            .finally(() => setIsPlaylistLoading(false));
    }, []);

    return (
        <div className="min-h-[100svh] bg-black text-white px-4 py-8 sm:p-8 flex flex-col items-center justify-center gap-6">
            {qqWebModalUrl ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={qqWebModalTitle}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeQQMusicModal();
                    }}
                >
                    <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black/90">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                            <div className="min-w-0">
                                <div className="truncate text-sm text-white/90">{qqWebModalTitle}</div>
                                <div className="truncate text-xs text-white/50">
                                    若弹窗空白，可能是 QQ 音乐禁止被嵌入（需浏览器单独打开登录）
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70 transition-all hover:bg-white/20"
                                    onClick={() => {
                                        if (!qqWebModalUrl) return;
                                        window.open(qqWebModalUrl, "_blank", "noreferrer");
                                    }}
                                >
                                    浏览器打开
                                </button>
                                <button
                                    type="button"
                                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70 transition-all hover:bg-white/20"
                                    onClick={closeQQMusicModal}
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                        <iframe
                            title={qqWebModalTitle}
                            src={qqWebModalUrl}
                            className="h-[80svh] w-full bg-black"
                            allow="autoplay; clipboard-write"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                </div>
            ) : null}

        
            <div className="w-full max-w-7xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-lg font-semibold">自建曲库</div>
                        <div className="mt-1 text-xs text-white/60">需要登录后才能获取与播放</div>
                    </div>
                </div>

                {authStatus !== "authed" ? (
                    <div className="mt-4 text-sm text-white/60">请先在上方登录</div>
                ) : isLibraryLoading ? (
                    <div className="mt-4 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
                    </div>
                ) : libraryError ? (
                    <div className="mt-4 text-sm text-red-400">{libraryError}</div>
                ) : libraryTracks.length === 0 ? (
                    <div className="mt-4 text-sm text-white/60">暂无歌曲（请在 data/music-library.json 配置）</div>
                ) : (
                    <div className="mt-4">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-white/80">
                                    {playingLibraryId ? `正在播放：${playingLibraryName}` : "点击下方歌曲开始播放"}
                                </div>
                                <div className="text-xs text-white/50">
                                    {isSigningLibraryUrl ? "获取播放地址中..." : "播放走站内接口"}
                                </div>
                            </div>
                            {libraryAudioUrl ? (
                                <audio className="mt-3 w-full" src={libraryAudioUrl} controls autoPlay />
                            ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2">
                            {libraryTracks.map((t, idx) => (
                                <div
                                    key={t.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={async () => {
                                        const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
                                        if (!token) {
                                            setLibraryError("请先登录");
                                            return;
                                        }
                                        setIsSigningLibraryUrl(true);
                                        setLibraryError("");
                                        try {
                                            const res = await fetch(`/api/music/signed-url?file=${encodeURIComponent(t.file)}`, {
                                                headers: { Authorization: `Bearer ${token}` },
                                            });
                                            if (!res.ok) throw new Error("signed_url_failed");
                                            const data = await res.json().catch(() => null);
                                            const url = typeof data?.url === "string" ? data.url : "";
                                            if (!url) throw new Error("missing_url");
                                            setPlayingLibraryId(t.id);
                                            setPlayingLibraryName(`${t.title}${t.artist ? ` · ${t.artist}` : ""}`);
                                            setLibraryAudioUrl(url);
                                        } catch {
                                            setLibraryError("获取播放地址失败（请确认 MUSIC_SIGNING_SECRET 已配置）");
                                        } finally {
                                            setIsSigningLibraryUrl(false);
                                        }
                                    }}
                                    onKeyDown={async (e) => {
                                        if (e.key !== "Enter" && e.key !== " ") return;
                                        e.preventDefault();
                                        const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
                                        if (!token) {
                                            setLibraryError("请先登录");
                                            return;
                                        }
                                        setIsSigningLibraryUrl(true);
                                        setLibraryError("");
                                        try {
                                            const res = await fetch(`/api/music/signed-url?file=${encodeURIComponent(t.file)}`, {
                                                headers: { Authorization: `Bearer ${token}` },
                                            });
                                            if (!res.ok) throw new Error("signed_url_failed");
                                            const data = await res.json().catch(() => null);
                                            const url = typeof data?.url === "string" ? data.url : "";
                                            if (!url) throw new Error("missing_url");
                                            setPlayingLibraryId(t.id);
                                            setPlayingLibraryName(`${t.title}${t.artist ? ` · ${t.artist}` : ""}`);
                                            setLibraryAudioUrl(url);
                                        } catch {
                                            setLibraryError("获取播放地址失败（请确认 MUSIC_SIGNING_SECRET 已配置）");
                                        } finally {
                                            setIsSigningLibraryUrl(false);
                                        }
                                    }}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm text-white/90">
                                            {idx + 1}. {t.title}
                                        </div>
                                        <div className="truncate text-xs text-white/60">{t.artist}</div>
                                    </div>
                                    <div className="shrink-0 text-xs text-white/40">播放</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full max-w-7xl rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-lg font-semibold">QQ 音乐歌单</div>
                        <div className="mt-1 text-xs text-white/60">
                            网页内无法强制保持 QQ 音乐登录；可点右侧按钮在站内弹窗里尝试登录。
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => openQQMusicInSite("https://y.qq.com/portal/profile.html", "QQ 音乐网页登录")}
                                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/80 transition-all hover:bg-white/20"
                            >
                                站内登录
                            </button>
                            <button
                                type="button"
                                onClick={() => tryOpenQQMusicApp("https://y.qq.com/n/ryqq/playlist/8991515350")}
                                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-white/80 transition-all hover:bg-white/20 disabled:opacity-50"
                                disabled={isOpeningQQMusicApp}
                            >
                                {isOpeningQQMusicApp ? "正在唤起..." : "打开 QQ 音乐 App"}
                            </button>
                        </div>
                        <div className="text-[11px] text-white/50">
                            若仍显示未登录，通常是浏览器阻止第三方 Cookie 或平台风控限制
                        </div>
                    </div>
                    {playlist?.cover ? (
                        <Image
                            src={playlist.cover}
                            alt={playlist.name || "playlist"}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                            unoptimized
                        />
                    ) : null}
                </div>

                {isPlaylistLoading ? (
                    <div className="mt-4 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
                        <div className="h-4 w-10/12 animate-pulse rounded bg-white/10" />
                    </div>
                ) : playlistError ? (
                    <div className="mt-4 text-sm text-red-400">{playlistError}</div>
                ) : playlist ? (
                    <div className="mt-4">
                        <div className="text-sm text-white/80">{playlist.name}</div>
                        {playlist.desc ? <div className="mt-1 text-xs text-white/50">{playlist.desc}</div> : null}

                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-sm text-white/80">
                                    {playingSongId ? `正在播放：${playingSongName}` : "点击下方歌曲开始播放"}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                    <span>若浏览器阻止自动播放，可点播放器里的播放键</span>
                                    {playingSongId ? (
                                        <button
                                            type="button"
                                            className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-white/70 transition-all hover:bg-white/20"
                                            onClick={() => setQqPlayerNonce(v => v + 1)}
                                        >
                                            重新加载
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            {playingSongId ? (
                                <div className="mt-3 w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                                    <iframe
                                        key={`${playingSongId}-${qqPlayerNonce}`}
                                        frameBorder={0}
                                        className="w-full"
                                        style={{ border: 0, height: 86 }}
                                        src={`https://i.y.qq.com/n2/m/outchain/player/index.html?songid=${encodeURIComponent(String(playingSongId))}&songtype=0`}
                                        title="QQ音乐播放器"
                                        loading="lazy"
                                        allow="autoplay"
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2">
                            {playlist.songs.slice(0, 30).map((s, idx) => (
                                <div
                                    key={s.songmid}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        if (!s.songid) return;
                                        setPlayingSongId(s.songid);
                                        setPlayingSongName(`${s.songname}${(s.singers ?? []).length ? ` · ${(s.singers ?? []).join(" / ")}` : ""}`);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key !== "Enter" && e.key !== " ") return;
                                        e.preventDefault();
                                        if (!s.songid) return;
                                        setPlayingSongId(s.songid);
                                        setPlayingSongName(`${s.songname}${(s.singers ?? []).length ? ` · ${(s.singers ?? []).join(" / ")}` : ""}`);
                                    }}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate text-sm text-white/90">
                                            {idx + 1}. {s.songname}
                                        </div>
                                        <div className="truncate text-xs text-white/60">
                                            {(s.singers ?? []).join(" / ")}{s.albumName ? ` · ${s.albumName}` : ""}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <button
                                            type="button"
                                            className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-white/70 transition-all hover:bg-white/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                tryOpenQQMusicApp(`https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(s.songmid)}`);
                                            }}
                                        >
                                            App 打开
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-white/70 transition-all hover:bg-white/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openQQMusicInSite(
                                                    `https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(s.songmid)}`,
                                                    "QQ 音乐歌曲详情"
                                                );
                                            }}
                                        >
                                            站内详情
                                        </button>
                                        <div className="text-xs text-white/40">播放</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {playlist.songs.length > 30 ? (
                            <div className="mt-3 text-xs text-white/50">仅展示前 30 首</div>
                        ) : null}
                    </div>
                ) : (
                    <div className="mt-4 text-sm text-white/60">暂无数据</div>
                )}
            </div>

        </div>
    )
}
