"use client";
import Link from 'next/link';
import { Button, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated, useAccount } from '@/share/hooks/useAuth';
import { programService } from '@/share/services/program/programService';
import { UserProfile } from '../UserProfile';
import { NO_HEADER_LIST } from '@/share/utils/constants';
import { navigateWithLoader } from '@/share/utils/functions';

interface ProgramNode {
  id: number;
  name: string;
  children?: ProgramNode[];
}

interface ProgramMenuItemProps {
  program: ProgramNode;
  onSelect: (id: number) => void;
}

function ProgramMenuItem({ program, onSelect }: ProgramMenuItemProps) {
  const [showChildren, setShowChildren] = useState(false);
  const hasChildren = program.children && program.children.length > 0;

  const handleClick = () => {
    if (!hasChildren) {
      onSelect(program.id);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowChildren(true)}
      onMouseLeave={() => setShowChildren(false)}
    >
      <div
        onClick={handleClick}
        className={`px-4 py-2 hover:bg-sky-50 transition-colors flex items-center justify-between ${!hasChildren ? 'cursor-pointer' : 'cursor-default'
          }`}
      >
        <span className="text-gray-700 font-medium">{program.name}</span>
        {hasChildren && (
          <svg
            className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>

      {hasChildren && showChildren && (
        <div
          className="absolute left-full top-0 pl-2 z-50"
          style={{ minHeight: '100%' }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] py-2">
            {program.children!.map((child) => (
              <ProgramMenuItem
                key={child.id}
                program={child}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SidebarProgramItemProps {
  program: ProgramNode;
  onSelect: (id: number) => void;
  level?: number;
}

function SidebarProgramItem({ program, onSelect, level = 0 }: SidebarProgramItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = program.children && program.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleClick = () => {
    if (!hasChildren) {
      onSelect(program.id);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between w-full text-left px-4 py-2 rounded-lg transition-colors ${level === 0 ? 'text-gray-800' : 'text-gray-600 text-sm'
          } ${!hasChildren ? 'hover:bg-sky-50 hover:text-sky-600 cursor-pointer' : ''}`}
        style={{ paddingLeft: `${16 + level * 16}px` }}
        onClick={handleClick}
      >
        <span className={hasChildren ? 'font-medium' : ''}>{program.name}</span>
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          >
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="overflow-hidden">
          {program.children!.map((child) => (
            <SidebarProgramItem
              key={child.id}
              program={child}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeaderClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [programs, setPrograms] = useState<ProgramNode[]>([]);
  const [showProgramMenu, setShowProgramMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const { data: currentUser } = useAccount();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAdmin = currentUser?.authorities?.some(
    (auth: { authority?: string }) => auth?.authority === 'SUPER_ADMIN' || auth?.authority === 'ADMIN'
  ) ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // set initial
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Hide header on specific routes (admin, quiz-taking, etc.)
  // Use startsWith so subroutes are also covered. Allow explicit exceptions
  // (e.g. keep header on '/quiz-taking/config/*').
  if (typeof pathname === 'string') {
    const hidePrefixes = NO_HEADER_LIST;
    if (hidePrefixes.some(prefix => pathname.startsWith(prefix))) {
      // Exception: show header for quiz-taking config pages
      if (pathname.startsWith('/quiz-taking/config')) {
        // continue rendering header
      } else {
        return null;
      }
    }
  }

  // Build tree structure from flat list (hoisted function to allow calls before declaration)
  function buildTree(flatList: any[]): ProgramNode[] {
    const map = new Map<number, ProgramNode>();
    const roots: ProgramNode[] = [];

    // First pass: Create all nodes
    flatList.forEach(item => {
      map.set(item.id, {
        id: item.id,
        name: item.name,
        children: []
      });
    });

    // Second pass: Build parent-child relationships
    flatList.forEach(item => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        // Root node (no parent)
        roots.push(node);
      }
    });

    // Sort by displayOrder if available
    const sortNodes = (nodes: ProgramNode[]) => {
      nodes.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(roots);
    return roots;
  }

  async function fetchPrograms() {
    try {
      const resp: any = await programService.getTree();
      console.log('Programs flat data:', resp);

      // Build tree structure from flat list
      const treeData = buildTree(resp || []);
      console.log('Programs tree structure:', treeData);

      setPrograms(treeData);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    }
  }

  const handleProgramClick = (programId: number) => {
    setShowProgramMenu(false);
    setSidebarOpen(false);
    navigateWithLoader(router, `/programs/${programId}/quiz-groups`);
  };

  const headerContent = (
    <header className={`sticky top-0 z-30 px-4 sm:px-6 py-2 transition-colors duration-200 ${scrolled ? 'bg-white backdrop-blur-md shadow-md' : 'bg-white backdrop-blur-sm'}`}>
      <nav className={`max-w-7xl mx-auto text-gray-800`}>
        <div className="flex items-center justify-between">
          {/* left: hamburger on mobile, logo + nav on desktop */}
          <div className="flex items-center gap-8">
            {/* Hamburger button - mobile only */}
            <button
              aria-label="Toggle menu"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 md:hidden"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              {!sidebarOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img src="/img/logo.png" alt="ThuKhoa-TA" className="h-10 w-auto object-contain" />
            </Link>

            {/* Desktop nav - inline with logo */}
            <div className="hidden md:flex items-center space-x-1 font-semibold">
              {/* Programs Dropdown */}
              <div
                className="relative z-50"
                onMouseEnter={() => setShowProgramMenu(true)}
                onMouseLeave={() => setShowProgramMenu(false)}
              >
                <span className="group flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-50 transition-all duration-200 cursor-pointer whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Chương trình
                  <svg className={`w-3 h-3 text-sky-600 transition-transform duration-200 ${showProgramMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>

                {showProgramMenu && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 min-w-[280px] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {programs.length > 0 ? (
                        programs.map((program) => (
                          <ProgramMenuItem
                            key={program.id}
                            program={program}
                            onSelect={handleProgramClick}
                          />
                        ))
                      ) : (
                        <div className="px-4 py-6 flex items-center justify-center text-gray-500">
                          <Spin size="small" />
                          <span className="ml-2">Đang tải chương trình...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {false && (
                <Link href="/grammar" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-200 transition-all duration-200 whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sky-600">Ngữ pháp</span>
                </Link>
              )}
              <span className="hover:bg-sky-100 rounded-lg transition-all duration-400">
                <Link href="/vocabulary" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-200 transition-all duration-200 whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="text-sky-600">Từ vựng</span>
                </Link>
              </span>
              <span className="hover:bg-sky-100 rounded-lg transition-all duration-400">
                <Link href="/battle" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-200 transition-all duration-200 whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sky-600">Thách đấu</span>
                </Link>
              </span>

              <span className="hover:bg-sky-100 rounded-lg transition-all duration-400">
                <Link href="/leaderboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-200 transition-all duration-200 whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sky-600">Xếp hạng</span>
                </Link>
              </span>

              <span className="hover:bg-sky-100 rounded-lg transition-all duration-400">
                <Link href="/review" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-200 transition-all duration-200 whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sky-600">Ôn tập</span>
                </Link>
              </span>

              {isAdmin && (
              <span className="hover:bg-sky-100 rounded-lg transition-all duration-400">
                <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sky-600 font-semibold text-sm hover:bg-sky-200 transition-all duration-200 whitespace-nowrap">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sky-600">Quản trị</span>
                </Link>
              </span>
              )}

            </div>
          </div>

          {/* Mobile: logo center placeholder */}
          <div className="flex-1 flex items-center justify-center md:hidden">
            {/* Empty on mobile - logo is in left section but centered via CSS when hamburger is shown */}
          </div>

          {/* right: profile / auth buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block">
                  <UserProfile showDetails />
                </div>
                <div className="block md:hidden">
                  <UserProfile showDetails={false} />
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button type="text" className="text-gray-800 border-gray-300 hover:bg-purple-50 hover:text-sky-600 transition-all">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button type="primary" className="font-medium">Đăng ký</Button>
                  </Link>
                </div>
                <div className="block md:hidden">
                  <Link href="/auth/login">
                    <Button type="text" className="text-gray-800">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.632 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );

  const sidebarContent = (
    <>
      {/* Overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 9998 }}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ zIndex: 9999 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <img src="/img/logo.png" alt="logo" className="h-8 w-auto object-contain" />
          </div>
          <button aria-label="Close menu" onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 overflow-y-auto bg-white" style={{ height: 'calc(100% - 65px)' }}>
          <nav className="flex flex-col gap-1">
            <Link href="/vocabulary" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sky-600 font-medium hover:bg-sky-50 transition-all duration-200 active:scale-[0.98]">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Từ vựng
            </Link>
            <Link href="/battle" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sky-600 font-medium hover:bg-sky-50 transition-all duration-200 active:scale-[0.98]">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Battle
            </Link>
            <Link href="/leaderboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sky-600 font-medium hover:bg-sky-50 transition-all duration-200 active:scale-[0.98]">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Bảng xếp hạng
            </Link>
            <Link href="/review" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sky-600 font-medium hover:bg-sky-50 transition-all duration-200 active:scale-[0.98]">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ôn tập
            </Link>
            {isAdmin && (
            <Link href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sky-600 font-medium hover:bg-sky-50 transition-all duration-200 active:scale-[0.98]">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Quản trị
            </Link>
            )}
            <div className="pt-4 mt-2 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 mb-3 px-4">
                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Chương trình ôn luyện
              </div>
              {programs.length > 0 ? (
                programs.map((p) => (
                  <SidebarProgramItem
                    key={p.id}
                    program={p}
                    onSelect={(id) => { handleProgramClick(id); setSidebarOpen(false); }}
                  />
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">Đang tải...</div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );

  return (
    <>
      {headerContent}
      {mounted && createPortal(sidebarContent, document.body)}
    </>
  );
}
