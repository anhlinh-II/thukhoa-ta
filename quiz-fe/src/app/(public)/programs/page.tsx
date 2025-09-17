"use client";
import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Spin, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { programService } from "../../../services/programService";
import type { ProgramView } from "../../../services/programService";

const { Title } = Typography;

export default function ProgramsPage() {
  const [data, setData] = useState<ProgramView[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const fetchPrograms = async (p = 1, size = 20) => {
    setLoading(true);
    try {
      const req = {
        skip: (p - 1) * size,
        take: size,
        sort: "",
        columns: "", 
        filter: "",
        emptyFilter: "",
        isGetTotal: true,
      } as any;

      const resp: any = await programService.getViewsPagedWithFilter(req);

      // handle different backend wrappers
      const result = resp?.result ?? resp?.data ?? resp;
      const list = result?.data ?? result?.content ?? result;
      const totalCount = result?.total ?? result?.totalElements ?? 0;

      setData(Array.isArray(list) ? list : []);
      setTotal(typeof totalCount === "number" ? totalCount : 0);
    } catch (err: any) {
      console.error("Fetch programs error", err);
      message.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const columns: ColumnsType<ProgramView> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    { title: "Level", dataIndex: "level", key: "level", width: 100 },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => (v ? "Yes" : "No"),
      width: 100,
    },
    { title: "Display Order", dataIndex: "displayOrder", key: "displayOrder", width: 120 },
    { title: "Parent ID", dataIndex: "parentId", key: "parentId", width: 120 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <Title level={3} className="!m-0">
            Programs
          </Title>
        </div>

        {loading ? (
          <div className="w-full text-center py-12">
            <Spin />
          </div>
        ) : (
          <Table<ProgramView>
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              onChange: (p, size) => {
                setPage(p);
                setPageSize(size || pageSize);
              },
            }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
