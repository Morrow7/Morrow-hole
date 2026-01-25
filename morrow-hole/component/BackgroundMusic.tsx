"use client";

import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 设置音量
    audio.volume = 0.3;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Autoplay prevented, waiting for user interaction");
      }
    };

    playAudio();

    // 如果自动播放失败，等待用户交互后播放
    const handleInteraction = () => {
      if (!isPlaying) {
        playAudio();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isPlaying]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} loop src="/canon.mp3" />
      <button
        onClick={() => {
          const audio = audioRef.current;
          if (audio) {
            if (isPlaying) {
              audio.pause();
            } else {
              audio.play();
            }
            setIsPlaying(!isPlaying);
          }
        }}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white/50 hover:text-white"
        title={isPlaying ? "暂停音乐" : "播放音乐"}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        )}
      </button>
    </div>
  );
}
