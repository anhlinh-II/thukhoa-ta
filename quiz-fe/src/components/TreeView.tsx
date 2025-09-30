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
  const children = Array.isArray(obj.children) && obj.children.length > 0
    ? obj.children.map((c: any) => toTreeNode(c as Record<string, any>, titleField, idField))
    : undefined;

  return {
    title: obj[titleField] ?? String(obj[idField] ?? '•'),
    key: String(obj[idField] ?? Math.random()),
    isLeaf: !(children && children.length > 0),
    children,
    dataRef: obj,
  } as DataNode;
}

export default function TreeView({ service, titleField = 'name', idField = 'id' }: TreeViewProps) {
  const [treeData, setTreeData] = useState<DataNode[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // API now returns a flat list. We fetch the flat list via service.getTree()
    // and build the parent-child hierarchy client-side using the `parentId` field.
    let mounted = true;
    setLoading(true);
    service.findAll()
      .then((nodes) => {
        if (!mounted) return;
        if (!nodes) {
          setTreeData([]);
          return;
        }

        // Build map of id -> node (with children array)
        const idKey = idField;
        const nodesById = new Map<string, Record<string, any>>();
        nodes.forEach((n: any) => {
          const key = String(n[idKey] ?? Math.random());
          // clone and ensure children array
          nodesById.set(key, { ...n, children: [] });
        });

        // Attach children to parents
        const roots: Record<string, any>[] = [];
        nodes.forEach((n: any) => {
          const key = String(n[idKey]);
          const parentId = n.parentId;
          const nodeRef = nodesById.get(key);
          if (!nodeRef) return; // defensive
          // treat null/undefined/empty string as root
          if (parentId === null || parentId === undefined || parentId === '') {
            roots.push(nodeRef);
            return;
          }
          const parentKey = String(parentId);
          const parentRef = nodesById.get(parentKey);
          if (parentRef) {
            parentRef.children = parentRef.children || [];
            parentRef.children.push(nodeRef);
          } else {
            // parent missing (or filtered out) -> treat as root
            roots.push(nodeRef);
          }
        });

        // Convert to DataNode structure
        const converted = roots.map(r => toTreeNode(r as Record<string, any>, titleField, idField));
        setTreeData(converted);
      })
      .catch(() => {
        if (!mounted) return;
        setTreeData([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [service, titleField, idField]);

  // API returns full flat list; we build children client-side so no lazy loading needed.

  if (loading) return <Spin />;
  if (!treeData || treeData.length === 0) return <Empty description="No hierarchical data" />;

  return (
    <Tree
      treeData={treeData}
      defaultExpandAll={true}
    />
  );
}
