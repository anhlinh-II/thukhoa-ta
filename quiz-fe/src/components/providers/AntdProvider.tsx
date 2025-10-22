"use client";
import React from 'react';
// Import antd v5 reset stylesheet. This must run on the client.
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';

interface AntdProviderProps {
  children: React.ReactNode;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return <ConfigProvider>{children}</ConfigProvider>;
}
