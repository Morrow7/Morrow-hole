"use client";
import Galaxy from '../../component/Galaxy';
export default function ArticlePage() {
    return (
        <div className="min-h-[100svh] bg-black text-white px-4 py-8 sm:p-8 flex flex-col items-center justify-center gap-6">
            <div className="relative w-full max-w-5xl h-[45vh] sm:h-[600px]">
                <Galaxy />
            </div>


            <div className="relative w-full max-w-5xl h-[45vh] sm:h-[600px]">
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
                />
            </div>
        </div>
    )
}
