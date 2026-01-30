"use client";
import PixelSnow from '../component/PixeSnow';
import ScrollReveal from '../component/ScrollReveal';
import Dock from '../component/Dock';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function Home() {
    const router = useRouter();
    const go = useCallback((href: string) => router.push(href), [router]);
    const items = useMemo(() => ([
        { icon: <span>🏠</span>, label: 'Article', onClick: () => go('/article') },
        { icon: <span>🎵</span>, label: 'Music', onClick: () => go('/music') },
        { icon: <span>👤</span>, label: 'Daily', onClick: () => go('/Daily') },
        { icon: <span>ℹ️</span>, label: 'About', onClick: () => go('/about') },
    ]), [go]);
    return (
        <>
            <div className="relative w-full min-h-[100svh] overflow-hidden flex items-center justify-center">
                <PixelSnow
                    className="absolute inset-0 z-0"
                    color="#ffffff"
                    flakeSize={0.01}
                    minFlakeSize={1.25}
                    pixelResolution={200}
                    speed={1.25}
                    density={0.3}
                    direction={125}
                    brightness={1}
                    depthFade={8}
                    farPlane={20}
                    gamma={0.4545}
                    variant="square"
                />
                <div className="relative z-10 w-full max-w-4xl px-4 py-10 sm:p-10">
                    <ScrollReveal
                        scrollContainerRef={null}
                        containerClassName="text-center"
                        textClassName="text-white text-2xl sm:text-4xl font-bold leading-relaxed"
                        rotationEnd="bottom bottom"
                        wordAnimationEnd="bottom bottom"
                        baseOpacity={0.3}
                        enableBlur={true}
                        baseRotation={5}
                        blurStrength={4}
                        scrub={false}
                        animationMode="line"
                        stagger={2.0}
                        duration={1.5}
                    >
                        {`Hello everyone, I'm Morrow. 
                        This is my little cave. 
                        Welcome! I'm a front-end engineer. 
                        Sometimes I share articles and music here, 
                        maybe some technical sharing as well.
                         I like folk music and cats. 
                         I'm a lazy person. 
                         If we have the same hobbies, 
                         we can become friends.`}
                    </ScrollReveal>
                    <div className="mt-6 flex justify-center sm:mt-2">
                        <Dock
                            items={items}
                            panelHeight={60}
                            baseItemSize={46}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
