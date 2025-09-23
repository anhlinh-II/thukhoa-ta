"use client";
import Link from 'next/link';
import { Button } from 'antd';

export default function HeaderClient() {
  return (
    <header className="relative z-20 px-6 py-4">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-purple-600 font-bold text-xl">TKA</span>
          </div>
          <span className="text-blue-100 font-bold text-xl">ThuKhoa-TA</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-semibold">
          <Link href="/programs" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Chương trình ôn luyện</Link>
          <Link href="/grammar" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Ngữ pháp</Link>
          <Link href="/vocabulary" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Từ vựng</Link>
          <Link href="/leaderboard" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Bảng xếp hạng</Link>
          <Link href="/admin" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Quản trị</Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button type="text" className="text-gray-700 border-gray-300 hover:bg-purple-50 hover:text-purple-600 transition-all">Login</Button>
          </Link>
          <Link href="/register">
            <Button type="primary" className="font-medium">Registration</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
