"use client";

import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, Space, Card, Tabs, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TiptapEditor from '@/components/TiptapEditor';

interface QuizMockTestFormComponentProps {
  form: any;
  initialValues?: any;
}

const QuillEditor = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
  return <TiptapEditor value={value} onChange={onChange} />;
};

export default function QuizMockTestFormComponent({ form, initialValues }: QuizMockTestFormComponentProps) {
  useEffect(() => {
    const defaults = {
      durationMinutes: 90,
      shuffleQuestions: true,
      showResultsImmediately: false,
      certificateEligible: false,
      displayOrder: 0,
      isActive: true,
      questionGroups: [],
      standaloneQuestions: [],
    };

    try {
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue({ ...(initialValues as any) });
      } else {
        form.setFieldsValue(defaults);
      }
    } catch (e) {
      // Form not mounted yet
    }
  }, []);

  const basicInfoContent = (
    <>
      <Form.Item
        name="examName"
        label="Exam Name"
        rules={[{ required: true, message: 'Please enter exam name' }]}
      >
        <Input placeholder="e.g., Đề thi thử THPT 2024 - Trần Hưng Đạo" />
      </Form.Item>

      <Form.Item name="title" label="Title">
        <Input placeholder="Optional title" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Quiz description" />
      </Form.Item>

      <Space style={{ width: '100%' }}>
        <Form.Item
          name="durationMinutes"
          label="Duration (minutes)"
          rules={[{ required: true, message: 'Please enter duration' }]}
        >
          <InputNumber min={1} max={600} style={{ width: 150 }} />
        </Form.Item>

        <Form.Item name="totalQuestions" label="Total Questions">
          <InputNumber min={0} max={500} style={{ width: 150 }} />
        </Form.Item>

        <Form.Item name="displayOrder" label="Display Order">
          <InputNumber min={0} style={{ width: 150 }} />
        </Form.Item>
      </Space>

      <Form.Item name="instructions" label="Instructions">
        <Input.TextArea rows={4} placeholder="Instructions for participants" />
      </Form.Item>

      <Space>
        <Form.Item name="shuffleQuestions" label="Shuffle Questions" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="showResultsImmediately" label="Show Results Immediately" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item name="isActive" label="Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Space>
    </>
  );

  const questionGroupsContent = (
    <Card title="Question Groups">
      <Form.List name="questionGroups">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, idx) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16 }}
                title={`Group ${idx + 1}`}
                extra={
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
                    Remove
                  </Button>
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, 'group', 'title']}
                  label="Group Title"
                  rules={[{ required: true, message: 'Please enter group title' }]}
                >
                  <Input placeholder="Group title" />
                </Form.Item>

                <Form.Item {...restField} name={[name, 'group', 'contentHtml']} label="Group Content (HTML)">
                  <QuillEditor />
                </Form.Item>

                <Form.Item {...restField} name={[name, 'group', 'mediaUrl']} label="Media URL">
                  <Input placeholder="Optional media URL" />
                </Form.Item>

                {/* Questions in this group */}
                <Form.List name={[name, 'questions']}>
                  {(qFields, { add: addQ, remove: removeQ }) => (
                    <>
                      {qFields.map(({ key: qk, name: qname, ...qRest }, qIdx) => (
                        <Card key={qk} size="small" style={{ marginBottom: 12, marginLeft: 16 }} title={`Question ${qIdx + 1}`}>
                          <Form.Item
                            {...qRest}
                            name={[qname, 'question', 'contentHtml']}
                            label="Question Content"
                            rules={[{ required: true, message: 'Please enter question content' }]}
                          >
                            <QuillEditor />
                          </Form.Item>

                          <Form.Item {...qRest} name={[qname, 'question', 'explanationHtml']} label="Explanation">
                            <QuillEditor />
                          </Form.Item>

                          <Space>
                            <Form.Item
                              {...qRest}
                              name={[qname, 'question', 'score']}
                              label="Score"
                              rules={[{ required: true, message: 'Score required' }]}
                            >
                              <InputNumber min={0} step={0.5} style={{ width: 100 }} />
                            </Form.Item>

                            <Form.Item {...qRest} name={[qname, 'question', 'orderIndex']} label="Order">
                              <InputNumber min={0} style={{ width: 100 }} />
                            </Form.Item>
                          </Space>

                          {/* Options for this question */}
                          <Form.List name={[qname, 'options']}>
                            {(optFields, { add: addOpt, remove: removeOpt }) => (
                              <>
                                {optFields.map(({ key: ok, name: oname, ...optRest }) => (
                                  <Card key={ok} size="small" style={{ marginBottom: 8 }}>
                                    <Form.Item
                                      {...optRest}
                                      name={[oname, 'contentHtml']}
                                      label="Option Content"
                                      rules={[{ required: true, message: 'Required' }]}
                                    >
                                      <Input.TextArea rows={2} />
                                    </Form.Item>

                                    <Space>
                                      <Form.Item {...optRest} name={[oname, 'isCorrect']} label="Correct" valuePropName="checked">
                                        <Switch />
                                      </Form.Item>

                                      <Form.Item {...optRest} name={[oname, 'orderIndex']} label="Order">
                                        <InputNumber min={0} style={{ width: 80 }} />
                                      </Form.Item>

                                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeOpt(oname)}>
                                        Remove
                                      </Button>
                                    </Space>
                                  </Card>
                                ))}
                                <Button
                                  type="dashed"
                                  onClick={() => addOpt({ contentHtml: '', isCorrect: false, orderIndex: optFields.length })}
                                  block
                                  size="small"
                                  icon={<PlusOutlined />}
                                >
                                  Add Option
                                </Button>
                              </>
                            )}
                          </Form.List>

                          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeQ(qname)} style={{ marginTop: 8 }}>
                            Remove Question
                          </Button>
                        </Card>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() =>
                          addQ({
                            question: { contentHtml: '', explanationHtml: '', score: 1, orderIndex: qFields.length },
                            options: [{ contentHtml: '', isCorrect: false, orderIndex: 0 }],
                          })
                        }
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Question to Group
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    group: { title: '', contentHtml: '', mediaUrl: '' },
                    questions: [
                      {
                        question: { contentHtml: '', explanationHtml: '', score: 1, orderIndex: 0 },
                        options: [{ contentHtml: '', isCorrect: false, orderIndex: 0 }],
                      },
                    ],
                  })
                }
                block
                icon={<PlusOutlined />}
              >
                Add Question Group
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );

  const standaloneQuestionsContent = (
    <Card title="Standalone Questions">
      <Form.List name="standaloneQuestions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, idx) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16 }}
                title={`Question ${idx + 1}`}
                extra={
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}>
                    Remove
                  </Button>
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, 'question', 'contentHtml']}
                  label="Question Content"
                  rules={[{ required: true, message: 'Please enter question content' }]}
                >
                  <QuillEditor />
                </Form.Item>

                <Form.Item {...restField} name={[name, 'question', 'explanationHtml']} label="Explanation">
                  <QuillEditor />
                </Form.Item>

                <Space>
                  <Form.Item
                    {...restField}
                    name={[name, 'question', 'score']}
                    label="Score"
                    rules={[{ required: true, message: 'Score required' }]}
                  >
                    <InputNumber min={0} step={0.5} style={{ width: 100 }} />
                  </Form.Item>

                  <Form.Item {...restField} name={[name, 'question', 'orderIndex']} label="Order">
                    <InputNumber min={0} style={{ width: 100 }} />
                  </Form.Item>
                </Space>

                {/* Options */}
                <Form.List name={[name, 'options']}>
                  {(optFields, { add: addOpt, remove: removeOpt }) => (
                    <>
                      {optFields.map(({ key: ok, name: oname, ...optRest }) => (
                        <Card key={ok} size="small" style={{ marginBottom: 8 }}>
                          <Form.Item
                            {...optRest}
                            name={[oname, 'contentHtml']}
                            label="Option Content"
                            rules={[{ required: true, message: 'Required' }]}
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>

                          <Space>
                            <Form.Item {...optRest} name={[oname, 'isCorrect']} label="Correct" valuePropName="checked">
                              <Switch />
                            </Form.Item>

                            <Form.Item {...optRest} name={[oname, 'orderIndex']} label="Order">
                              <InputNumber min={0} style={{ width: 80 }} />
                            </Form.Item>

                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeOpt(oname)}>
                              Remove
                            </Button>
                          </Space>
                        </Card>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => addOpt({ contentHtml: '', isCorrect: false, orderIndex: optFields.length })}
                        block
                        size="small"
                        icon={<PlusOutlined />}
                      >
                        Add Option
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    question: { contentHtml: '', explanationHtml: '', score: 1, orderIndex: fields.length },
                    options: [{ contentHtml: '', isCorrect: false, orderIndex: 0 }],
                  })
                }
                block
                icon={<PlusOutlined />}
              >
                Add Standalone Question
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );

  const tabItems = [
    { key: '1', label: 'Basic Info', children: basicInfoContent },
    { key: '2', label: 'Question Groups', children: questionGroupsContent },
    { key: '3', label: 'Standalone Questions', children: standaloneQuestionsContent },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 'calc(100vw - 120px)', padding: 8, margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
}
