// app/oauth-success/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OAuthSuccess() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get('token');
    const error = params.get('error');
    const message = error ? `登录失败：${error}` : token ? '登录中...' : '未收到登录凭证';

    useEffect(() => {
        if (error) return;
        if (token) {
            localStorage.setItem('token', token);
            router.push('/');
            return;
        }
    }, [error, token, router]);

    return <p>{message}</p>;
}
