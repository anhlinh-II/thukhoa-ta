import React, { useEffect, useState } from 'react';
import { Avatar, Menu, MenuProps, Dropdown, Space, Button, Spin, Switch } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, HistoryOutlined, GlobalOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAccount, useLogout } from '../hooks/useAuth';
import { t, defaultLang } from '@/share/locales';

interface UserProfileProps {
  onLogout?: () => void;
  showDetails?: boolean; // when false, only render avatar (no name/email)
}

/**
 * Component to display user profile and account menu
 */
export const UserProfile: React.FC<UserProfileProps> = ({ onLogout, showDetails = true }) => {
  const { data: user, isLoading } = useAccount();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [lang, setLang] = useState<string>(defaultLang);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
      if (stored) setLang(stored);
    } catch (e) {}

    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce?.detail) setLang(ce.detail);
    };

    window.addEventListener('langChange', handler as EventListener);
    return () => window.removeEventListener('langChange', handler as EventListener);
  }, []);

  if (isLoading) {
    return <Spin />;
  }

  if (!user) {
    return null;
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link href="/profile">{t(lang, 'account')}</Link>,
      icon: <UserOutlined />,
    },
    // language toggle (moved up so it's higher in the menu). Stop propagation so dropdown stays open.
    {
      key: 'language',
      label: (
        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, paddingBottom: 6 }}>
          <GlobalOutlined />
          <span style={{ flex: '0 0 auto', fontSize: 13 }}>{t(lang, 'language')}</span>
          <div style={{ marginLeft: 'auto' }}>
            <Switch
              checked={lang === 'en'}
              onChange={(checked) => {
                const newLang = checked ? 'en' : 'vi';
                try {
                  localStorage.setItem('lang', newLang);
                } catch (e) {}
                // dispatch event but keep dropdown open (we prevented propagation)
                window.dispatchEvent(new CustomEvent('langChange', { detail: newLang }));
                setLang(newLang);
              }}
              checkedChildren={t(lang, 'english')}
              unCheckedChildren={t(lang, 'vietnamese')}
              size="small"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'history',
      label: <Link href="/quiz-history">{t(lang, 'quizHistory')}</Link>,
      icon: <HistoryOutlined />,
    },
    {
      key: 'settings',
      label: <Link href="/profile">{t(lang, 'settings')}</Link>,
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: t(lang, 'logout'),
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
        {showDetails && (
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 500, fontSize: '14px' }}>
              {user.name || user.username || user.email}
            </span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {user.email}
            </span>
          </div>
        )}
      </Space>
    </Dropdown>
  );
};

