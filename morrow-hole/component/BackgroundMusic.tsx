"use client";

import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 初始化自动播放逻辑
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;

    const attemptPlay = async () => {
      try {
        await audio.play();
      } catch {
        // 如果自动播放失败，添加一次性事件监听器
        const playOnInteraction = async () => {
          try {
            await audio.play();
          } catch {
          }
          // 移除监听器
          window.removeEventListener('click', playOnInteraction);
          window.removeEventListener('keydown', playOnInteraction);
        };

        window.addEventListener('click', playOnInteraction);
        window.addEventListener('keydown', playOnInteraction);
      }
    };

    attemptPlay();
  }, []);

  // 监听音频实际播放状态，确保 UI 同步
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} loop src="/canon.mp3" />
      <button
        onClick={togglePlay}
        className={`group p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg border border-white/10 ${isPlaying
          ? "bg-white/20 text-white hover:bg-white/30 hover:scale-105"
          : "bg-black/20 text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        title={isPlaying ? "暂停音乐" : "播放音乐"}
      >
        {isPlaying ? (
          <div className="flex gap-1 items-end justify-center w-5 h-5 pb-1">
            <span className="block w-1 bg-current rounded-full animate-[music-bar_1s_ease-in-out_infinite]"></span>
            <span className="block w-1 bg-current rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.2s]"></span>
            <span className="block w-1 bg-current rounded-full animate-[music-bar_1s_ease-in-out_infinite_0.4s]"></span>
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        )}
      </button>
    </div>
  );
}
