"use client";
import PixelSnow from '../component/PixeSnow';
import ScrollReveal from '../component/ScrollReveal';
import Dock from '../component/Dock';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const items = [
        { icon: <span>🏠</span>, label: 'Article', onClick: () => router.push('/article') },
        { icon: <span>🎵</span>, label: 'Music', onClick: () => router.push('/music') },
        { icon: <span>👤</span>, label: 'Daily', onClick: () => router.push('/Daily') },
        { icon: <span>ℹ️</span>, label: 'About', onClick: () => router.push('/about') },
    ];
    return (
        <>
            <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">
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
                <div className="relative z-10 p-8">
                    <ScrollReveal
                        scrollContainerRef={null}
                        containerClassName="text-center"
                        textClassName="text-white text-4xl font-bold leading-relaxed"
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
                    <div className="mt-0 flex  justify-center space-x-8">
                        <Dock
                            items={items}
                            panelHeight={68}
                            baseItemSize={50}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
