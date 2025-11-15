"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NO_HEADER_LIST } from "@/share/utils/constants";

const FooterClient: React.FC = () => {
  const pathname = usePathname() ?? "/";
  const shouldHide = NO_HEADER_LIST.some((prefix) => pathname.startsWith(prefix));
  if (shouldHide) return null;

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} ThuKhoaTA. All rights reserved.</div>
        <div className="mt-3 md:mt-0 flex items-center space-x-4">
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300">About</Link>
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300">Privacy</Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default FooterClient;
