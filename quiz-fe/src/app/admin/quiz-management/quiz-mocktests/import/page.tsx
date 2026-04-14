"use client";

import React, { useState } from "react";
import {
  Steps,
  Button,
  Card,
  Space,
  Table,
  Modal,
  Upload,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Alert,
  Spin,
  Statistic,
  Row,
  Col,
} from "antd";
import messageService from '@/share/services/messageService';
import {
  DeleteOutlined,
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { quizGroupService } from "@/share/services/quiz_group/quiz-group.service";
import { ENV } from "@/share/utils/env";
import apiClient from "@/share/services/api";

type ElementType = "GROUP" | "QUESTION" | "OPTION" | "ANSWER" | "CONTENT";

interface TextElement {
  id: string;
  type: ElementType;
  text: string;
  order: number;
}

interface ExcelPreview {
  questionGroups: any[];
  questions: any[];
  questionOptions: any[];
  errors: any[];
}

const elementTypeColors: Record<ElementType, string> = {
  GROUP: "bg-blue-100 font-bold",
  QUESTION: "bg-green-100 font-semibold",
  OPTION: "bg-yellow-50",
  ANSWER: "bg-purple-100 font-semibold",
  CONTENT: "bg-gray-50",
};

export default function QuizImportPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [quizGroups, setQuizGroups] = useState<any[]>([]);

  const [step, setStep] = useState<"upload" | "markup" | "preview" | "metadata" | "result">(
    "upload"
  );
  const [elements, setElements] = useState<TextElement[]>([]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [previewData, setPreviewData] = useState<ExcelPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [helpVisible, setHelpVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch quiz groups for dropdown
  React.useEffect(() => {
    fetchQuizGroups();
  }, []);

  const fetchQuizGroups = async () => {
    try {
      const response = await quizGroupService.getViewsPagedWithFilter({
        skip: 0,
        take: 100,
      });
      setQuizGroups(response.data || []);
    } catch (error) {
      console.error("Failed to fetch quiz groups", error);
    }
  };

  // Step 1: Upload Word file
  const handleWordUpload = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("wordFile", file);

      console.log("Uploading file:", file.name, "Size:", file.size);

      const response = await apiClient.post("/import/quiz/parse-word", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response status:", response.status);
      const data = response.data;
      console.log("Response data:", data);

      if (data.success && data.elements) {
        setElements(data.elements);
        setStep("markup");
        messageService.success(`Phân tích file Word thành công (${data.count} thành phần)`);
      } else {
        messageService.error(data.message || "Không thể phân tích file Word");
        console.error("Parse failed:", data);
      }
    } catch (error) {
      messageService.error("Không thể tải lên file Word: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Mark elements
  const markSelectedText = (elementType: ElementType) => {
    if (!selectedText.trim()) {
      messageService.warning("Vui lòng chọn văn bản trước");
      return;
    }

    const updated = elements.map((el) => {
      if (el.text.toLowerCase().includes(selectedText.toLowerCase())) {
        return { ...el, type: elementType };
      }
      return el;
    });

    setElements(updated);
    setSelectedText("");
    messageService.success(`Đã đánh dấu là ${elementType}`);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    messageService.success("Đã xóa thành phần");
  };

  const moveElement = (id: string, direction: "up" | "down") => {
    const idx = elements.findIndex((el) => el.id === id);
    if (
      (direction === "up" && idx === 0) ||
      (direction === "down" && idx === elements.length - 1)
    ) {
      return;
    }

    const newElements = [...elements];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newElements[idx], newElements[swapIdx]] = [newElements[swapIdx], newElements[idx]];
    setElements(newElements);
  };

  // Step 3: Send elements to backend for Excel conversion
  const convertToExcel = async () => {
    try {
      setLoading(true);
      
      // Auto-mark CONTENT elements as OPTION if they follow a QUESTION
      const autoMarkedElements = autoMarkOptions(elements);
      
      const response = await apiClient.post("/import/quiz/elements-to-excel", { elements: autoMarkedElements });

      const data = response.data;
      if (data.success) {
        setPreviewData(data.preview);
        setStep("preview");
        messageService.success("Chuyển đổi thành công");
      } else {
        messageService.error(data.message || "Chuyển đổi thất bại");
      }
    } catch (error) {
      messageService.error("Không thể chuyển đổi sang Excel");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-mark CONTENT elements following a QUESTION as OPTION
  const autoMarkOptions = (elems: TextElement[]): TextElement[] => {
    const marked = [...elems];
    let lastQuestionIdx = -1;
    let optionCount = 0;

    for (let i = 0; i < marked.length; i++) {
      const el = marked[i];

      if (el.type === "QUESTION") {
        lastQuestionIdx = i;
        optionCount = 0;
      } else if (el.type === "ANSWER") {
        lastQuestionIdx = -1; // Reset after answer
        optionCount = 0;
      } else if (el.type === "CONTENT" && lastQuestionIdx >= 0 && optionCount < 4) {
        // Mark consecutive CONTENT after QUESTION as OPTION (max 4)
        marked[i] = { ...el, type: "OPTION" };
        optionCount++;
      }
    }

    return marked;
  };

  // Step 4: Process import
  const handleImport = async (values: any) => {
    try {
      setLoading(true);
      const response = await apiClient.post("/import/quiz/process", {
        elements,
        quizName: values.quizName,
        durationMinutes: values.durationMinutes,
        quizGroupId: values.quizGroupId,
        description: values.description,
      });

      const data = response.data;
      if (data.success) {
        setImportResult(data.result);
        setStep("result");
        messageService.success("Nhập quiz thành công!");
      } else {
        messageService.error(data.message || "Nhập thất bại");
      }
    } catch (error) {
      messageService.error("Không thể xử lý import");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // View Help
  const showHelpModal = () => {
    setHelpVisible(true);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold text-center lg:text-left">Nhập bài Quiz từ Word</h1>

      <Steps
        current={["upload", "markup", "preview", "metadata", "result"].indexOf(step)}
        size="small"
        responsive
        className="px-2"
      >
        <Steps.Step title="Tải lên" description="Tải file Word" />
        <Steps.Step title="Đánh dấu" description="Xem & đánh dấu" />
        <Steps.Step title="Xem trước" description="Kiểm tra dữ liệu" />
        <Steps.Step title="Thông tin" description="Thêm thông tin" />
        <Steps.Step title="Hoàn thành" description="Kết quả" />
      </Steps>

      {/* Bước 1: Tải lên */}
      {step === "upload" && (
        <Card title="Bước 1: Tải lên file Word" bordered={false} className="shadow-md">
          <div className="space-y-4">
            <Alert
              message="Định dạng file Word đúng cách"
              description="Sử dụng Heading 1 cho nhóm câu hỏi, Heading 2 cho câu hỏi, Heading 3 cho đáp án."
              type="info"
              showIcon
            />

            <div className="flex justify-center lg:justify-start">
              <Button onClick={showHelpModal}>📖 Xem hướng dẫn định dạng</Button>
            </div>

            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 lg:p-6 bg-blue-50 text-center">
              <Upload
                accept=".docx"
                maxCount={1}
                beforeUpload={() => false}
                onChange={(info) => {
                  if (info.file.originFileObj) {
                    setSelectedFile(info.file.originFileObj);
                  }
                }}
              >
                <Button size="large">📄 Chọn file Word (.docx)</Button>
              </Upload>

              {selectedFile && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    <strong>Đã chọn:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={() => handleWordUpload(selectedFile)}
                    >
                      ⬆️ Tải lên & Phân tích
                    </Button>
                    <Button onClick={() => setSelectedFile(null)}>Đổi file</Button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm text-center lg:text-left">
              Tải lên file Word với nội dung quiz được định dạng bằng Heading 1 (nhóm câu hỏi),
              Heading 2 (câu hỏi), và Heading 3 (đáp án).
            </p>
          </div>
        </Card>
      )}

      {/* Bước 2: Đánh dấu */}
      {step === "markup" && (
        <Card title="Bước 2: Xem lại & Đánh dấu nội dung" bordered={false} className="shadow-md">
          <div className="space-y-4">
            <Alert
              message="Xem lại các thành phần đã trích xuất"
              description="Bạn có thể chọn văn bản bên dưới để gán lại loại hoặc sử dụng bảng để xóa/sắp xếp lại."
              type="info"
              showIcon
            />

            {/* Xem trước văn bản với highlight */}
            <div>
              <p className="font-semibold mb-2">Nội dung đã trích xuất:</p>
              <div
                className="border rounded p-4 bg-gray-50 min-h-64 max-h-96 overflow-y-auto font-mono text-sm leading-relaxed"
                onMouseUp={() => {
                  const selection = window.getSelection();
                  setSelectedText(selection?.toString() || "");
                }}
              >
                {elements.map((el) => (
                  <div key={el.id} className={`mb-2 p-2 rounded ${elementTypeColors[el.type]}`}>
                    <span className="text-xs font-semibold text-gray-600 mr-2">
                      [{el.type}]
                    </span>
                    {el.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Hành động với văn bản đã chọn */}
            {selectedText && (
              <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
                <p className="mb-3">
                  <strong>Đã chọn:</strong> "{selectedText.substring(0, 60)}
                  {selectedText.length > 60 ? "..." : ""}"
                </p>
                <Space wrap>
                  <Button
                    onClick={() => markSelectedText("GROUP")}
                    style={{ background: "#3b82f6", color: "white" }}
                  >
                    Đánh dấu NHÓM
                  </Button>
                  <Button
                    onClick={() => markSelectedText("QUESTION")}
                    style={{ background: "#10b981", color: "white" }}
                  >
                    Đánh dấu CÂU HỎI
                  </Button>
                  <Button
                    onClick={() => markSelectedText("OPTION")}
                    style={{ background: "#f59e0b", color: "white" }}
                  >
                    Đánh dấu LỰA CHỌN
                  </Button>
                  <Button
                    onClick={() => markSelectedText("ANSWER")}
                    style={{ background: "#8b5cf6", color: "white" }}
                  >
                    Đánh dấu ĐÁP ÁN
                  </Button>
                </Space>
              </div>
            )}

            {/* Bảng các thành phần */}
            <Table
              dataSource={elements}
              size="small"
              pagination={{ pageSize: 15 }}
              rowKey="id"
              scroll={{ x: 500 }}
              columns={[
                {
                  title: "Loại",
                  dataIndex: "type",
                  key: "type",
                  width: 100,
                  render: (type: ElementType) => (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100">
                      {type}
                    </span>
                  ),
                },
                {
                  title: "Nội dung",
                  dataIndex: "text",
                  key: "text",
                  ellipsis: true,
                },
                {
                  title: "Thao tác",
                  key: "actions",
                  width: 120,
                  render: (_, record) => (
                    <Space size="small">
                      <Button
                        size="small"
                        onClick={() => moveElement(record.id, "up")}
                      >
                        <ArrowUpOutlined />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => moveElement(record.id, "down")}
                      >
                        <ArrowDownOutlined />
                      </Button>
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteElement(record.id)}
                      />
                    </Space>
                  ),
                },
              ]}
            />

            <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
              <Button onClick={() => setStep("upload")}>← Quay lại</Button>
              <Button
                type="primary"
                onClick={convertToExcel}
                loading={loading}
                disabled={elements.length === 0}
              >
                Chuyển đổi sang Excel →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bước 3: Xem trước */}
      {step === "preview" && previewData && (
        <Card title="Bước 3: Xem trước dữ liệu" bordered={false} className="shadow-md">
          <div className="space-y-4">
            {previewData.errors && previewData.errors.length > 0 && (
              <Alert
                message={`${previewData.errors.length} lỗi xác thực`}
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            )}

            <Tabs defaultActiveKey="groups">
              <Tabs.TabPane
                tab={`Nhóm câu hỏi (${previewData.questionGroups?.length || 0})`}
                key="groups"
              >
                <Table
                  dataSource={previewData.questionGroups}
                  size="small"
                  pagination={false}
                  scroll={{ x: 400 }}
                  columns={[
                    { title: "ID Nhóm", dataIndex: "groupId", key: "groupId", width: 100 },
                    { title: "Tiêu đề", dataIndex: "title", key: "title", ellipsis: true },
                    {
                      title: "Nội dung",
                      dataIndex: "contentHtml",
                      key: "content",
                      ellipsis: true,
                      width: 200,
                    },
                  ]}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={`Câu hỏi (${previewData.questions?.length || 0})`}
                key="questions"
              >
                <Table
                  dataSource={previewData.questions}
                  size="small"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 400 }}
                  columns={[
                    { title: "ID", dataIndex: "id", key: "id", width: 80 },
                    { title: "Loại", dataIndex: "type", key: "type", width: 80 },
                    {
                      title: "Nội dung",
                      dataIndex: "contentHtml",
                      key: "content",
                      ellipsis: true,
                    },
                    { title: "Điểm", dataIndex: "score", key: "score", width: 60 },
                  ]}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={`Lựa chọn (${previewData.questionOptions?.length || 0})`}
                key="options"
              >
                <Table
                  dataSource={previewData.questionOptions}
                  size="small"
                  pagination={{ pageSize: 15 }}
                  scroll={{ x: 400 }}
                  columns={[
                    {
                      title: "ID Câu hỏi",
                      dataIndex: "questionId",
                      key: "questionId",
                      width: 90,
                    },
                    { title: "Đáp án", dataIndex: "matchKey", key: "key", width: 60 },
                    {
                      title: "Nội dung",
                      dataIndex: "contentHtml",
                      key: "content",
                      ellipsis: true,
                    },
                    {
                      title: "Đúng",
                      dataIndex: "isCorrect",
                      key: "isCorrect",
                      width: 60,
                      render: (v: boolean) => (v ? "✓" : ""),
                    },
                  ]}
                />
              </Tabs.TabPane>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
              <Button onClick={() => setStep("markup")}>← Quay lại</Button>
              <Button type="primary" onClick={() => setStep("metadata")}>
                Tiếp tục →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bước 4: Thông tin */}
      {step === "metadata" && (
        <Card title="Bước 4: Thêm thông tin bài Quiz" bordered={false} className="shadow-md">
          <Form form={form} layout="vertical" onFinish={handleImport} className="max-w-xl">
            <Form.Item
              label="Tên bài Quiz"
              name="quizName"
              rules={[{ required: true, message: "Vui lòng nhập tên bài quiz" }]}
            >
              <Input placeholder="Ví dụ: TOEIC Practice Test 1" />
            </Form.Item>

            <Form.Item
              label="Thời gian làm bài (phút)"
              name="durationMinutes"
              rules={[{ required: true, message: "Vui lòng nhập thời gian" }]}
            >
              <InputNumber min={1} max={300} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Nhóm Quiz"
              name="quizGroupId"
              rules={[{ required: true, message: "Vui lòng chọn nhóm quiz" }]}
            >
              <Select placeholder="Chọn nhóm quiz">
                {quizGroups.map((group) => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={4} placeholder="Mô tả (tùy chọn)" />
            </Form.Item>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setStep("preview")}>← Quay lại</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Nhập Quiz →
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Bước 5: Kết quả */}
      {step === "result" && importResult && (
        <Card title="Bước 5: Nhập hoàn tất ✓" bordered={false} className="shadow-md">
          <div className="space-y-6">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Nhóm đã tạo"
                  value={importResult.created?.questionGroups || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Câu hỏi đã tạo"
                  value={importResult.created?.questions || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Lựa chọn đã tạo"
                  value={importResult.created?.questionOptions || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Thời gian" value={importResult.duration || "N/A"} />
              </Col>
            </Row>

            {importResult.errors && importResult.errors.length > 0 && (
              <Alert message={`${importResult.errors.length} lỗi`} type="warning" showIcon />
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="primary"
                onClick={() => router.push("/admin/quiz-management/quiz-mocktests")}
              >
                Xem tất cả bài Quiz
              </Button>
              <Button onClick={() => window.location.reload()}>Nhập bài khác</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal hướng dẫn */}
      <Modal
        title="Hướng dẫn định dạng Word"
        open={helpVisible}
        onCancel={() => setHelpVisible(false)}
        footer={<Button onClick={() => setHelpVisible(false)}>Đóng</Button>}
        width={700}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        <div className="space-y-4">
          <p>
            <strong>Cú pháp đánh dấu trong Word:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>NHÓM (GROUP):</strong> Sử dụng kiểu Heading 1 với văn bản:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">[GROUP] Tên nhóm</code>
            </li>
            <li>
              <strong>CÂU HỎI (QUESTION):</strong> Sử dụng kiểu Heading 2 với văn bản:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">[QUESTION] Nội dung câu hỏi</code>
            </li>
            <li>
              <strong>LỰA CHỌN (OPTION):</strong> Viết theo dạng:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">A) Lựa chọn A</code>,{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">B) Lựa chọn B</code>, v.v.
            </li>
            <li>
              <strong>ĐÁP ÁN (ANSWER):</strong> Sử dụng kiểu Heading 3 với văn bản:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">[ANSWER] B</code> (đáp án đúng)
            </li>
          </ul>
          <p className="text-gray-600 text-sm">
            Văn bản bình thường giữa các thành phần sẽ được coi là nội dung cho phần trước đó.
          </p>

          <div className="mt-6 pt-4 border-t">
            <p className="font-semibold mb-3">Ví dụ cấu trúc tài liệu Word:</p>
            <div className="bg-gray-50 p-4 rounded font-mono text-xs space-y-1 overflow-x-auto">
              <div>[Heading 1] [GROUP] Nghe tiếng Anh - Phần A</div>
              <div>[Normal] Hướng dẫn chung về nhóm này...</div>
              <div></div>
              <div>[Heading 2] [QUESTION] Nghe cuộc hội thoại. Người phụ nữ muốn gì?</div>
              <div>A) Đặt vé máy bay</div>
              <div>B) Thay đổi đặt chỗ</div>
              <div>C) Hủy đặt chỗ</div>
              <div>D) Nâng cấp ghế</div>
              <div>[Heading 3] [ANSWER] B</div>
              <div></div>
              <div>[Heading 2] [QUESTION] Họ đang nói chuyện ở đâu?</div>
              <div>A) Tại nhà hàng</div>
              <div>B) Tại sân bay</div>
              <div>C) Tại khách sạn</div>
              <div>D) Tại ga tàu</div>
              <div>[Heading 3] [ANSWER] A</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
