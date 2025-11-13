import React from 'react';
import { Avatar, Menu, MenuProps, Dropdown, Space, Button, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, HistoryOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAccount, useLogout } from '../hooks/useAuth';

interface UserProfileProps {
  onLogout?: () => void;
}

/**
 * Component to display user profile and account menu
 */
export const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { data: user, isLoading } = useAccount();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (isLoading) {
    return <Spin />;
  }

  if (!user) {
    return null;
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link href="/profile">Tài khoản</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'history',
      label: <Link href="/quiz-history">Lịch sử làm bài</Link>,
      icon: <HistoryOutlined />,
    },
    {
      key: 'settings',
      label: <Link href="/profile">Cài đặt</Link>,
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logout(),
    },
  ];

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const names = name.split(' ');
      return names
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
      <Space size="small" style={{ cursor: 'pointer' }}>
        <div style={{ position: 'relative' }}>
          <Avatar
          size="large"
          icon={<UserOutlined />}
          src={user.avatar}
          alt={user.name || user.email}
          style={{
            backgroundColor: '#1890ff',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {getInitials(user.name, user.email)}
          </Avatar>
          {/* small upload button could be added here in future */}
        </div>
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500, fontSize: '14px' }}>
            {user.name || user.username || user.email}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {user.email}
          </span>
        </div>
      </Space>
    </Dropdown>
  );
};

