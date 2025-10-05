"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { Tree, Spin, Empty, Input } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { BaseService } from '@/services/BaseService';

export interface TreeViewProps {
  service: BaseService;
  titleField?: string; // the property name to show as title
  idField?: string; // the property name that contains id
  rootParams?: Record<string, any> | null; // optional params to send for roots (not currently used)
  onSelect?: (id: string | number | null, node?: Record<string, any>, idList?: Array<string | number>) => void;
  getChildren?: boolean; // when true, return full descendant id list on select
  title?: React.ReactNode;
}

function toTreeNode(obj: Record<string, any>, titleField = 'name', idField = 'id'): DataNode {
  const children = Array.isArray(obj.children) && obj.children.length > 0
    ? obj.children.map((c: any) => toTreeNode(c as Record<string, any>, titleField, idField))
    : undefined;

  // Use hasChildren flag from backend to determine if node is expandable
  const isLeaf = obj.hasChildren === false || (!(children && children.length > 0) && !obj.hasChildren);

  return {
    title: obj[titleField] ?? String(obj[idField] ?? '•'),
    key: String(obj[idField] ?? Math.random()),
    isLeaf,
    children,
    dataRef: obj,
  } as DataNode;
}

export default function TreeView({ service, titleField = 'name', idField = 'id', onSelect, title, getChildren = false }: TreeViewProps) {
  const [treeData, setTreeData] = useState<DataNode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedKeys, setLoadedKeys] = useState<Set<string>>(new Set());
  const [originalTreeData, setOriginalTreeData] = useState<DataNode[] | null>(null);
  const [defaultExpandAll, setDefaultExpandAll] = useState<boolean>(false);
  const [isFullDataset, setIsFullDataset] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const { callback: debouncedSearch, cancel: cancelDebounced } = useDebouncedCallback((v: string) => handleSearch(v), 300);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[] | undefined>(undefined);

  useEffect(() => {
    // Fetch tree data (could be full list if <1000 or just roots if >1000)
    let mounted = true;
    setLoading(true);
    service.getTree()
      .then((nodes) => {
        if (!mounted) return;
        if (!nodes || nodes.length === 0) {
          setTreeData([]);
          setOriginalTreeData([]);
          return;
        }

        // Build hierarchy from flat list
        const converted = buildHierarchyFromFlat(nodes);
        // Detect if backend returned full dataset (some nodes have parentId)
        const hasParentFlag = nodes.some((n: any) => n.parentId !== null && n.parentId !== undefined && n.parentId !== '');
        setIsFullDataset(hasParentFlag);
        if (hasParentFlag) {
          // full dataset: expand all by default
          setDefaultExpandAll(true);
          // expand all nodes
          setExpandedKeys(getAllKeys(converted));
        } else {
          setDefaultExpandAll(false);
        }
        setOriginalTreeData(converted);
        setTreeData(converted);
      })
      .catch((err) => {
        console.error('Failed to load tree:', err);
        if (!mounted) return;
        setTreeData([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [service, titleField, idField]);

  const buildHierarchyFromFlat = (nodes: Record<string, any>[]): DataNode[] => {
    const idKey = idField;
    const nodesById = new Map<string, Record<string, any>>();
    
    nodes.forEach((n: any) => {
      const key = String(n[idKey] ?? Math.random());
      nodesById.set(key, { ...n, children: [] });
    });

    const roots: Record<string, any>[] = [];
    nodes.forEach((n: any) => {
      const key = String(n[idKey]);
      const parentId = n.parentId;
      const nodeRef = nodesById.get(key);
      if (!nodeRef) return;
      
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
        roots.push(nodeRef);
      }
    });

    return roots.map(r => toTreeNode(r as Record<string, any>, titleField, idField));
  };

  // Lazy load children when expanding a node
  const onLoadData = async (node: any): Promise<void> => {
    const nodeKey = String(node.key);
    // If children already present in dataRef or node.children, skip calling API
    const dataRefChildren = node.dataRef && Array.isArray(node.dataRef.children) && node.dataRef.children.length > 0;
    const nodeHasChildrenNodes = node.children && Array.isArray(node.children) && node.children.length > 0;
    if (loadedKeys.has(nodeKey) || dataRefChildren || nodeHasChildrenNodes) {
      // mark as loaded to avoid future calls
      setLoadedKeys(prev => new Set(prev).add(nodeKey));
      return;
    }

    try {
      const nodeId = node.dataRef?.[idField];
      if (nodeId === null || nodeId === undefined) return;

      const children = await service.getChildren(nodeId);
      if (!children || children.length === 0) {
        // No children, mark as leaf
        setTreeData(prevData => updateNodeInTree(prevData, nodeKey, { isLeaf: true }));
        setLoadedKeys(prev => new Set(prev).add(nodeKey));
        return;
      }

      // Convert children to DataNodes
      const childNodes = children.map(child => ({
        title: child[titleField] ?? String(child[idField] ?? '•'),
        key: String(child[idField] ?? Math.random()),
        isLeaf: !child.hasChildren,
        dataRef: child,
      }));

      // Update tree data with new children
      setTreeData(prevData => updateNodeInTree(prevData, nodeKey, { 
        children: childNodes,
        isLeaf: false 
      }));
      
      setLoadedKeys(prev => new Set(prev).add(nodeKey));
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  // Helper to update a specific node in the tree
  const updateNodeInTree = (
    treeData: DataNode[] | null, 
    targetKey: string, 
    updates: Partial<DataNode>
  ): DataNode[] => {
    if (!treeData) return [];
    
    return treeData.map(node => {
      if (node.key === targetKey) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: updateNodeInTree(node.children, targetKey, updates)
        };
      }
      return node;
    });
  };

  // API returns full flat list; we build children client-side so no lazy loading needed.
  // Search handling: if full dataset, do client-side filtering; otherwise call server
  const handleSearch = async (value: string) => {
    const term = value?.trim();
    setSearchValue(term);

    if (!term) {
      // reset to original
      setTreeData(originalTreeData);
      // collapse all when resetting search
      setExpandedKeys([]);
      // ensure defaultExpandAll is disabled so the tree doesn't expand by default
      setDefaultExpandAll(false);
      return;
    }

    if (isFullDataset) {
      // client-side filter keeping ancestors
      const filtered = filterTreeByTerm(originalTreeData || [], term, titleField);
      setTreeData(filtered);
      // expand matched results
      setExpandedKeys(getAllKeys(filtered));
    } else {
      // server search - backend returns matched nodes + ancestors as flat list
      try {
        // Build simple CONTAINS filter payload expected by backend
        const filterPayload = JSON.stringify([{ field: titleField, operator: 'CONTAINS', value: term }]);
        const nodes = await service.getTree(filterPayload);
        const converted = buildHierarchyFromFlat(nodes);
        setTreeData(converted);
        // clear loadedKeys since tree replaced
        setLoadedKeys(new Set());
        // expand matched results returned from server
        setExpandedKeys(getAllKeys(converted));
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  if (loading) return <Spin />;
  if (!treeData || treeData.length === 0) return <Empty description="No hierarchical data" />;

  return (
    <div>
      {title && <div className="py-1 bg-gray-200 text-sm font-semibold text-center">{title}</div>}
      <div className="p-2">
        <Input.Search
          placeholder={`Search ${titleField}`}
          allowClear
          style={{ cursor: 'text' }}
          onChange={(e) => {
            const v = (e.target as HTMLInputElement).value;
            setSearchValue(v);
            if (!v || v.trim() === '') {
              // cancel pending debounced search and reset immediately when input cleared by typing/backspace
              try { cancelDebounced(); } catch (err) { /* ignore */ }
              handleSearch('');
              return;
            }
            debouncedSearch(v);
          }}
          onSearch={(value) => {
            // onSearch is called when pressing Enter or clicking the clear button (allowClear)
            try { cancelDebounced(); } catch (err) { /* ignore */ }
            handleSearch(value ?? '');
          }}
        />
      </div>
      <Tree
        treeData={treeData}
        defaultExpandAll={defaultExpandAll}
        expandedKeys={expandedKeys}
        selectable={true}
        loadData={onLoadData}
        onExpand={(keys) => setExpandedKeys(keys as React.Key[])}
        onSelect={(selectedKeys, info) => {
          const rawKey = selectedKeys && selectedKeys.length > 0 ? selectedKeys[0] : null;
          const key: string | number | null = rawKey === null ? null : String(rawKey);
          const dataRef = (info.node as any)?.dataRef as Record<string, any> | undefined;

          // helper to collect keys from the selected node and all descendants
          const collectKeys = (node: any): Array<string | number> => {
            const list: Array<string | number> = [];
            if (!node) return list;
            const k = node.key ?? (node.dataRef && node.dataRef[idField]) ?? null;
            if (k !== null && k !== undefined) list.push(String(k));
            const children = (node.children ?? []) as any[];
            if (Array.isArray(children)) {
              children.forEach((c) => {
                list.push(...collectKeys(c));
              });
            }
            return list;
          };

          const idList = getChildren && info.node ? collectKeys(info.node) : key !== null ? [key] : [];
          if (onSelect) onSelect(key, dataRef, idList.length > 0 ? idList : undefined);
        }}
      />
    </div>
  );
}

// Filter tree nodes by term (case-insensitive), keeping ancestors of matched nodes
function filterTreeByTerm(nodes: DataNode[], term: string, titleField: string): DataNode[] {
  const lower = term.toLowerCase();

  const filterNode = (node: any): DataNode | null => {
    const title = (node.title ?? '').toString().toLowerCase();
    const children = (node.children || []).map((c: any) => filterNode(c)).filter(Boolean) as DataNode[];
    if (title.includes(lower) || children.length > 0) {
      return { ...node, children } as DataNode;
    }
    return null;
  };

  return nodes.map(n => filterNode(n)).filter(Boolean) as DataNode[];
}

// Collect all keys from tree nodes
function getAllKeys(nodes: DataNode[] | null | undefined): React.Key[] {
  const keys: React.Key[] = [];
  if (!nodes) return keys;
  const collect = (n: any) => {
    if (!n) return;
    if (n.key !== undefined && n.key !== null) keys.push(n.key);
    const children = n.children || [];
    if (Array.isArray(children)) children.forEach((c: any) => collect(c));
  };
  nodes.forEach((n: any) => collect(n));
  return keys;
}
