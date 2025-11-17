"use client";
import React, { useEffect, useState } from "react";
import { Tree, Card, Typography, Spin, message, Breadcrumb } from "antd";
import { useRouter } from "next/navigation";
import type { DataNode } from "antd/es/tree";
import { programService } from "@/share/services/program/programService";

const { Title } = Typography;

interface TreeNode extends DataNode {
  id: number;
  title: string;
  key: string;
  children?: TreeNode[];
  isLeaf?: boolean;
}

export default function ProgramsPage() {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProgramsTree = async () => {
    setLoading(true);
    try {
      // getTree() doesn't need any parameters - it returns all programs in hierarchical structure
      const resp: any = await programService.getTree();

      // The getTree method returns hierarchical data
      const treeNodes = buildTreeNodes(resp || []);
      setTreeData(treeNodes);
    } catch (err: any) {
      console.error("Fetch programs tree error", err);
      message.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const buildTreeNodes = (data: any[]): TreeNode[] => {
    if (!Array.isArray(data)) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      title: item.name || `Program ${item.id}`,
      key: `program-${item.id}`,
      children: item.children && Array.isArray(item.children) && item.children.length > 0
        ? buildTreeNodes(item.children)
        : undefined,
      isLeaf: !item.children || item.children.length === 0,
    }));
  };

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    if (selectedKeys.length > 0) {
      const node = info.node as TreeNode;
      // Navigate to quiz groups page with program ID
      router.push(`/programs/${node.id}/quiz-groups`);
    }
  };

  useEffect(() => {
    fetchProgramsTree();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Breadcrumb>
              <Breadcrumb.Item onClick={() => router.push('/')}>Trang chủ</Breadcrumb.Item>
              <Breadcrumb.Item>Chương Trình Ôn Luyện</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={3} className="!m-0 mt-2">
              Chương Trình Ôn Luyện
            </Title>
          </div>
        </div>

        {loading ? (
          <div className="w-full text-center py-12">
            <Spin />
          </div>
        ) : (
          <Tree
            treeData={treeData}
            onSelect={handleSelect}
            showLine
            defaultExpandAll
            style={{ fontSize: '16px' }}
          />
        )}
      </Card>
    </div>
  );
}
