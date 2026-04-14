"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  Empty,
  Popconfirm,
  ColorPicker,
} from "antd";
import messageService from '@/share/services/messageService';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/share/hooks/useAuth";
import {
  flashcardCategoryService,
} from "@/share/services/my_flashcard/my-flashcard.service";
import {
  FlashcardCategoryView,
  FlashcardCategoryRequest,
} from "@/share/services/my_flashcard/models";
import { COLOR_CODE } from "@/share/utils/constants";

const CATEGORY_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function MyFlashcardsPage() {
  const { isAuthenticated, user } = useIsAuthenticated();
  const router = useRouter();
  const [categories, setCategories] = useState<FlashcardCategoryView[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FlashcardCategoryView | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await flashcardCategoryService.getMyCategories();
      setCategories(data || []);
    } catch (e) {
      console.error(e);
      messageService.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ color: "#3b82f6" });
    setModalOpen(true);
  };

  const openEditModal = (cat: FlashcardCategoryView) => {
    setEditingCategory(cat);
    form.setFieldsValue({
      name: cat.name,
      description: cat.description,
      color: cat.color || "#3b82f6",
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      let colorValue = values.color;
      if (typeof colorValue === "object" && colorValue?.toHexString) {
        colorValue = colorValue.toHexString();
      }

      const req: FlashcardCategoryRequest = {
        name: values.name,
        color: colorValue,
      };

      if (editingCategory) {
        await flashcardCategoryService.update(editingCategory.id, req);
        messageService.success("Đã cập nhật danh mục");
      } else {
        await flashcardCategoryService.create(req);
        messageService.success("Đã tạo danh mục");
      }

      setModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      console.error(e);
      messageService.error(e?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await flashcardCategoryService.delete(id);
      messageService.success("Đã xóa danh mục");
      fetchCategories();
    } catch (e) {
      console.error(e);
      messageService.error("Không thể xóa danh mục");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Flashcard của tôi</h2>
          <p className="mb-4">Bạn cần đăng nhập để sử dụng tính năng này.</p>
          <Link href="/auth/login">
            <Button type="primary">Đăng nhập</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div 
          className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6"
          style={{ borderTop: "4px solid #3b82f6" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link href="/vocabulary" className="shrink-0">
              <Button type="default">← Quay lại</Button>
            </Link>
            
            <h1 className="flex-1 text-2xl sm:text-3xl font-bold text-sky-600 text-center sm:text-left">
              Flashcard của tôi
            </h1>

            <Button
              type="primary"
              icon={<PlusOutlined style={{fontWeight: '800'}} />}
              onClick={openCreateModal}
              className="shrink-0"
              style={{fontWeight: '600', backgroundColor: COLOR_CODE.SKY_600, borderColor: COLOR_CODE.SKY_600}}
            >
              Tạo danh mục
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : categories.length === 0 ? (
          <Card className="text-center py-12">
            <Empty
              description="Chưa có danh mục nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              className="mt-4"
            >
              Tạo danh mục đầu tiên
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                style={{ borderTop: `4px solid ${cat.color || "#3b82f6"}` }}
                onClick={() =>
                  router.push(`/vocabulary/my-flashcards/${cat.id}`)
                }
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color || "#3b82f6"}20` }}
                  >
                    <FolderOutlined
                      style={{
                        fontSize: 24,
                        color: cat.color || "#3b82f6",
                      }}
                    />
                  </div>
                  <div
                    className="flex gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(cat)}
                    />
                    <Popconfirm
                      title="Xóa danh mục này?"
                      description="Tất cả thẻ trong danh mục cũng sẽ bị xóa."
                      onConfirm={() => handleDelete(cat.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1 truncate">
                  {cat.name}
                </h3>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <span className="text-sm text-gray-500">
                    {cat.cardCount || 0} thẻ
                  </span>
                  {(cat.cardCount || 0) > 0 && (
                    <Button
                      type="primary"
                      size="middle"
                      icon={<PlayCircleOutlined />}
                      style={{backgroundColor: COLOR_CODE.SKY_500}}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/vocabulary/my-flashcards/${cat.id}/study`
                        );
                      }}
                    >
                      Học
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          title={editingCategory ? "Sửa danh mục" : "Tạo danh mục mới"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={submitting}
          okText={editingCategory ? "Cập nhật" : "Tạo"}
          cancelText="Hủy"
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Tên danh mục"
              rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
            >
              <Input placeholder="Ví dụ: Từ vựng IELTS" />
            </Form.Item>

            <Form.Item name="color" label="Màu sắc">
              <ColorPicker
                showText
                presets={[
                  {
                    label: "Màu gợi ý",
                    colors: CATEGORY_COLORS,
                  },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
