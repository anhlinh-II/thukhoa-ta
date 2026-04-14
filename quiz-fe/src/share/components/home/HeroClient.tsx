"use client";
import React, { useEffect, useState } from 'react';
import { Typography, Button } from 'antd';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { PlayCircleOutlined } from '@ant-design/icons';
import FloatingBubbles from '../ui/FloatingBubbles';
import { defaultLang, t } from '@/share/locales';

const { Title, Paragraph } = Typography;

export default function HeroClient({ lang: propLang }: { lang?: string }) {
  const [lang, setLang] = useState<string>(defaultLang);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
      if (propLang) {
        setLang(propLang);
      } else if (stored) {
        setLang(stored);
      }
    } catch (e) {}

    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce?.detail) setLang(ce.detail);
    };

    window.addEventListener('langChange', handler as EventListener);
    return () => window.removeEventListener('langChange', handler as EventListener);
  }, [propLang]);

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
              {/* language selection moved to user menu; hero will follow global lang */}

              <Title level={1} className="!mb-4 !text-4xl sm:!text-5xl lg:!text-6xl font-extrabold leading-tight">
                {t(lang, 'heroTitle')}
                <br className="hidden sm:block" />
                <span className="text-purple-600">{t(lang, 'heroSubtitle')}</span>
              </Title>

              <Paragraph className="!text-gray-700 !text-lg md:!text-xl !mb-6 max-w-xl">
                {t(lang, 'heroDesc')}
              </Paragraph>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button type="primary" size="large" icon={<PlayCircleOutlined />} className="h-12 px-6 text-base font-semibold">{t(lang, 'playNow')}</Button>
                <Button size="large" className="h-12 px-6 text-base border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400">{t(lang, 'leaderboardBtn')}</Button>
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

