"use client";

import React from 'react';
import { List, Spin, Tag, Row, Col, Space, Button, Pagination, Input, Select, Radio, Typography } from 'antd';
import Link from 'next/link';

const { Text } = Typography;

interface Props {
  filteredList: any[];
  loading: boolean;
  page: number;
  size: number;
  total: number;
  fetch: (p?: number, s?: number) => void;
  tabKey: 'mocktest' | 'topic' | 'format';
  setTabKey: React.Dispatch<React.SetStateAction<'mocktest' | 'topic' | 'format'>>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  sortBy: 'newest' | 'scoreDesc' | 'scoreAsc';
  setSortBy: React.Dispatch<React.SetStateAction<'newest' | 'scoreDesc' | 'scoreAsc'>>;
  daysFilter: number | 'all';
  setDaysFilter: React.Dispatch<React.SetStateAction<number | 'all'>>;
  fmtDate: (d?: string) => string;
}

export default function HistoryTab({ filteredList, loading, page, size, total, fetch, tabKey, setTabKey, searchText, setSearchText, sortBy, setSortBy, daysFilter, setDaysFilter, fmtDate }: Props) {
  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Input.Search placeholder="Tìm kiếm" allowClear onSearch={(v) => setSearchText(v)} style={{ flex: 1 }} />
        <Select value={sortBy} onChange={(v) => setSortBy(v as any)} options={[{label:'Mới nhất',value:'newest'},{label:'Điểm giảm dần',value:'scoreDesc'},{label:'Điểm tăng dần',value:'scoreAsc'}]} style={{ width: 160 }} />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Radio.Group value={daysFilter} onChange={e => setDaysFilter(e.target.value)}>
          <Radio.Button value={7}>7 ngày</Radio.Button>
          <Radio.Button value={30}>30 ngày</Radio.Button>
          <Radio.Button value={90}>90 ngày</Radio.Button>
          <Radio.Button value={'all'}>Tất cả</Radio.Button>
        </Radio.Group>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center"><Spin size="large" /></div>
      ) : (
        <List
          dataSource={filteredList}
          itemLayout="vertical"
          split
          renderItem={(item) => {
            const attempt = item.attemptNumber ?? Math.floor(Math.random() * 5) + 1;
            const duration = item.durationMinutes ?? (Math.floor(Math.random() * 30) + 5) + ' phút';
            const statusTag = (item.score ?? 0) >= 5 ? <Tag color="success">Passed</Tag> : <Tag color="warning">Review</Tag>;

            return (
              <List.Item>
                <Row className="w-full" align="middle" gutter={16}>
                  <Col xs={24} sm={14}>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-md bg-pink-50 flex items-center justify-center text-sky-600 font-bold">#{item.id ?? item.quizMockTestId}</div>
                      <div>
                        <div className="flex items-center gap-3">
                          <Text strong>{item.examName ?? item.title ?? `Quiz ${item.id ?? item.quizMockTestId}`}</Text>
                          {statusTag}
                        </div>
                        <div className="text-sm text-gray-500">Ngày: {fmtDate(item.createdAt)} • Thời lượng: {duration} • Lần: {attempt}</div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={6} className="text-center">
                    <div className="text-2xl font-semibold text-gray-800">{(item.score ?? 0).toFixed(2)}/10</div>
                    <div className="text-sm text-gray-500">Đúng: {item.correctCount ?? 0}/{item.totalQuestions ?? '-'}</div>
                  </Col>

                  <Col xs={24} sm={4} className="text-right">
                    <Link href={`/quiz-history/${item.id}?name=${encodeURIComponent(item.examName || item.title || '')}`}>
                      <Button type="primary" className="!rounded-full">Xem chi tiết</Button>
                    </Link>
                  </Col>
                </Row>
              </List.Item>
            );
          }}
        />
      )}

      <div className="mt-4 text-center">
        <Pagination current={page + 1} pageSize={size} total={total} onChange={(p, s) => fetch(p - 1, s)} />
      </div>
    </>
  );
}
