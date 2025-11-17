"use client";
import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppstoreOutlined,
  BookOutlined,
  DashboardOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import './admin.css';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Determine active key based on pathname
  const getActiveKey = () => {
    if (pathname.includes('/admin/quiz-groups')) return 'quiz-groups';
    if (pathname.includes('/admin/quiz-mocktests') || pathname.includes('/admin/quiz-formats') || pathname.includes('/admin/quiz-topics') || pathname.includes('/admin/quiz-management')) return 'manage-quiz';
    if (pathname.includes('/admin/users')) return 'users';
    if (pathname.includes('/admin/role-permissions')) return 'role-permissions';
    if (pathname.includes('/admin/programs')) return 'programs';
    if (pathname.includes('/admin/questions')) return 'questions';
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname.includes('/admin/test-base')) return 'test-base';
    return 'quiz-groups'; // default
  };

  const menuItems = [
    {
      key: 'quiz-groups',
      icon: <AppstoreOutlined />,
      label: 'Nhóm bài Quiz',
    },
    {
      key: 'manage-quiz',
      icon: <BookOutlined />,
      label: 'Quản lý Quiz',
    },
    {
      key: 'users',
      icon: <AppstoreOutlined />,
      label: 'Users',
    },
    {
      key: 'role-permissions',
      icon: <TeamOutlined />,
      label: 'Roles & Permissions',
    },
    {
      key: 'programs',
      icon: <BookOutlined />,
      label: 'Chương trình ôn luyện',
    },
    {
      key: 'questions',
      icon: <QuestionCircleOutlined />,
      label: 'Quản lý câu hỏi',
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Thiết lập',
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'quiz-groups':
        router.push('/admin/quiz-groups');
        break;
      case 'manage-quiz':
        router.push('/admin/quiz-management');
        break;
      case 'users':
        router.push('/admin/users');
        break;
      case 'role-permissions':
        router.push('/admin/role-permissions');
        break;
      case 'programs':
        router.push('/admin/programs');
        break;
      case 'questions':
        router.push('/admin/questions');
        break;
      case 'dashboard':
        router.push('/admin/dashboard');
        break;  
      case 'settings':
        router.push('/admin/settings');
        break;
      default:
        router.push('/admin/quiz-groups');
    }
  };

  const getPageTitle = () => {
    const activeKey = getActiveKey();
    const item = menuItems.find(item => item.key === activeKey);
    return item?.label || 'Admin Panel';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        className="flex flex-col"
        style={{
          background: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
          <div className="flex items-center gap-3">
            <div className="text-gray-800 font-bold text-lg">
              {collapsed ? 'Q' : 'Quiz Admin'}
            </div>
            {!collapsed && (
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:text-gray-800"
                title="Hôm nay"
              >
              </button>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: '8px',
          }}
          className="admin-menu"
        />

        {/* Sidebar footer: collapse control moved here */}
        <div className="mt-auto border-t border-gray-100 dark:border-gray-800 px-3 py-2 flex items-center justify-between" style={{paddingBottom: 4}}>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <CalendarOutlined />
            {!collapsed && <span>Hôm nay</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="px-3 py-1 rounded hover:bg-gray-100 text-sm text-gray-600"
            style={{alignSelf: 'flex-end'}}
          >
            {collapsed ? 'Mở' : 'Thu gọn'}
          </button>
        </div>

      </Sider>

      <Layout>
        <Header
          style={{
            padding: 0,
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center space-x-4">
              <button
                className="text-lg p-2 hover:bg-gray-100 rounded"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? '☰' : '✕'}
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 m-0">
                  {getPageTitle()}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, Admin
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: 0,
            minHeight: 280,
            borderRadius: collapsed ? 8 : 0,
          }}
          className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
