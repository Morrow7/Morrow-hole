"use client";

import Galaxy from '../../component/Galaxy';
import React, { useEffect, useState } from 'react'

export default function ArticlePage() {
    const [friendLinks, setFriendLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="relative h-screen bg-black text-white overflow-hidden">
            <div className="absolute inset-0">
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
            </div>
            <div className="absolute top-0 left-0 w-full z-20 px-6 pt-6 flex flex-col items-center">
                <div className="mt-0 flex flex-wrap items-start justify-center gap-10">
                    {isLoading ? null : friendLinks.map((item, index) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(255,255,255,0.45)]" />
                            <div className="w-px h-16 bg-white/40" />
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="w-64 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-center backdrop-blur-md shadow-lg transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
                                style={{ animation: `swing 4s ease-in-out ${index * 0.3}s infinite` }}
                            >
                                <div className="text-lg font-semibold text-white">{item.name}</div>
                                <div className="mt-2 text-sm text-white/70">{item.desc}</div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
            <style jsx global>{`
                @keyframes swing {
                    0% { transform: translateY(0) rotate(-1.2deg); }
                    50% { transform: translateY(6px) rotate(1.2deg); }
                    100% { transform: translateY(0) rotate(-1.2deg); }
                }
            `}</style>
        </div>
    )
}
