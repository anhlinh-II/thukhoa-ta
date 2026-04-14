"use client";
import { Card, Form, Input, Button, Switch, Divider } from 'antd';

export default function SettingsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Settings updated:', values);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-600">Manage your application settings</p>
      </div>

      <Card title="General Settings" className="mb-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            siteName: 'Quiz Management System',
            allowRegistration: true,
            emailNotifications: true,
            maintenanceMode: false,
          }}
        >
          <Form.Item
            label="Site Name"
            name="siteName"
            rules={[{ required: true, message: 'Please input site name!' }]}
          >
            <Input placeholder="Enter site name" />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Allow User Registration"
            name="allowRegistration"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Email Notifications"
            name="emailNotifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Maintenance Mode"
            name="maintenanceMode"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Advanced Settings">
        <p className="text-gray-500">Advanced configuration options coming soon...</p>
      </Card>
    </div>
  );
}
