"use client";

import React from "react";
import Link from "next/link";
import { Button } from "antd";

export default function CTASection() {
  return (
    <section className="py-10 bg-gradient-to-r from-sky-50 to-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Bắt đầu tiến bộ ngay hôm nay</h3>
        <p className="text-gray-600 mb-6">Tham gia miễn phí, làm bài test, nhận lộ trình học và tiến bộ theo từng ngày.</p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/register">
            <Button type="primary" size="large" className="px-6">Bắt đầu miễn phí</Button>
          </Link>
          <Link href="/programs">
            <Button size="large" className="px-6">Tìm hiểu thêm</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
