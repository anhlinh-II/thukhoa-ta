"use client";

import React, { useEffect, useState } from 'react';
import { Tree, Spin, Empty } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { BaseService } from '@/services/BaseService';

export interface TreeViewProps {
  service: BaseService;
  titleField?: string; // the property name to show as title
  idField?: string; // the property name that contains id
  rootParams?: Record<string, any> | null; // optional params to send for roots (not currently used)
}

function toTreeNode(obj: Record<string, any>, titleField = 'name', idField = 'id'): DataNode {
  return {
    title: obj[titleField] ?? String(obj[idField] ?? '•'),
    key: String(obj[idField] ?? Math.random()),
    isLeaf: !(obj.children && obj.children.length > 0),
    dataRef: obj,
  } as DataNode;
}

export default function TreeView({ service, titleField = 'name', idField = 'id' }: TreeViewProps) {
  const [treeData, setTreeData] = useState<DataNode[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    service.getTree()
      .then((nodes) => {
        if (!mounted) return;
        if (!nodes) {
          setTreeData([]);
          setLoading(false);
          return;
        }
        const converted = nodes.map(n => toTreeNode(n as Record<string, any>, titleField, idField));
        setTreeData(converted);
      })
      .catch(() => {
        if (!mounted) return;
        setTreeData([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [service, titleField, idField]);

  const onLoadData = async (treeNode: any) => {
    const nodeData = treeNode.dataRef as Record<string, any>;
    const parentId = nodeData[idField];
    treeNode.loading = true;
    try {
      const children = await service.getChildren(parentId);
      const childNodes = (children || []).map((c: any) => toTreeNode(c, titleField, idField));
      // attach children to the dataRef and update tree nodes
      treeNode.dataRef.children = children;
      const update = (list: DataNode[]): DataNode[] =>
        list.map(n => {
          if (n.key === treeNode.key) {
            return { ...n, children: childNodes, isLeaf: childNodes.length === 0 } as DataNode;
          }
          if (n.children) {
            return { ...n, children: update(n.children) } as DataNode;
          }
          return n;
        });
      setTreeData(prev => prev ? update(prev) : prev);
    } finally {
      treeNode.loading = false;
    }
  };

  if (loading) return <Spin />;
  if (!treeData || treeData.length === 0) return <Empty description="No hierarchical data" />;

  return (
    <Tree
      treeData={treeData}
      loadData={onLoadData}
      defaultExpandAll={false}
    />
  );
}
