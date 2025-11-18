"use client";

import React, { useState } from "react";
import {
  Steps,
  Button,
  Card,
  Space,
  Table,
  Modal,
  message,
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
        message.success(`Word file parsed successfully (${data.count} elements)`);
      } else {
        message.error(data.message || "Failed to parse Word file");
        console.error("Parse failed:", data);
      }
    } catch (error) {
      message.error("Failed to upload Word file: " + (error instanceof Error ? error.message : "Unknown error"));
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Mark elements
  const markSelectedText = (elementType: ElementType) => {
    if (!selectedText.trim()) {
      message.warning("Please select text first");
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
    message.success(`Marked as ${elementType}`);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    message.success("Element deleted");
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
        message.success("Converted to Excel");
      } else {
        message.error(data.message || "Conversion failed");
      }
    } catch (error) {
      message.error("Failed to convert to Excel");
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
        message.success("Quiz imported successfully!");
      } else {
        message.error(data.message || "Import failed");
      }
    } catch (error) {
      message.error("Failed to process import");
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
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Import Quiz from Word</h1>

      <Steps
        current={["upload", "markup", "preview", "metadata", "result"].indexOf(step)}
      >
        <Steps.Step title="Upload" description="Upload Word file" />
        <Steps.Step title="Markup" description="Review & mark content" />
        <Steps.Step title="Preview" description="Review Excel data" />
        <Steps.Step title="Metadata" description="Add quiz info" />
        <Steps.Step title="Complete" description="Import result" />
      </Steps>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card title="Step 1: Upload Word File" bordered={false} className="shadow">
          <div className="space-y-4">
            <Alert
              message="Format your Word document correctly"
              description="Use Heading 1 for groups, Heading 2 for questions, Heading 3 for answers."
              type="info"
              showIcon
            />

            <div className="flex gap-4">
              <Button onClick={showHelpModal}>📖 View Format Guide</Button>
            </div>

            <div className="border-2 border-dashed border-blue-300 rounded p-6 bg-blue-50">
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
                <Button>📄 Choose Word File (.docx)</Button>
              </Upload>

              {selectedFile && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="primary"
                      loading={loading}
                      onClick={() => handleWordUpload(selectedFile)}
                    >
                      ⬆️ Upload & Parse
                    </Button>
                    <Button onClick={() => setSelectedFile(null)}>Change File</Button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm">
              Upload a Word document with quiz content formatted using Heading 1 (groups),
              Heading 2 (questions), and Heading 3 (answers).
            </p>
          </div>
        </Card>
      )}

      {/* Step 2: Markup */}
      {step === "markup" && (
        <Card title="Step 2: Review & Mark Content" bordered={false} className="shadow">
          <div className="space-y-4">
            <Alert
              message="Review the extracted elements"
              description="You can select text below to reassign types or use the table to delete/reorder."
              type="info"
              showIcon
            />

            {/* Text preview with highlighting */}
            <div>
              <p className="font-semibold mb-2">Extracted Content:</p>
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

            {/* Selected text actions */}
            {selectedText && (
              <div className="bg-blue-50 p-4 border border-blue-200 rounded">
                <p className="mb-3">
                  <strong>Selected:</strong> "{selectedText.substring(0, 60)}
                  {selectedText.length > 60 ? "..." : ""}"
                </p>
                <Space wrap>
                  <Button
                    onClick={() => markSelectedText("GROUP")}
                    style={{ background: "#3b82f6", color: "white" }}
                  >
                    Mark GROUP
                  </Button>
                  <Button
                    onClick={() => markSelectedText("QUESTION")}
                    style={{ background: "#10b981", color: "white" }}
                  >
                    Mark QUESTION
                  </Button>
                  <Button
                    onClick={() => markSelectedText("OPTION")}
                    style={{ background: "#f59e0b", color: "white" }}
                  >
                    Mark OPTION
                  </Button>
                  <Button
                    onClick={() => markSelectedText("ANSWER")}
                    style={{ background: "#8b5cf6", color: "white" }}
                  >
                    Mark ANSWER
                  </Button>
                </Space>
              </div>
            )}

            {/* Elements table */}
            <Table
              dataSource={elements}
              size="small"
              pagination={{ pageSize: 15 }}
              rowKey="id"
              columns={[
                {
                  title: "Type",
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
                  title: "Content",
                  dataIndex: "text",
                  key: "text",
                  ellipsis: true,
                },
                {
                  title: "Actions",
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

            <Space>
              <Button onClick={() => setStep("upload")}>← Back</Button>
              <Button
                type="primary"
                onClick={convertToExcel}
                loading={loading}
                disabled={elements.length === 0}
              >
                Convert to Excel →
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && previewData && (
        <Card title="Step 3: Excel Preview" bordered={false} className="shadow">
          <div className="space-y-4">
            {previewData.errors && previewData.errors.length > 0 && (
              <Alert
                message={`${previewData.errors.length} Validation Issue(s)`}
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            )}

            <Tabs defaultActiveKey="groups">
              <Tabs.TabPane
                tab={`Question Groups (${previewData.questionGroups?.length || 0})`}
                key="groups"
              >
                <Table
                  dataSource={previewData.questionGroups}
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "Group ID", dataIndex: "groupId", key: "groupId", width: 120 },
                    { title: "Title", dataIndex: "title", key: "title", ellipsis: true },
                    {
                      title: "Content",
                      dataIndex: "contentHtml",
                      key: "content",
                      ellipsis: true,
                      width: 200,
                    },
                  ]}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={`Questions (${previewData.questions?.length || 0})`}
                key="questions"
              >
                <Table
                  dataSource={previewData.questions}
                  size="small"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: "ID", dataIndex: "id", key: "id", width: 100 },
                    { title: "Type", dataIndex: "type", key: "type", width: 100 },
                    {
                      title: "Content",
                      dataIndex: "contentHtml",
                      key: "content",
                      ellipsis: true,
                    },
                    { title: "Score", dataIndex: "score", key: "score", width: 80 },
                  ]}
                />
              </Tabs.TabPane>

              <Tabs.TabPane
                tab={`Options (${previewData.questionOptions?.length || 0})`}
                key="options"
              >
                <Table
                  dataSource={previewData.questionOptions}
                  size="small"
                  pagination={{ pageSize: 15 }}
                  columns={[
                    {
                      title: "Question ID",
                      dataIndex: "questionId",
                      key: "questionId",
                      width: 100,
                    },
                    { title: "Key", dataIndex: "matchKey", key: "key", width: 60 },
                    {
                      title: "Content",
                      dataIndex: "contentHtml",
                      key: "content",
                      ellipsis: true,
                    },
                    {
                      title: "Correct",
                      dataIndex: "isCorrect",
                      key: "isCorrect",
                      width: 80,
                      render: (v: boolean) => (v ? "✓" : ""),
                    },
                  ]}
                />
              </Tabs.TabPane>
            </Tabs>

            <Space>
              <Button onClick={() => setStep("markup")}>← Back</Button>
              <Button type="primary" onClick={() => setStep("metadata")}>
                Continue →
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Step 4: Metadata */}
      {step === "metadata" && (
        <Card title="Step 4: Add Quiz Information" bordered={false} className="shadow">
          <Form form={form} layout="vertical" onFinish={handleImport}>
            <Form.Item
              label="Quiz Name"
              name="quizName"
              rules={[{ required: true, message: "Please enter quiz name" }]}
            >
              <Input placeholder="e.g., TOEIC Practice Test 1" />
            </Form.Item>

            <Form.Item
              label="Duration (minutes)"
              name="durationMinutes"
              rules={[{ required: true, message: "Please enter duration" }]}
            >
              <InputNumber min={1} max={300} />
            </Form.Item>

            <Form.Item
              label="Quiz Group"
              name="quizGroupId"
              rules={[{ required: true, message: "Please select a quiz group" }]}
            >
              <Select placeholder="Select target group">
                {quizGroups.map((group) => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Optional description" />
            </Form.Item>

            <Space>
              <Button onClick={() => setStep("preview")}>← Back</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Import Quiz →
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      {/* Step 5: Result */}
      {step === "result" && importResult && (
        <Card title="Step 5: Import Complete ✓" bordered={false} className="shadow">
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Created Groups"
                  value={importResult.created?.questionGroups || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Created Questions"
                  value={importResult.created?.questions || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Created Options"
                  value={importResult.created?.questionOptions || 0}
                  prefix={<CheckCircleOutlined className="text-green-500" />}
                />
              </Col>
              <Col span={6}>
                <Statistic title="Duration" value={importResult.duration || "N/A"} />
              </Col>
            </Row>

            {importResult.errors && importResult.errors.length > 0 && (
              <Alert message={`${importResult.errors.length} Error(s)`} type="warning" showIcon />
            )}

            <Space>
              <Button
                type="primary"
                onClick={() => router.push("/admin/quiz-management/quiz-mocktests")}
              >
                View All Quizzes
              </Button>
              <Button onClick={() => window.location.reload()}>Import Another</Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Help Modal */}
      <Modal
        title="Word Format Guide"
        open={helpVisible}
        onCancel={() => setHelpVisible(false)}
        footer={<Button onClick={() => setHelpVisible(false)}>Close</Button>}
        width={700}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <div className="space-y-4">
          <p>
            <strong>Marking Syntax in Word:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>GROUP:</strong> Use Heading 1 style with text:{" "}
              <code className="bg-gray-100 px-2 py-1">[GROUP] Group Name</code>
            </li>
            <li>
              <strong>QUESTION:</strong> Use Heading 2 style with text:{" "}
              <code className="bg-gray-100 px-2 py-1">[QUESTION] Question text</code>
            </li>
            <li>
              <strong>OPTION:</strong> Write as:{" "}
              <code className="bg-gray-100 px-2 py-1">A) Option text</code>,{" "}
              <code className="bg-gray-100 px-2 py-1">B) Option text</code>, etc.
            </li>
            <li>
              <strong>ANSWER:</strong> Use Heading 3 style with text:{" "}
              <code className="bg-gray-100 px-2 py-1">[ANSWER] B</code> (the correct option
              key)
            </li>
          </ul>
          <p className="text-gray-600 text-sm">
            Normal text between these elements will be treated as content for the preceding
            section.
          </p>

          <div className="mt-6 pt-4 border-t">
            <p className="font-semibold mb-3">Example Word Document Structure:</p>
            <div className="bg-gray-50 p-4 rounded font-mono text-xs space-y-1">
              <div>[Heading 1] [GROUP] English Listening - Part A</div>
              <div>[Normal] General instructions about this group...</div>
              <div></div>
              <div>[Heading 2] [QUESTION] Listen to the conversation. What does the woman want?</div>
              <div>A) To book a flight</div>
              <div>B) To change a reservation</div>
              <div>C) To cancel a booking</div>
              <div>D) To upgrade her seat</div>
              <div>[Heading 3] [ANSWER] B</div>
              <div></div>
              <div>[Heading 2] [QUESTION] Where are they talking?</div>
              <div>A) At a restaurant</div>
              <div>B) At an airport</div>
              <div>C) At a hotel</div>
              <div>D) At a train station</div>
              <div>[Heading 3] [ANSWER] A</div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
