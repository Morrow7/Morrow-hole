"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Galaxy from '../../../component/Galaxy';

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

  return (
    <div className="min-h-screen bg-black text-white p-8">
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
      <div className="mx-auto w-full max-w-3xl">
        <button
          className="mb-6 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-md transition-all hover:bg-white/20"
          onClick={() => router.push("/article")}
        >
          Back
        </button>
        <h1 className="text-3xl font-bold">{detail?.title ?? ""}</h1>
        <div className="mt-6 text-white/90">
          {isLoading ? null : <ReactMarkdown>{content}</ReactMarkdown>}
        </div>
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-2xl font-semibold">Comments</h2>
          <div className="mt-4 space-y-3">
            {isCommentsLoading ? null : comments.length === 0 ? (
              <div className="text-sm text-white/50">暂无评论</div>
            ) : (
              comments.map(item => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-white/70">{item.author}</div>
                  <div className="mt-2 text-white/90">{item.content}</div>
                  <div className="mt-2 text-xs text-white/40">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <button
              onClick={handleGithubLogin}
              disabled={authStatus === "loading" || authStatus === "authed"}
              className="w-40 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20 disabled:opacity-50"
            >
              {authStatus === "authed" ? `已登录：${authorName}` : authStatus === "loading" ? "登录中..." : "github登录"}
            </button>
            {authStatus === "error" ? (
              <div className="text-xs text-red-400">{authError}</div>
            ) : authStatus !== "authed" ? (
              <div className="text-xs text-white/50">未登录将以匿名发布</div>
            ) : null}

            <textarea
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              placeholder="写下你的评论"
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={isPosting}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/20 disabled:opacity-50"
            >
              {isPosting ? "提交中..." : "提交评论"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
