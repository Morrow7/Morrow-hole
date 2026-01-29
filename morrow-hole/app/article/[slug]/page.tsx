"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type PostDetail = {
  title: string
  content: string
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-black text-white p-8">
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
      </div>
    </div>
  );
}
