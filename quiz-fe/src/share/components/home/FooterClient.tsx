"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NO_HEADER_LIST } from "@/share/utils/constants";

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
      alert("Vui lòng nhập email hợp lệ");
      return;
    }
    // Placeholder: no backend wired. Show confirmation and clear field.
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3">ThuKhoaTA</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Nền tảng luyện thi trực tuyến với bộ đề phong phú và hệ thống ôn tập thông minh.
                Học chủ động, ôn tập hiệu quả với SM‑2.
              </p>
              <div className="mt-4 flex items-center space-x-3">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-sm hover:underline">Facebook</a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm hover:underline">GitHub</a>
                <a href="/contact" className="text-sm hover:underline">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/" className="hover:underline">Home</Link></li>
                <li><Link href="/programs" className="hover:underline">Programs</Link></li>
                <li><Link href="/quiz-groups" className="hover:underline">Quiz Groups</Link></li>
                <li><Link href="/leaderboard" className="hover:underline">Leaderboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Support</h4>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                <li><Link href="/help" className="hover:underline">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
                <li><Link href="/feedback" className="hover:underline">Send Feedback</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Newsletter</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Nhận thông báo cập nhật & mẹo học tập</p>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-white dark:bg-gray-800 text-sm"
                />
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Đăng ký</button>
              </form>
              {subscribed && (<p className="mt-2 text-xs text-green-600">Cảm ơn! Bạn đã đăng ký.</p>)}
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} ThuKhoaTA. All rights reserved.</div>
            <div className="mt-3 md:mt-0 text-sm text-gray-600 dark:text-gray-300">Made with ♥ in Vietnam</div>
          </div>
        </div>
      </footer>
  );
};

export default FooterClient;
