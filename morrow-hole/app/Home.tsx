"use client";
import PixelSnow from '../component/PixeSnow';
import ScrollReveal from '../component/ScrollReveal';
export default function Home() {
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
                    <div className="mt-10 flex justify-center space-x-8">
                        <button
                            className="px-8 py-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10 bg-white/10 text-white hover:bg-white/20 hover:scale-105"
                            onClick={() => window.location.href = '/article'}
                        >
                            Article
                        </button>
                        <button
                            className="px-8 py-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10 bg-white/10 text-white hover:bg-white/20 hover:scale-105"
                            onClick={() => window.location.href = '/music'}
                        >
                            Music
                        </button>
                        <button
                            className="px-8 py-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10 bg-white/10 text-white hover:bg-white/20 hover:scale-105"
                            onClick={() => window.location.href = '/about'}
                        >
                            About
                        </button>

                    </div>
                </div>
            </div>
        </>
    )
}