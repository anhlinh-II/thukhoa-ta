"use client";
import React, { useEffect } from 'react';
import 'antd/dist/reset.css';
import { App, ConfigProvider } from 'antd';
import messageService from '@/share/services/messageService';

interface AntdProviderProps {
  children: React.ReactNode;
}

function AntdAppSetup({ children }: { children: React.ReactNode }) {
  const { message, notification } = App.useApp();

  useEffect(() => {
    messageService.setMessageApi(message);
    messageService.setNotificationApi(notification);
  }, [message, notification]);

  return <>{children}</>;
}

export default function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider>
      <App>
        <AntdAppSetup>{children}</AntdAppSetup>
      </App>
    </ConfigProvider>
  );
}
