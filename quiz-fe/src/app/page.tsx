"use client";
import { Button, Typography, Card } from "antd";
import { PlayCircleOutlined, TrophyOutlined, BookOutlined, UserOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import FloatingBubbles from "../components/ui/FloatingBubbles";

const { Title, Paragraph } = Typography;

export default function Home() {
  const headerItems = [
    {
      id: 1,
      title: "Daily English Quiz",
      description: "Improve your English skills with daily challenges",
      icon: <BookOutlined className="text-4xl text-green-500" />,
      color: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200",
      href: "/programs", // <-- thêm href cho item đầu tiên
    },
    {
      id: 2,
      title: "Grammar Challenge",
      description: "Master English grammar with fun exercises",
      icon: <PlayCircleOutlined className="text-4xl text-purple-500" />,
      color: "bg-purple-50 hover:bg-purple-100",
      borderColor: "border-purple-200",
    },
    {
      id: 3,
      title: "Vocabulary Builder",
      description: "Expand your vocabulary and compete with others",
      icon: <TrophyOutlined className="text-4xl text-blue-500" />,
      color: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-indigo-100">
      {/* Header */}
      <header className="relative z-20 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-purple-600 font-bold text-xl">Q</span>
            </div>
            <span className="text-gray-800 font-bold text-xl">QuizMaster</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8 font-semibold">
            <Link href="/programs" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Chương trình ôn luyện
            </Link>
            <Link href="/grammar" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Ngữ pháp
            </Link>
            <Link href="/vocabulary" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Từ vựng
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Bảng xếp hạng
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
              Quản trị
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button 
                type="text" 
                className="text-gray-700 border-gray-300 hover:bg-purple-50 hover:text-purple-600 transition-all"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                type="primary" 
                className="font-medium"
              >
                Registration
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <FloatingBubbles className="absolute inset-0 z-0" />
        
        <div className="relative z-10 px-6 pt-20 pb-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-gray-800">
                <Title level={1} className="!text-gray-800 !mb-6 !text-5xl lg:!text-6xl font-bold">
                  Daily English Quiz,<br />
                  Daily Progress -<br />
                  <span className="text-purple-600">Learn Today!</span>
                </Title>
                
                <Paragraph className="!text-gray-700 !text-xl !mb-8 leading-relaxed">
                  QuizMaster is the ultimate English learning platform. Master grammar, 
                  expand vocabulary, and compete with learners worldwide. Start your 
                  journey to English fluency today!
                </Paragraph>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<PlayCircleOutlined />}
                    className="h-14 px-8 text-lg font-semibold"
                  >
                    PLAY TODAY
                  </Button>
                  <Button 
                    size="large"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 h-14 px-8 text-lg font-medium"
                  >
                    View Leaderboard
                  </Button>
                </div>
              </div>

              {/* Right Illustration */}
              <div className="relative lg:block hidden">
                <div className="relative z-10">
                  {/* Trophy Illustration */}
                  <div className="w-96 h-96 mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="absolute inset-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
                      <TrophyOutlined className="text-8xl text-white" />
                    </div>
                    {/* Floating elements around trophy */}
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full flex items-center justify-center animate-bounce">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="absolute -bottom-2 -left-8 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xl">A</span>
                    </div>
                    <div className="absolute top-1/2 -right-8 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Categories Section */}
        <div className="relative z-10 px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-3 gap-6">
                {headerItems.map((category) => (
                  category.href ? (
                    <Link key={category.id} href={category.href} className="group">
                      <Card
                        className={`${category.color} ${category.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer`}
                        bodyStyle={{ padding: '24px' }}
                      >
                        <div className="text-center">
                          <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                            {category.icon}
                          </div>
                          <Title level={4} className="!mb-3 !text-gray-800">
                            {category.title}
                          </Title>
                          <Paragraph className="!text-gray-600 !mb-4">
                            {category.description}
                          </Paragraph>
                          <Button 
                            type="link" 
                            className="!text-purple-600 !font-semibold group-hover:!text-purple-700"
                          >
                            Start Now →
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  ) : (
                    <Card
                      key={category.id}
                      className={`${category.color} ${category.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                      bodyStyle={{ padding: '24px' }}
                    >
                      <div className="text-center">
                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                          {category.icon}
                        </div>
                        <Title level={4} className="!mb-3 !text-gray-800">
                          {category.title}
                        </Title>
                        <Paragraph className="!text-gray-600 !mb-4">
                          {category.description}
                        </Paragraph>
                        <Button 
                          type="link" 
                          className="!text-purple-600 !font-semibold group-hover:!text-purple-700"
                        >
                          Start Now →
                        </Button>
                      </div>
                    </Card>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}