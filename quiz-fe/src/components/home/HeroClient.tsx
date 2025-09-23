"use client";
import { Typography, Button } from 'antd';
import { PlayCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import FloatingBubbles from '@/components/ui/FloatingBubbles';

const { Title, Paragraph } = Typography;

export default function HeroClient() {
  return (
    <section className="relative">
      <FloatingBubbles className="absolute inset-0 z-0" />

      <div className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-gray-800">
              <Title level={1} className="!text-gray-800 !mb-6 !text-5xl lg:!text-6xl font-bold">
                Daily English Quiz,<br />
                Daily Progress -<br />
                <span className="text-purple-600">Learn Today!</span>
              </Title>

              <Paragraph className="!text-gray-700 !text-xl !mb-8 leading-relaxed">
                QuizMaster is the ultimate English learning platform. Master grammar, expand vocabulary, and compete with learners worldwide.
              </Paragraph>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="primary" size="large" icon={<PlayCircleOutlined />} className="h-14 px-8 text-lg font-semibold">PLAY TODAY</Button>
                <Button size="large" className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 h-14 px-8 text-lg font-medium">View Leaderboard</Button>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="relative z-10">
                <div className="w-96 h-96 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
                    <TrophyOutlined className="text-8xl text-white" />
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
