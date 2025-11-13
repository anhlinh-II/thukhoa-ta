"use client";
import { Card, Button, Typography } from 'antd';
import Link from 'next/link';
import { PlayCircleOutlined, TrophyOutlined, BookOutlined } from '@ant-design/icons';
// import CategoriesAnim from '@/components/animations/CategoriesAnim';

const { Title: HTitle, Paragraph: HParagraph } = Typography;

const headerItems = [
  { id: 1, title: 'Daily English Quiz', description: 'Improve your English skills with daily challenges', icon: <BookOutlined className="text-4xl text-green-500" />, color: 'bg-green-50 hover:bg-green-100', borderColor: 'border-green-200', href: '/programs' },
  { id: 2, title: 'Grammar Challenge', description: 'Master English grammar with fun exercises', icon: <PlayCircleOutlined className="text-4xl text-purple-500" />, color: 'bg-purple-50 hover:bg-purple-100', borderColor: 'border-purple-200' },
  { id: 3, title: 'Vocabulary Builder', description: 'Expand your vocabulary and compete with others', icon: <TrophyOutlined className="text-4xl text-blue-500" />, color: 'bg-blue-50 hover:bg-blue-100', borderColor: 'border-blue-200' }
];

export default function CategoriesClient() {
  return (
    <section className="relative z-10 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* <CategoriesAnim> */}
            <div className="grid md:grid-cols-3 gap-6">
              {headerItems.map((category) => (
                category.href ? (
                  <Link key={category.id} href={category.href} className="group">
                    <Card className={`${category.color} ${category.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer`} styles={{ body: { padding: 24 } }}>
                      <div className="text-center">
                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                        <HTitle level={4} className="!mb-3 !text-gray-800">{category.title}</HTitle>
                        <HParagraph className="!text-gray-600 !mb-4">{category.description}</HParagraph>
                        <Button type="link" className="!text-purple-600 !font-semibold group-hover:!text-purple-700">Start Now →</Button>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card key={category.id} className={`${category.color} ${category.borderColor} border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group`} styles={{ body: { padding: 24 } }}>
                    <div className="text-center">
                      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                      <HTitle level={4} className="!mb-3 !text-gray-800">{category.title}</HTitle>
                      <HParagraph className="!text-gray-600 !mb-4">{category.description}</HParagraph>
                      <Button type="link" className="!text-purple-600 !font-semibold group-hover:!text-purple-700">Start Now →</Button>
                    </div>
                  </Card>
                )
              ))}
            </div>
          {/* </CategoriesAnim> */}
        </div>
      </div>
    </section>
  );
}
