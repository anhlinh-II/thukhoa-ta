# Base Component System Documentation

Hệ thống Base Component được thiết kế để tương ứng với BaseController và BaseService ở backend Spring Boot, giúp tự động hóa việc tạo CRUD interface cho frontend.

## 🏗️ Kiến trúc

```
Frontend Base System
├── services/
│   ├── BaseService.ts         # Base service class với các API methods
│   └── quizGroupService.ts    # Ví dụ implementation cho QuizGroup
├── hooks/
│   ├── BaseHooks.ts          # Base React Query hooks
│   └── useQuizGroupsBase.ts  # Ví dụ custom hooks cho QuizGroup
├── components/
│   └── BaseComponent.tsx     # Base component với Table + CRUD UI
└── app/admin/components/
    └── QuizGroupsBaseTab.tsx # Ví dụ component sử dụng BaseComponent
```

## 🚀 Cách sử dụng

### 1. Tạo Service Class

```typescript
// services/yourEntityService.ts
import { BaseService } from './BaseService';

export interface YourEntity {
  id: number;
  name: string;
  // ... other fields
}

export interface YourEntityRequest {
  name: string;
  // ... other fields
}

export interface YourEntityResponse extends YourEntity {}

export class YourEntityService extends BaseService<
  YourEntity,
  YourEntityRequest,
  YourEntityResponse,
  YourEntity
> {
  constructor() {
    super('http://localhost:8080/api', 'your-entities');
  }

  // Custom methods nếu cần
  async findByStatus(status: string): Promise<YourEntityResponse[]> {
    return this.handleRequest(\`\${this.getEndpoint()}/status/\${status}\`);
  }
}

export const yourEntityService = new YourEntityService();
```

### 2. Tạo Component

```typescript
// components/YourEntityTab.tsx
"use client";
import React from 'react';
import { Form, Input } from 'antd';
import { BaseComponent } from '../../../components/BaseComponent';
import { yourEntityService, YourEntityResponse, YourEntityRequest } from '../../../services/yourEntityService';

const YourEntityTab: React.FC = () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    // ... other columns
  ];

  const renderForm = (form: any, initialValues?: Partial<YourEntityRequest>) => (
    <Form.Item
      label="Name"
      name="name"
      rules={[{ required: true, message: 'Please input name!' }]}
    >
      <Input placeholder="Enter name" />
    </Form.Item>
  );

  return (
    <BaseComponent
      config={{
        queryKeyPrefix: 'your-entities',
        resourceName: 'Your Entity',
        title: 'Your Entities Management',
        pageSize: 10,
      }}
      service={yourEntityService}
      columns={columns}
      renderForm={renderForm}
    />
  );
};

export default YourEntityTab;
```

## 🎯 Tính năng có sẵn

### BaseService
- ✅ **CRUD Operations**: create, update, delete, findById, findAll
- ✅ **Pagination**: findAllPaged với sort và filter
- ✅ **Views**: getViewById, getViewsPaged
- ✅ **Error Handling**: Tự động hiển thị message lỗi
- ✅ **Type Safety**: Generic types cho Entity, Request, Response, View

### BaseHooks (React Query)
- ✅ **Caching**: Tự động cache với staleTime và gcTime
- ✅ **Optimistic Updates**: Delete với rollback khi lỗi
- ✅ **Cache Invalidation**: Tự động invalidate related queries
- ✅ **Prefetching**: Methods để prefetch data
- ✅ **Loading States**: Built-in loading và error states

### BaseComponent (UI)
- ✅ **Table với Pagination**: Ant Design table với full pagination
- ✅ **CRUD Modal**: Create/Edit modal với form validation
- ✅ **Delete Confirmation**: Popconfirm với optimistic delete
- ✅ **Search & Filter**: Built-in search functionality
- ✅ **Responsive Design**: Mobile-friendly table
- ✅ **Custom Actions**: Có thể thêm custom buttons
- ✅ **Expandable Rows**: Support expandable content

## 🔧 API Mapping

| Backend BaseController | Frontend BaseService | Frontend BaseComponent |
|----------------------|---------------------|----------------------|
| `GET /all` | `findAll()` | Load data cho table |
| `GET /paged` | `findAllPaged()` | Pagination |
| `GET /{id}` | `findById()` | Load single record |
| `POST /create` | `create()` | Create modal |
| `PUT /edit/{id}` | `update()` | Edit modal |
| `DELETE /{id}` | `delete()` | Delete button |
| `GET /views` | `getViewsPaged()` | Advanced table view |

## 🎨 Customization

### Custom Columns
```typescript
const columns = [
  {
    title: 'Status',
    dataIndex: 'isActive',
    render: (isActive: boolean) => (
      <span className={isActive ? 'text-green-600' : 'text-red-600'}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];
```

### Custom Actions
```typescript
<BaseComponent
  customActions={(record) => (
    <Button onClick={() => handleCustomAction(record)}>
      Custom Action
    </Button>
  )}
  // ... other props
/>
```

### Custom Form
```typescript
const renderForm = (form, initialValues, isEdit) => (
  <>
    <Form.Item name="name" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    {isEdit && (
      <Form.Item name="status">
        <Switch />
      </Form.Item>
    )}
  </>
);
```

## 📝 Ví dụ hoàn chỉnh

Xem `QuizGroupsBaseTab.tsx` để thấy ví dụ đầy đủ cách implement một entity với:
- Custom form validation
- Status rendering
- Expandable rows
- Custom callbacks

## 🚀 Demo

Truy cập `/admin/test-base` để xem demo BaseComponent hoạt động với QuizGroup entity.

## 🔄 Best Practices

1. **Service Layer**: Luôn extend từ BaseService để có sẵn CRUD operations
2. **Naming Convention**: Sử dụng consistent naming cho Entity, Request, Response
3. **Error Handling**: BaseService đã handle errors, chỉ cần catch cho custom logic
4. **Type Safety**: Sử dụng TypeScript generic types đầy đủ
5. **Caching**: BaseHooks đã optimize caching, không cần tự manage
6. **Form Validation**: Sử dụng Ant Design Form rules cho validation

## 🔧 Configuration

Các config options cho BaseComponent:

```typescript
interface BaseComponentConfig {
  queryKeyPrefix: string;    // Unique key cho React Query cache
  resourceName: string;      // Tên hiển thị (ví dụ: "Quiz Group")
  title: string;            // Tiêu đề trang
  createTitle?: string;     // Tiêu đề create modal
  editTitle?: string;       // Tiêu đề edit modal
  pageSize?: number;        // Số items per page (default: 10)
}
```

Hệ thống này giúp bạn tạo CRUD interface hoàn chỉnh chỉ với vài dòng code, đồng thời vẫn có thể customize theo nhu cầu cụ thể!
