// app/oauth-success/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function OAuthSuccessInner() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get('token');
    const error = params.get('error');
    const message = error ? `登录失败：${error}` : token ? '登录中...' : '未收到登录凭证';

    useEffect(() => {
        if (error) return;
        if (token) {
            localStorage.setItem('token', token);
            const redirectTo = localStorage.getItem("post_login_redirect") || "/Daily";
            localStorage.removeItem("post_login_redirect");
            router.push(redirectTo);
            return;
        }
    }, [error, token, router]);

    return (
        <div className="min-h-[100svh] bg-black text-white flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-md">
                <p className="text-sm text-white/80">{message}</p>
            </div>
        </div>
    );
}

export default function OAuthSuccess() {
    return (
        <Suspense fallback={<p>登录中...</p>}>
            <OAuthSuccessInner />
        </Suspense>
    );
}
