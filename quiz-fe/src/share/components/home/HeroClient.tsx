"use client";
import React from 'react';
import { Typography, Button } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { PlayCircleOutlined } from '@ant-design/icons';
import FloatingBubbles from '../ui/FloatingBubbles';

const { Title, Paragraph } = Typography;

export default function HeroClient() {
  return (
    <section className="relative overflow-hidden">
      <FloatingBubbles className="absolute inset-0 z-0 opacity-60" />

      {/* Inline DotLottieReact player (uses same package as GlobalLoader) */}
      <div style={{ position: 'absolute', left: -9999, width: 0, height: 0 }} aria-hidden>
        {/* prefetch nothing visual; actual player rendered in host below */}
      </div>

      <div className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text block - vertically centered */}
            <div className="text-gray-800 flex flex-col justify-center py-6">
              <Title level={1} className="!mb-4 !text-4xl sm:!text-5xl lg:!text-6xl font-extrabold leading-tight">
                Daily English Quiz
                <br className="hidden sm:block" />
                <span className="text-purple-600">Build Skills. Win Daily.</span>
              </Title>

              <Paragraph className="!text-gray-700 !text-lg md:!text-xl !mb-6 max-w-xl">
                Practice bite-sized quizzes, track progress, and compete on the leaderboard. Short, consistent practice beats occasional cramming.
              </Paragraph>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button type="primary" size="large" icon={<PlayCircleOutlined />} className="h-12 px-6 text-base font-semibold">Play Now</Button>
                <Button size="large" className="h-12 px-6 text-base border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400">Leaderboard</Button>
              </div>
            </div>

            {/* Right: Illustration - balanced size and centered */}
            <div className="flex items-center justify-center py-6">
              <div className="relative w-96 h-96 sm:w-[420px] sm:h-[420px] flex items-center justify-center">
                <div className="relative w-80 h-80 sm:w-[380px] sm:h-[380px] rounded-full bg-white/90 flex items-center justify-center shadow-lg border border-white/30">
                  {/* DotLottieReact player (language-translator.lottie in public/animation) - made larger */}
                  <div className="w-full h-full">
                    <DotLottieReact src="/animation/language-translator.lottie" loop autoplay />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
 
