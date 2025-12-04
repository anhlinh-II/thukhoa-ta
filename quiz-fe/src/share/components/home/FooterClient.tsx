"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NO_HEADER_LIST } from "@/share/utils/constants";
import { message } from "antd";

const FooterClient: React.FC = () => {
  const pathname = usePathname() ?? "/";
  // Hide footer on routes in NO_HEADER_LIST but allow exceptions (e.g. '/quiz-taking/config/*')
  const shouldHide = NO_HEADER_LIST.some((prefix) => pathname.startsWith(prefix))
    && !pathname.startsWith('/quiz-taking/config');
  if (shouldHide) return null;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      message.error("Vui lòng nhập email hợp lệ");
      return;
    }
    // Placeholder: no backend wired. Show confirmation and clear field.
    setSubscribed(true);
    setEmail("");
    message.success("Cảm ơn! Bạn đã đăng ký.");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-t border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4">
            <Link href="/" className="inline-block">
              <img src="/img/logo.png" alt="ThuKhoaTA" className="h-10 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Nền tảng luyện thi trực tuyến với bộ đề phong phú và hệ thống ôn tập thông minh.
              Học chủ động, ôn tập hiệu quả với SM‑2.
            </p>

            <div className="mt-4 flex items-center space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 2.9h-1.9v7A10 10 0 0022 12z"/></svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub" className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.6-4-1.6-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 1.9 1.1.1-.7.4-1.1.7-1.3-2.6-.3-5.3-1.3-5.3-6a4.7 4.7 0 011.2-3.3 4.4 4.4 0 01.1-3.2s1-.3 3.4 1.2a11.7 11.7 0 016.2 0c2.4-1.5 3.4-1.2 3.4-1.2.7 1.6.3 2.8.1 3.2a4.7 4.7 0 011.2 3.3c0 4.7-2.7 5.7-5.3 6 .4.4.7 1 .7 2v3c0 .3.2.6.8.5A12 12 0 0012 .5"/></svg>
              </a>
              <Link href="/contact" aria-label="Contact" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Contact</Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-base font-semibold mb-3">Quick Links</h4>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/programs" className="hover:underline">Programs</Link></li>
              <li><Link href="/quiz-groups" className="hover:underline">Quiz Groups</Link></li>
              <li><Link href="/leaderboard" className="hover:underline">Leaderboard</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-base font-semibold mb-3">Support</h4>
            <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <li><Link href="/help" className="hover:underline">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms</Link></li>
              <li><Link href="/feedback" className="hover:underline">Send Feedback</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-base font-semibold mb-3">Newsletter</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Nhận thông báo cập nhật & mẹo học tập</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 items-stretch">
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input
                id="footer-email"
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 min-h-[48px] rounded-md sm:rounded-r-none border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700"
              />
              <button
                type="submit"
                className="mt-0 sm:mt-0 flex-shrink-0 min-h-[48px] px-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-md sm:rounded-l-none font-medium whitespace-nowrap shadow-md hover:opacity-95"
              >
                Đăng ký
              </button>
            </form>
            <p className="mt-3 text-xs text-gray-500">Chúng tôi sẽ không chia sẻ email của bạn. Bạn có thể hủy đăng ký bất kỳ lúc nào.</p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} ThuKhoaTA. All rights reserved.</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Made with <span className="text-red-500">♥</span> in Vietnam</div>
        </div>
      </div>
    </footer>
  );
};

export default FooterClient;
