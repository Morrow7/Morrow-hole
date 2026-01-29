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

    return <p>{message}</p>;
}

export default function OAuthSuccess() {
    return (
        <Suspense fallback={<p>登录中...</p>}>
            <OAuthSuccessInner />
        </Suspense>
    );
}
