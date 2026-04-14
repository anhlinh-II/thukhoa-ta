"use client";

import React from "react";
import { RocketOutlined, BookOutlined, TrophyOutlined, ScheduleOutlined } from "@ant-design/icons";

export default function FeaturesSection() {
  const features = [
    {
      title: "Smart Review (SM-2)",
      desc: "Space-repetition based review to help you retain vocabulary and grammar long-term.",
      icon: <ScheduleOutlined className="text-2xl text-white" />,
      bg: "bg-indigo-500",
    },
    {
      title: "Practice Tests & Mock Exams",
      desc: "Real-format mock tests with instant scoring and detailed explanations.",
      icon: <BookOutlined className="text-2xl text-white" />,
      bg: "bg-sky-500",
    },
    {
      title: "Personalized Study Plan",
      desc: "Adaptive plans based on your strengths, weaknesses and time availability.",
      icon: <RocketOutlined className="text-2xl text-white" />,
      bg: "bg-purple-500",
    },
    {
      title: "Leaderboard & Rewards",
      desc: "Compete with learners, earn badges and climb the leaderboard.",
      icon: <TrophyOutlined className="text-2xl text-white" />,
      bg: "bg-yellow-500",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Tính năng nổi bật</h2>
        <p className="text-center text-gray-500 mb-8">Các công cụ hỗ trợ học tập thông minh giúp bạn cải thiện nhanh chóng.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl shadow-md bg-white flex flex-col items-center text-center h-full transform transition hover:-translate-y-1"
            >
              <div className={`w-14 h-14 flex items-center justify-center rounded-full ${f.bg} mb-4`}>{f.icon}</div>
              <div className="font-semibold text-gray-800 text-lg mb-2">{f.title}</div>
              <div className="text-sm text-gray-500">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
