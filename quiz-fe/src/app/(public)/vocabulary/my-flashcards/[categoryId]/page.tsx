"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Popconfirm,
  List,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useIsAuthenticated } from "@/share/hooks/useAuth";
import {
  flashcardCategoryService,
  flashcardItemService,
} from "@/share/services/my_flashcard/my-flashcard.service";
import {
  FlashcardCategoryView,
  FlashcardItemView,
  FlashcardItemRequest,
} from "@/share/services/my_flashcard/models";

const highlightWord = (text: string, word: string) => {
  if (!text || !word) return text;

  const regex = new RegExp(`(${word})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === word.toLowerCase()
      ? <span key={index} className="underline font-semibold">{part}</span>
      : part
  );
};

export default function CategoryDetailPage() {
  const { isAuthenticated } = useIsAuthenticated();
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.categoryId);

  const [category, setCategory] = useState<FlashcardCategoryView | null>(null);
  const [items, setItems] = useState<FlashcardItemView[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FlashcardItemView | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && categoryId) {
      fetchData();
    }
  }, [isAuthenticated, categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catData, itemsData] = await Promise.all([
        flashcardCategoryService.findById(categoryId),
        flashcardItemService.getItemsByCategory(categoryId),
      ]);
      setCategory(catData);
      setItems(itemsData || []);
    } catch (e) {
      console.error(e);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (item: FlashcardItemView) => {
    setEditingItem(item);
    form.setFieldsValue({
      frontContent: item.frontContent,
      backContent: item.backContent,
      example: item.example,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const req: FlashcardItemRequest = {
        categoryId,
        frontContent: values.frontContent,
        backContent: values.backContent,
        example: values.example,
      };

      if (editingItem) {
        await flashcardItemService.update(editingItem.id, req);
        message.success("Đã cập nhật thẻ");
      } else {
        await flashcardItemService.create(req);
        message.success("Đã tạo thẻ mới");
      }

      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await flashcardItemService.delete(id);
      message.success("Đã xóa thẻ");
      fetchData();
    } catch (e) {
      console.error(e);
      message.error("Không thể xóa thẻ");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div
          className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6"
          style={{ borderTop: `4px solid ${category?.color || "#3b82f6"}` }}
        >
          <div className="flex flex-col justify-center items-center sm:flex-row sm:items-center gap-4">
            <Link href="/vocabulary/my-flashcards" className="shrink-0">
              <Button type="default" icon={<ArrowLeftOutlined />}>
                Quay lại
              </Button>
            </Link>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1
                className="text-2xl sm:text-3xl font-bold truncate"
                style={{ color: category?.color || "#3b82f6" }}
              >
                {category?.name || "Danh mục"}
              </h1>
              {category?.description && (
                <p className="text-sm text-gray-500 mt-1 truncate">{category.description}</p>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
              {items.length > 0 && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => router.push(`/vocabulary/my-flashcards/${categoryId}/study`)}
                >
                  Học
                </Button>
              )}
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                Thêm thẻ
              </Button>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <Empty
              description="Chưa có thẻ nào trong danh mục này"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              className="mt-4"
            >
              Tạo thẻ đầu tiên
            </Button>
          </Card>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
            dataSource={items}
            renderItem={(item) => (
              <List.Item>
                <Card
                  className="h-full hover:shadow-md transition-shadow"
                  style={{
                    borderLeft: `4px solid ${category?.color || "#3b82f6"}`,
                  }}
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(item)}
                    >
                      Sửa
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Xóa thẻ này?"
                      onConfirm={() => handleDelete(item.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="">
                      <div className="text-xs text-gray-400 mb-1">Mặt trước</div>
                      <div className="font-medium text-lg">{item.frontContent}</div>
                    </div>
                    <div className="">
                      <div className="text-xs text-gray-400 mb-1">Mặt sau</div>
                      <div className="font-medium text-lg">{item.backContent}</div>
                    </div>
                  </div>
                  {item.example && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Ví dụ</div>
                      <div className="text-gray-600 italic">
                        {highlightWord(item.example, item.frontContent)}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 pt-2 border-t text-xs text-gray-400 flex justify-between">
                    <span>Đã học: {item.reviewCount || 0} lần</span>
                    <span>
                      Đúng:{" "}
                      {item.reviewCount
                        ? Math.round(
                          ((item.correctCount || 0) / item.reviewCount) * 100
                        )
                        : 0}
                      %
                    </span>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}

        <Modal
          title={editingItem ? "Sửa thẻ" : "Tạo thẻ mới"}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={submitting}
          okText={editingItem ? "Cập nhật" : "Tạo"}
          cancelText="Hủy"
          width={600}
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              name="frontContent"
              label="Mặt trước (từ/câu hỏi)"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung mặt trước" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Ví dụ: Hello"
              />
            </Form.Item>

            <Form.Item
              name="backContent"
              label="Mặt sau (định nghĩa/câu trả lời)"
              rules={[
                { required: true, message: "Vui lòng nhập nội dung mặt sau" },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Ví dụ: Xin chào"
              />
            </Form.Item>

            <Form.Item
              name="example"
              label="Ví dụ (không bắt buộc)"
            >
              <Input.TextArea
                rows={2}
                placeholder="Ví dụ: Hello, how are you?"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
