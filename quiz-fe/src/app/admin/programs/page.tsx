"use client";

import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Tag,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Tooltip,
  Popconfirm,
  TreeSelect,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Program, ProgramTreeNode, usePrograms, useRootPrograms, useProgramTree, useCreateProgram, useUpdateProgram, useDeleteProgram, usePrefetchProgram } from "@/share/hooks/usePrograms";
import { ProgramRequest } from "@/share/services/program/models";

interface TreeSelectOption {
  title: string;
  value: number | string;
  key: number | string;
  children?: TreeSelectOption[];
  disabled?: boolean;
}


export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form] = Form.useForm();

  const { data: programs = [], isLoading, refetch } = usePrograms();
  const { data: rootPrograms = [] } = useRootPrograms();
  const { data: programTree = [] } = useProgramTree();

  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();
  const prefetchProgram = usePrefetchProgram();

  const treeData = useMemo(() => {
    const map = new Map<number | string, any>();
    programs.forEach((p) => map.set(p.id, { ...p, key: p.id }));
    const roots: any[] = [];
    map.forEach((node) => {
      if (node.parentId) {
        const parent = map.get(node.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });
    const sortRec = (arr: any[]) => {
      arr.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      arr.forEach((c) => c.children && sortRec(c.children));
    };
    sortRec(roots);
    return roots;
  }, [programs]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return treeData;
    const programMap = new Map<number | string, Program>();
    programs.forEach((p) => programMap.set(p.id, p));
    const include = new Set<number | string>();
    programs.forEach((p) => {
      if (p.name.toLowerCase().includes(search.toLowerCase())) {
        let cur: Program | undefined = p;
        include.add(cur.id);
        while (cur && cur.parentId) {
          include.add(cur.parentId);
          cur = programMap.get(cur.parentId);
        }
      }
    });
    const nodeMap = new Map<number | string, any>();
    programs.forEach((p) => {
      if (include.has(p.id)) nodeMap.set(p.id, { ...p, key: p.id });
    });
    const roots: any[] = [];
    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId);
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });
    const sortRec = (arr: any[]) => {
      arr.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      arr.forEach((c) => c.children && sortRec(c.children));
    };
    sortRec(roots);
    return roots;
  }, [search, treeData, programs]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: Program) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      parentId: record.parentId ?? null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    await deleteProgram.mutateAsync(Number(id));
    refetch();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      level: values.level ?? 1,
      isActive: values.isActive ?? true,
      displayOrder: values.displayOrder ?? 0,
    };
    if (editing) {
      await updateProgram.mutateAsync({ id: Number(editing.id), data: payload });
    } else {
      await createProgram.mutateAsync(payload);
    }
    setModalOpen(false);
    form.resetFields();
    refetch();
  };

  const parentOptions = useMemo(() => rootPrograms.map((r) => ({ title: r.name, value: r.id, key: r.id })), [rootPrograms]);

  const parentTreeOptions = useMemo(() => {
    const convertToTreeSelectOptions = (nodes: ProgramTreeNode[]): TreeSelectOption[] => {
      return nodes
        .filter(node => !node.quizGroupCount || node.quizGroupCount === 0)
        .map(node => {
          const children = node.children ? convertToTreeSelectOptions(node.children) : undefined;
          return {
            title: node.name,
            value: node.id,
            key: node.id,
            children: children && children.length > 0 ? children : undefined,
          };
        });
    };
    
    const buildTreeFromFlat = (items: ProgramTreeNode[]): TreeSelectOption[] => {
      const map = new Map<number | string, TreeSelectOption & { parentId?: number | null }>();
      const roots: TreeSelectOption[] = [];

      items
        .filter(item => !item.quizGroupCount || item.quizGroupCount === 0)
        .forEach(item => {
          map.set(item.id, {
            title: item.name,
            value: item.id,
            key: item.id,
            parentId: item.parentId,
            children: [],
          });
        });

      map.forEach(node => {
        if (node.parentId && map.has(node.parentId)) {
          const parent = map.get(node.parentId)!;
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      });

      const cleanChildren = (nodes: TreeSelectOption[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length === 0) {
            node.children = undefined;
          } else if (node.children) {
            cleanChildren(node.children);
          }
        });
      };
      cleanChildren(roots);

      return roots;
    };

    if (programTree.length > 0 && programTree[0].children) {
      return convertToTreeSelectOptions(programTree);
    }
    return buildTreeFromFlat(programTree);
  }, [programTree]);

  const columns: ColumnsType<any> = [
    { title: "Name", dataIndex: "name", key: "name", ellipsis: true },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 120,
      render: (lvl: number) => <Tag color={lvl === 1 ? "green" : lvl === 2 ? "orange" : "red"}>{lvl === 1 ? "Beginner" : lvl === 2 ? "Intermediate" : "Advanced"}</Tag>,
    },
    { title: "Order", dataIndex: "displayOrder", key: "displayOrder", width: 90 },
    { title: "Status", dataIndex: "isActive", key: "isActive", width: 110, render: (v: boolean) => <Tag color={v ? "success" : "error"}>{v ? "Active" : "Inactive"}</Tag> },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: any, record: Program) => (
        <Space>
          <Tooltip title="View">
            <Button type="text" icon={<EyeOutlined />} onMouseEnter={() => prefetchProgram(Number(record.id))} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm title={`Delete ${record.name}?`} onConfirm={() => handleDelete(record.id)} okText="Delete" cancelText="Cancel">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Programs Management</h1>
        <p className="text-gray-600">Manage learning programs and curriculum structure</p>
      </div>

      <Row gutter={16} className="mb-4">
        <Col flex="auto">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search programs by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 400 }}
          />
        </Col>
        <Col>
          <Space>
            <Tooltip title="Add program">
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} />
            </Tooltip>
            <Tooltip title="Reload list">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table columns={columns} dataSource={filteredTree} rowKey="id" loading={isLoading} pagination={false} size="small" />
      </Card>

      <Modal title={editing ? "Sửa chương trình ôn luyện" : "Thêm chương trình ôn luyện"} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText={editing ? "Update" : "Create"}>
        <Form layout="vertical" form={form} initialValues={{ level: 1, isActive: true }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter a name" }]}>
            <Input placeholder="Enter program name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter program description (optional)" />
          </Form.Item>
          <Form.Item name="parentId" label="Parent Program">
            <TreeSelect 
              treeDefaultExpandAll 
              allowClear 
              treeData={parentTreeOptions} 
              placeholder="Select parent program (only programs without quiz groups)" 
              showSearch
              treeNodeFilterProp="title"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
