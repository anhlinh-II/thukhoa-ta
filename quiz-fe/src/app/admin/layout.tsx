"use client";
import { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { 
  AppstoreOutlined, 
  BookOutlined, 
  DashboardOutlined,
  SettingOutlined 
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
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Determine active key based on pathname
  const getActiveKey = () => {
    if (pathname.includes('/admin/quiz-groups')) return 'quiz-groups';
    if (pathname.includes('/admin/programs')) return 'programs';
    if (pathname.includes('/admin/dashboard')) return 'dashboard';
    if (pathname.includes('/admin/settings')) return 'settings';
    if (pathname.includes('/admin/test-base')) return 'test-base';
    return 'quiz-groups'; // default
  };

  const menuItems = [
    {
      key: 'quiz-groups',
      icon: <AppstoreOutlined />,
      label: 'Quiz Groups',
    },
    {
      key: 'programs',
      icon: <BookOutlined />,
      label: 'Programs',
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'test-base',
      icon: <AppstoreOutlined />,
      label: 'Base Demo',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'quiz-groups':
        router.push('/admin/quiz-groups');
        break;
      case 'programs':
        router.push('/admin/programs');
        break;
      case 'dashboard':
        router.push('/admin/dashboard');
        break;
      case 'settings':
        router.push('/admin/settings');
        break;
      case 'test-base':
        router.push('/admin/test-base');
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
        style={{
          background: '#ffffff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="text-gray-800 font-bold text-lg">
            {collapsed ? 'Q' : 'Quiz Admin'}
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
      </Sider>
      
      <Layout>
        <Header 
          style={{ 
            padding: 0, 
            background: colorBgContainer,
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
            borderRadius: collapsed ? borderRadiusLG : 0,
          }}
          className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
