"use client";
import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'bottom bottom',
    wordAnimationEnd = 'bottom bottom',
    scrub = true,
    animationMode = 'word',
    stagger = 0.05,
    duration = 0.5
}) => {
    const containerRef = useRef(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';

        if (animationMode === 'line') {
            return text.split('\n').map((line, index) => {
                if (!line.trim()) return null;
                return (
                    <div key={index} style={{ overflow: 'hidden', margin: '0.5em 0' }}>
                        <div className="word" style={{ display: 'block' }}>
                            {line.trim()}
                        </div>
                    </div>
                );
            });
        }

        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return word;
            return (
                <span className="word" key={index}>
                    {word}
                </span>
            );
        });
    }, [children, animationMode]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { transformOrigin: '0% 50%', rotate: baseRotation },
                {
                    ease: 'none',
                    rotate: 0,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top bottom',
                        end: rotationEnd,
                        scrub
                    }
                }
            );

            const wordElements = el.querySelectorAll('.word');

            gsap.fromTo(
                wordElements,
                {
                    opacity: 0,
                    y: '100%',
                    willChange: 'opacity, transform'
                },
                {
                    ease: 'power3.out',
                    opacity: 1,
                    y: '0%',
                    duration: duration,
                    stagger: stagger,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top bottom-=20%',
                        end: wordAnimationEnd,
                        scrub
                    }
                }
            );

            if (enableBlur) {
                gsap.fromTo(
                    wordElements,
                    { filter: `blur(${blurStrength}px)` },
                    {
                        ease: 'power3.out',
                        filter: 'blur(0px)',
                        duration: duration,
                        stagger: stagger,
                        scrollTrigger: {
                            trigger: el,
                            scroller,
                            start: 'top bottom-=20%',
                            end: wordAnimationEnd,
                            scrub
                        }
                    }
                );
            }
        }, el);

        return () => ctx.revert();
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength, scrub, stagger, duration]);

    return (
        <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
            <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
        </h2>
    );
};

export default ScrollReveal;
