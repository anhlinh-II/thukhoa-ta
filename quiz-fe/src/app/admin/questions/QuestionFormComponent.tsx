"use client";

import React, { useEffect } from 'react';
import '@/lib/client/react-dom-findnode-shim';
import { Form, Input, InputNumber, Switch, Button, Space, Card, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import TiptapEditor from '@/share/components/TiptapEditor';

// Dynamically import ReactQuill to avoid SSR issues
// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface QuestionFormComponentProps {
  form: any;
  initialValues?: any;
}

// Wrapper component for ReactQuill to work with Ant Design Form.Item
const QuillEditor = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
  return <TiptapEditor value={value} onChange={onChange} />;
};

export default function QuestionFormComponent({ form, initialValues }: QuestionFormComponentProps) {
  // Ensure the parent form has sensible defaults or initialValues.
  useEffect(() => {
    const defaults = {
      score: 1,
      orderIndex: 0,
      options: [{ contentHtml: '', isCorrect: false, orderIndex: 0 }],
      questionGroup: { title: '', contentHtml: '' },
      createGroup: false,
      questions: [
        {
          contentHtml: '',
          explanationHtml: '',
          score: 1,
          orderIndex: 0,
          options: [{ contentHtml: '', isCorrect: false, orderIndex: 0 }],
        },
      ],
    };

    try {
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue({ ...(initialValues as any) });
      } else {
        // Only set defaults when no initial values provided.
        form.setFieldsValue(defaults);
      }
    } catch (e) {
      // If form is not mounted yet, ignore; parent will pick up values when ready.
      // This avoids calling setFieldsValue during render.
    }
    // run once on mount; initialValues won't change shape in typical usage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // watch whether the user chose to create a group
  const createGroup = Form.useWatch('createGroup', form) as boolean | undefined;
  const questionContent = (
    <>
      <Form.Item
        name="contentHtml"
        label="Question Content (HTML)"
        rules={[{ required: true, message: 'Please enter question content' }]}
      >
        <QuillEditor />
      </Form.Item>

      <Form.Item
        name="explanationHtml"
        label="Explanation (HTML)"
      >
        <QuillEditor />
      </Form.Item>

      <Form.Item
        name="score"
        label="Score"
        rules={[{ required: true, message: 'Please enter score' }]}
      >
        <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="orderIndex"
        label="Order Index"
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="groupId"
        label="Group ID (Optional - will create new if not provided)"
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
    </>
  );

  const groupContent = (
    <Card title="Question Group (Auto-create if groupId not provided)" style={{ marginBottom: 24 }}>
      <Form.Item
        name={["questionGroup", "title"]}
        label="Group Title"
      >
        <Input placeholder="Leave empty to skip auto-creation" />
      </Form.Item>

      <Form.Item
        name={["questionGroup", "contentHtml"]}
        label="Group Content (HTML)"
      >
        <QuillEditor />
      </Form.Item>

      <Form.Item
        name={["questionGroup", "mediaUrl"]}
        label="Media URL"
      >
        <Input placeholder="Optional media URL" />
      </Form.Item>
    </Card>
  );

  const questionsContent = (
    <Card title="Questions">
      <Form.List name="questions">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, idx) => (
              <Card
                key={key}
                size="small"
                style={{ marginBottom: 16 }}
                title={`Question ${idx + 1}`}
                extra={
                  fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  )
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, 'contentHtml']}
                  label="Question Content (HTML)"
                  rules={[{ required: true, message: 'Please enter question content' }]}
                >
                  <QuillEditor />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'explanationHtml']}
                  label="Explanation (HTML)"
                >
                  <QuillEditor />
                </Form.Item>

                <Space style={{ width: '100%' }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'score']}
                    label="Score"
                    rules={[{ required: true, message: 'Please enter score' }]}
                  >
                    <InputNumber min={0} step={0.5} style={{ width: 120 }} />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'orderIndex']}
                    label="Order Index"
                  >
                    <InputNumber min={0} style={{ width: 120 }} />
                  </Form.Item>
                </Space>

                {/* Nested options for this question */}
                <Form.List name={[name, 'options']}>
                  {(optFields, { add: addOpt, remove: removeOpt }) => (
                    <>
                      {optFields.map(({ key: ok, name: oname, ...optRest }) => (
                        <Card key={ok} size="small" style={{ marginBottom: 12 }}>
                          <Form.Item
                            {...optRest}
                            name={[oname, 'contentHtml']}
                            label="Option Content (HTML)"
                            rules={[{ required: true, message: 'Please enter option content' }]}
                          >
                            <QuillEditor />
                          </Form.Item>

                          <Space style={{ width: '100%' }} align="baseline">
                            <Form.Item
                              {...optRest}
                              name={[oname, 'isCorrect']}
                              label="Is Correct"
                              valuePropName="checked"
                            >
                              <Switch />
                            </Form.Item>

                            <Form.Item
                              {...optRest}
                              name={[oname, 'matchKey']}
                              label="Match Key (Optional)"
                              style={{ flex: 1 }}
                            >
                              <Input placeholder="For matching questions" />
                            </Form.Item>

                            <Form.Item
                              {...optRest}
                              name={[oname, 'orderIndex']}
                              label="Order"
                            >
                              <InputNumber min={0} />
                            </Form.Item>
                          </Space>
                        </Card>
                      ))}
                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => addOpt({ contentHtml: '', isCorrect: false, orderIndex: optFields.length })}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add Option
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Card>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add({ contentHtml: '', explanationHtml: '', score: 1, orderIndex: fields.length, options: [{ contentHtml: '', isCorrect: false, orderIndex: 0 }] })}
                block
                icon={<PlusOutlined />}
              >
                Add Question
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );

  const optionsContent = (
    <Card title="Question Options">
      <Form.List name="options">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card 
                key={key} 
                size="small" 
                style={{ marginBottom: 16 }}
                extra={
                  fields.length > 1 && (
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  )
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, 'contentHtml']}
                  label="Option Content (HTML)"
                  rules={[{ required: true, message: 'Please enter option content' }]}
                >
                  <QuillEditor />
                </Form.Item>

                <Space style={{ width: '100%' }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'isCorrect']}
                    label="Is Correct"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'matchKey']}
                    label="Match Key (Optional)"
                    style={{ flex: 1 }}
                  >
                    <Input placeholder="For matching questions" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, 'orderIndex']}
                    label="Order"
                  >
                    <InputNumber min={0} />
                  </Form.Item>
                </Space>
              </Card>
            ))}
            <Form.Item>
              <Button 
                type="dashed" 
                onClick={() => add({ contentHtml: '', isCorrect: false, orderIndex: fields.length })} 
                block 
                icon={<PlusOutlined />}
              >
                Add Option
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  );

  const tabItems = createGroup ? [
    { key: '1', label: 'Group', children: groupContent },
    { key: '2', label: 'Questions', children: questionsContent },
  ] : [
    { key: '1', label: 'Question', children: questionContent },
    { key: '2', label: 'Group', children: groupContent },
    { key: '3', label: 'Options', children: optionsContent },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: 'calc(100vw - 120px)',
      padding: 8,
      background: 'transparent',
      borderRadius: 8,
      boxShadow: 'none',
      margin: '0 auto'
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Form.Item name="createGroup" label="Create Question Group" valuePropName="checked" style={{ marginBottom: 12 }}>
          <Switch />
        </Form.Item>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
}
