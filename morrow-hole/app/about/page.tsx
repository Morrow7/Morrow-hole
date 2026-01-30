"use client";

import dynamic from 'next/dynamic'
import { BookOpen, Github, Mail, Twitter } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

const Galaxy = dynamic(() => import('../../component/Galaxy'), { ssr: false })

type FriendLink = {
    name: string
    url: string
    desc: string
}

export default function ArticlePage() {
    const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showGalaxy, setShowGalaxy] = useState(false);
    const ampKey = '--amp' as unknown as keyof CSSProperties;
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const emailWrapRef = useRef<HTMLDivElement>(null);
    const [isXiaohongshuOpen, setIsXiaohongshuOpen] = useState(false);
    const xiaohongshuWrapRef = useRef<HTMLDivElement>(null);

    const techStack = useMemo(
        () => [
            'vue',
            'Next.js',
            'React',
            'TypeScript',
            'Tailwind CSS',
            'MySQL',
            'Springboot',
            'Java',
            'JavaScript',
            'React Native'
        ],
        []
    );

    const techStars = useMemo(() => {
        const hash = (input: string) => {
            let h = 2166136261;
            for (let i = 0; i < input.length; i++) {
                h ^= input.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0;
        };

        return techStack.map(name => {
            const h = hash(name);
            const x = 12 + (h % 8000) / 8000 * 76;
            const y = 16 + (Math.floor(h / 8000) % 7000) / 7000 * 68;
            const delay = (h % 3000) / 1000;
            const duration = 4 + ((h >>> 8) % 5000) / 1000;
            const amp = 16 + ((h >>> 16) % 18);
            return { name, x, y, delay, duration, amp };
        });
    }, [techStack]);

    useEffect(() => {
        const loadLinks = async () => {
            try {
                const res = await fetch('/api/friend-links');
                if (!res.ok) return;
                const data = await res.json();
                setFriendLinks(Array.isArray(data.items) ? data.items : []);
            } catch {
                setFriendLinks([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadLinks();
    }, []);

    useEffect(() => {
        const run = () => setShowGalaxy(true);
        const w = window as unknown as {
            requestIdleCallback?: (cb: () => void) => number
            cancelIdleCallback?: (id: number) => void
        };

        if (typeof w.requestIdleCallback === 'function') {
            const id = w.requestIdleCallback(run);
            return () => w.cancelIdleCallback?.(id);
        }

        const id = window.setTimeout(run, 0);
        return () => window.clearTimeout(id);
    }, []);

    useEffect(() => {
        if (!isEmailOpen && !isXiaohongshuOpen) return;

        const onPointerDown = (e: PointerEvent) => {
            if (isEmailOpen) {
                const el = emailWrapRef.current;
                if (el && !el.contains(e.target as Node)) setIsEmailOpen(false);
            }
            if (isXiaohongshuOpen) {
                const el = xiaohongshuWrapRef.current;
                if (el && !el.contains(e.target as Node)) setIsXiaohongshuOpen(false);
            }
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (isEmailOpen) setIsEmailOpen(false);
            if (isXiaohongshuOpen) setIsXiaohongshuOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isEmailOpen, isXiaohongshuOpen]);

    return (
        <div className="relative min-h-[100vh] bg-black text-white overflow-hidden">
            <div className="absolute inset-0">
                {showGalaxy ? (
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
                ) : null}
            </div>
            <div className="relative z-20 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="mt-0 flex flex-wrap items-start justify-center gap-6 sm:mt-10 sm:gap-10">
                    {isLoading ? null : friendLinks.map((item, index) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
                            <div className="w-px h-10 bg-white/40 sm:h-16" />
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-72 max-w-[90vw] rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-center backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
                                style={{ animation: `swing 4s ease-in-out ${index * 0.3}s infinite` }}
                            >
                                <div className="text-lg font-semibold text-white">{item.name}</div>
                                <div className="mt-2 text-sm text-white/70">{item.desc}</div>
                            </a>
                        </div>
                    ))}
                </div>

                <div className="mt-10 rounded-2xl p-4 sm:p-6">
                    <div className="relative mt-4 h-[300px] overflow-hidden rounded-2xl   tech-stack-field">
                        {techStars.map(star => (
                            <div
                                key={star.name}
                                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sl text-white/80 tech-stack-star"
                                style={{
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                    animationDelay: `${star.delay}s`,
                                    animationDuration: `${star.duration}s`,
                                    [ampKey]: `${star.amp}px`,
                                }}
                            >
                                {star.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-18 flex justify-center">
                    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <a
                            href="https://x.com/Morrow992887"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sl text-white/80 transition-all hover:bg-white/15"
                        >
                            <Twitter size={18} />
                            Twitter
                        </a>
                        <a
                            href="https://github.com/Morrow7"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sl text-white/80 transition-all hover:bg-white/15"
                        >
                            <Github size={18} />
                            GitHub
                        </a>
                        <div ref={emailWrapRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsEmailOpen(v => !v)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sl text-white/80 transition-all hover:bg-white/15"
                                aria-expanded={isEmailOpen}
                            >
                                <Mail size={18} />
                                Email
                            </button>
                            {isEmailOpen ? (
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-sm text-white/90 backdrop-blur-md shadow-lg">
                                    susu997y@gmail.com
                                </div>
                            ) : null}
                        </div>
                        <div ref={xiaohongshuWrapRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsXiaohongshuOpen(v => !v)}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sl text-white/80 transition-all hover:bg-white/15"
                                aria-expanded={isXiaohongshuOpen}
                            >
                                <BookOpen size={18} />
                                小红书
                            </button>
                            {isXiaohongshuOpen ? (
                                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-2xl border border-white/10 bg-black/70 px-4 py-2 text-sm text-white/90 backdrop-blur-md shadow-lg">
                                    Gaosuya
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes swing {
                    0% { transform: translateY(0) rotate(-1.2deg); }
                    50% { transform: translateY(6px) rotate(1.2deg); }
                    100% { transform: translateY(0) rotate(-1.2deg); }
                }

                @keyframes techStackFloat {
                    0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                    50% { transform: translate(-50%, -50%) translateY(var(--amp)); }
                }

                @keyframes techStackPan {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-90px, 60px, 0); }
                }

                .tech-stack-field::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image:
                        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0.12) 1px, transparent 2px),
                        radial-gradient(circle at 70% 20%, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 1px, transparent 2px),
                        radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 2px),
                        radial-gradient(circle at 85% 75%, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 1px, transparent 2px);
                    background-size: 220px 220px;
                    animation: techStackPan 22s linear infinite;
                    opacity: 0.9;
                }

                .tech-stack-star {
                    animation-name: techStackFloat;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                    will-change: transform;
                }
            `}</style>
        </div>
    )
}
