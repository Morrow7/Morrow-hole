"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

type PostDetail = {
  title: string
  content: string
}

type CommentItem = {
  id: number
  post_slug: string
  author: string
  content: string
  created_at: string
}

type GithubUser = {
  login: string
  name: string | null
  avatarUrl: string
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState("");
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "authed" | "error">("idle");
  const [authError, setAuthError] = useState("");
  const [oauthClientId, setOauthClientId] = useState(
    process.env.NEXT_PUBLIC_CLIENT_ID ?? process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? ""
  );

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

  const handleGithubLogin = () => {
    const clientId = oauthClientId.trim();
    if (!clientId) {
      setAuthStatus("error");
      setAuthError("未读取到 GitHub Client ID，请确认已在 Vercel 配置 GITHUB_CLIENT_ID 或 NEXT_PUBLIC_CLIENT_ID 并重新部署");
      return;
    }
    try {
      localStorage.setItem("post_login_redirect", `${window.location.pathname}${window.location.search}`);
    } catch { }
    const redirectUri =
      (process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ?? "").trim() ||
      `${window.location.origin}/api/auth/callback`;
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent("read:user")}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") ?? "" : "";
    if (!token) return;
    setAuthStatus("loading");
    setAuthError("");
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
        setAuthError("GitHub 登录状态失效，请重新登录");
      });
  }, []);
  useEffect(() => {
    const loadDetail = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`/api/posts/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setDetail(data);
        setContent(typeof data?.content === "string" ? data.content : "");
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [slug]);

  const loadComments = useCallback(async () => {
    if (!slug) return;
    setIsCommentsLoading(true);
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(Array.isArray(data.items) ? data.items : []);
    } finally {
      setIsCommentsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!slug) return;
    setIsPosting(true);
    try {
      const name = authorName.trim() || "匿名";
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name,
          content: commentContent,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.item) {
        setComments(prev => [data.item, ...prev]);
      } else {
        await loadComments();
      }
      setCommentContent("");
    } finally {
      setIsPosting(false);
    }
  };

  const getInitial = (name: string) => {
    const t = (name || "").trim();
    if (!t) return "A";
    return t.slice(0, 1).toUpperCase();
  };

  return (
    <div className="relative min-h-[100svh] bg-black text-white overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-md transition-all hover:bg-white/20"
            onClick={() => router.push("/article")}
          >
            <span className="text-lg leading-none">←</span>
            <span>返回</span>
          </button>
          <div className="text-xs text-white/35">
            {slug ? `/${slug}` : ""}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:p-7">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {detail?.title ?? ""}
              </h1>
              <div className="article-md mt-6 text-white/90">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </>
          )}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-7">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-xl font-semibold sm:text-2xl">评论</h2>
            <div className="text-xs text-white/40">{comments.length} 条</div>
          </div>

          <div className="mt-5 space-y-3">
            {isCommentsLoading ? (
              <div className="space-y-3">
                <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
                <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
              </div>
            ) : comments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/55">
                暂无评论
              </div>
            ) : (
              comments.map(item => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white/80">
                      {getInitial(item.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="text-sm font-medium text-white/85">{item.author}</div>
                        <div className="text-xs text-white/40">{new Date(item.created_at).toLocaleString()}</div>
                      </div>
                      <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white/85">
                        {item.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleGithubLogin}
                disabled={authStatus === "loading" || authStatus === "authed"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 transition-all hover:bg-white/20 disabled:opacity-50"
              >
                {authStatus === "authed" ? (
                  <>
                    {authorAvatarUrl ? (
                      <Image
                        src={authorAvatarUrl}
                        alt={authorName}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white/75">
                        {getInitial(authorName)}
                      </div>
                    )}
                    <span className="max-w-40 truncate">{authorName}</span>
                  </>
                ) : authStatus === "loading" ? (
                  "登录中..."
                ) : (
                  "GitHub 登录"
                )}
              </button>
              {authStatus === "error" ? (
                <div className="text-xs text-red-400">{authError}</div>
              ) : authStatus !== "authed" ? (
                <div className="text-xs text-white/45">未登录将以匿名发布</div>
              ) : (
                <div className="text-xs text-white/45">已登录</div>
              )}
            </div>

            <div className="mt-4">
              <textarea
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder="写下你的评论"
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition-all focus:border-white/20 focus:bg-black/40"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isPosting}
                className="rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm text-white/85 transition-all hover:bg-white/20 disabled:opacity-50"
              >
                {isPosting ? "提交中..." : "提交评论"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .article-md :where(h1, h2, h3) {
          color: rgba(255, 255, 255, 0.92);
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-top: 1.2em;
          margin-bottom: 0.55em;
        }

        .article-md :where(h1) { font-size: 1.55rem; }
        .article-md :where(h2) { font-size: 1.25rem; }
        .article-md :where(h3) { font-size: 1.1rem; }

        .article-md :where(p) {
          margin: 0.85em 0;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.82);
        }

        .article-md :where(a) {
          color: rgba(255, 255, 255, 0.92);
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: rgba(255, 255, 255, 0.28);
        }
        .article-md :where(a:hover) {
          text-decoration-color: rgba(255, 255, 255, 0.55);
        }

        .article-md :where(ul, ol) {
          margin: 0.85em 0;
          padding-left: 1.25em;
          color: rgba(255, 255, 255, 0.82);
        }
        .article-md :where(li) { margin: 0.35em 0; }

        .article-md :where(blockquote) {
          margin: 1em 0;
          padding: 0.7em 0.95em;
          border-left: 2px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
          border-radius: 0.75em;
          color: rgba(255, 255, 255, 0.78);
        }

        .article-md :where(code) {
          font-size: 0.95em;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 0.12em 0.4em;
          border-radius: 0.5em;
          color: rgba(255, 255, 255, 0.9);
        }

        .article-md :where(pre) {
          margin: 1em 0;
          padding: 0.9em 1em;
          background: rgba(0, 0, 0, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 1em;
          overflow: auto;
        }
        .article-md :where(pre code) {
          background: transparent;
          border: none;
          padding: 0;
        }

        .article-md :where(hr) {
          border: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.10);
          margin: 1.2em 0;
        }

        .article-md :where(img) {
          max-width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
