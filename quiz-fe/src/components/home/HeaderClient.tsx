"use client";
import Link from 'next/link';
import { Button } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { programService } from '@/services/programService';
import { useIsAuthenticated } from '@/hooks/useAuth';
import { UserProfile } from '@/components/UserProfile';

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
  const [programs, setPrograms] = useState<ProgramNode[]>([]);
  const [showProgramMenu, setShowProgramMenu] = useState(false);
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Build tree structure from flat list
  const buildTree = (flatList: any[]): ProgramNode[] => {
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
  };

  const fetchPrograms = async () => {
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
  };

  const handleProgramClick = (programId: number) => {
    setShowProgramMenu(false);
    router.push(`/programs/${programId}/quiz-groups`);
  };

  return (
    <header className="relative z-20 px-6 py-4">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-purple-600 font-bold text-xl">TKA</span>
          </div>
          <span className="text-blue-100 font-bold text-xl">ThuKhoa-TA</span>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-semibold">
          {/* Programs Dropdown */}
          <div 
            className="relative z-50"
            onMouseEnter={() => setShowProgramMenu(true)}
            onMouseLeave={() => setShowProgramMenu(false)}
          >
            <span className="text-blue-200 font-bold hover:text-purple-200 transition-colors cursor-pointer">
              Chương trình ôn luyện
            </span>
            
            {showProgramMenu && programs.length > 0 && (
              <div className="absolute top-full left-0 pt-4 z-50">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] py-2">
                  {programs.map((program) => (
                    <ProgramMenuItem 
                      key={program.id} 
                      program={program} 
                      onSelect={handleProgramClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/grammar" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Ngữ pháp</Link>
          <Link href="/vocabulary" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Từ vựng</Link>
          <Link href="/leaderboard" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Bảng xếp hạng</Link>
          <Link href="/admin" className="text-blue-200 font-bold hover:text-purple-200 transition-colors">Quản trị</Link>
        </div>

        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Button type="text" disabled>Đang tải...</Button>
          ) : isAuthenticated ? (
            <UserProfile />
          ) : (
            <>
              <Link href="/auth/login">
                <Button type="text" className="text-gray-700 border-gray-300 hover:bg-purple-50 hover:text-purple-600 transition-all">
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
