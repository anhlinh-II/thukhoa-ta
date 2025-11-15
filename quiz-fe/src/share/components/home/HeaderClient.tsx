"use client";
import Link from 'next/link';
import { Button, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/share/hooks/useAuth';
import { navigateWithLoader } from '@/share/lib/navigateWithLoader';
import { programService } from '@/share/services/program/programService';
import { UserProfile } from '../UserProfile';
import { NO_HEADER_LIST } from '@/share/utils/constants';

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
    // Chỉ navigate nếu là leaf node (không có children)
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
        className={`px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between ${
          !hasChildren ? 'cursor-pointer' : 'cursor-default'
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

      {/* Children dropdown (appears on the right when hovering parent) */}
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

export default function HeaderClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [programs, setPrograms] = useState<ProgramNode[]>([]);
  const [showProgramMenu, setShowProgramMenu] = useState(false);
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [scrolled, setScrolled] = useState(false);

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
  // Use startsWith so subroutes are also covered.
  if (typeof pathname === 'string') {
    const hidePrefixes = NO_HEADER_LIST;
    if (hidePrefixes.some(prefix => pathname.startsWith(prefix))) {
      return null;
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
    // use navigateWithLoader so global loader appears during navigation
    navigateWithLoader(router, `/programs/${programId}/quiz-groups`);
  };

  return (
    <header className={`sticky top-0 z-30 px-6 py-4 transition-colors duration-200 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-white/60 backdrop-blur-sm'}`}>
      <nav className={`flex items-center justify-between max-w-7xl mx-auto text-gray-800`}> 
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-purple-600 font-bold text-xl">TKA</span>
          </div>
          <span className="text-gray-800 font-bold text-xl">ThuKhoa-TA</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-semibold">
          {/* Programs Dropdown */}
          <div 
            className="relative z-50"
            onMouseEnter={() => setShowProgramMenu(true)}
            onMouseLeave={() => setShowProgramMenu(false)}
          >
            <span className="text-gray-700 font-bold hover:text-purple-600 transition-colors cursor-pointer">
              Chương trình ôn luyện
            </span>
            
            {showProgramMenu && (
              <div className="absolute top-full left-0 pt-4 z-50">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] py-2">
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

          <Link href="/grammar" className="text-gray-700 font-bold hover:text-purple-600 transition-colors">Ngữ pháp</Link>
          <Link href="/vocabulary" className="text-gray-700 font-bold hover:text-purple-600 transition-colors">Từ vựng</Link>
          <Link href="/leaderboard" className="text-gray-700 font-bold hover:text-purple-600 transition-colors">Bảng xếp hạng</Link>
          <Link href="/admin" className="text-gray-700 font-bold hover:text-purple-600 transition-colors">Quản trị</Link>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Button type="text" disabled>Đang tải...</Button>
          ) : isAuthenticated ? (
            <UserProfile />
          ) : (
            <>
              <Link href="/auth/login">
                <Button type="text" className="text-gray-800 border-gray-300 hover:bg-purple-50 hover:text-purple-600 transition-all">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button type="primary" className="font-medium">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
