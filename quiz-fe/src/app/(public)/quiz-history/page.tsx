"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, List, Typography, Pagination, Spin, Button, Tag, Space, Modal, Row, Col, Tabs, Input, Select, Radio, Checkbox, Divider } from 'antd';
import { userQuizHistoryService } from '@/share/services/user_quiz_history/user-quiz-history.service';
import { LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import HistoryTab from './HistoryTab';
import StatsTab from './StatsTab';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const { Title, Text } = Typography;

export default function QuizHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  // UI state for redesign
  const [tabKey, setTabKey] = useState<'mocktest' | 'topic' | 'format'>('mocktest');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'scoreDesc' | 'scoreAsc'>('newest');
  const [daysFilter, setDaysFilter] = useState<number | 'all'>(30);

  // Chart controls
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [stacked, setStacked] = useState(false);
  const [visibleSets, setVisibleSets] = useState({ mocktest: true, topic: true, format: true });
  const [topTab, setTopTab] = useState<'history' | 'stats'>('history');

  const fetch = async (p = 0, s = 10) => {
    setLoading(true);
    try {
      const resp = await userQuizHistoryService.listPaged(p, s);
      setItems(resp.content || []);
      setTotal(resp.totalElements || 0);
      setPage(p);
      setSize(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(0, 10); }, []);

  // Generate fake data for topic and format types based on mock data or random
  const [topicItems, setTopicItems] = useState<any[]>([]);
  const [formatItems, setFormatItems] = useState<any[]>([]);

  useEffect(() => {
    // derive fake data when items change
    const makeFake = (prefix: string, count = 12) => {
      const base = items.slice(0, Math.min(items.length, count));
      if (base.length === 0) {
        // generate some dummy
        return Array.from({ length: count }).map((_, i) => ({
          id: `f-${prefix}-${i}`,
          title: `${prefix} sample ${i + 1}`,
          createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
          score: Math.round((Math.random() * 10) * 100) / 100,
          correctCount: Math.floor(Math.random() * 20),
          totalQuestions: 20,
        }));
      }

      return base.map((b, i) => ({
        ...b,
        id: `f-${prefix}-${i}`,
        title: `${prefix} - ${b.title ?? b.quizMockTestId}`,
        createdAt: new Date(Date.parse(b.createdAt || Date.now().toString()) - (i * 86400000)).toISOString(),
        score: Math.round(((b.score ?? (Math.random() * 10)) + Math.random()) * 100) / 100,
      }));
    };

    setTopicItems(makeFake('QuizTopic', 20));
    setFormatItems(makeFake('QuizFormat', 18));
  }, [items]);

  // Combined dataset for easier chart aggregation
  const allSets = useMemo(() => ({ mocktest: items, topic: topicItems, format: formatItems }), [items, topicItems, formatItems]);

  // Apply filters and search to active list
  const filteredList = useMemo(() => {
    const list = tabKey === 'mocktest' ? items : tabKey === 'topic' ? topicItems : formatItems;
    const now = Date.now();
    const days = daysFilter === 'all' ? Infinity : daysFilter as number;

    let res = list.filter(it => {
      if (searchText) {
        const s = searchText.toLowerCase();
        return (it.title || '').toLowerCase().includes(s) || String(it.id).includes(s);
      }
      return true;
    }).filter(it => {
      if (days === Infinity) return true;
      const created = it.createdAt ? Date.parse(it.createdAt) : now;
      return (now - created) <= days * 86400000;
    });

    if (sortBy === 'scoreDesc') res = res.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));
    else if (sortBy === 'scoreAsc') res = res.sort((a: any, b: any) => (a.score ?? 0) - (b.score ?? 0));
    else res = res.sort((a: any, b: any) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));

    return res;
  }, [tabKey, items, topicItems, formatItems, searchText, daysFilter, sortBy]);

  // Helper: build chart data (scores over days) for last N days
  const chartDays = useMemo(() => (daysFilter === 'all' ? 90 : (typeof daysFilter === 'number' ? daysFilter : 30)), [daysFilter]);

  const chartData = useMemo(() => {
    const days = chartDays;
    const labels: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }

    const aggregate = (list: any[]) => {
      const map = new Map<string, { sum: number; cnt: number }>();
      list.forEach((it) => {
        const d = new Date(it.createdAt || Date.now()).toLocaleDateString();
        const key = new Date(it.createdAt || Date.now()).toLocaleDateString();
        const val = it.score ?? 0;
        const cur = map.get(key) || { sum: 0, cnt: 0 };
        cur.sum += val; cur.cnt += 1; map.set(key, cur);
      });

      const data = labels.map(l => {
        // find matching key by converting label back to a date string - approximate match by month/day
        const found = Array.from(map.entries()).find(([k]) => k.includes('/' + l.split('/')[1]) && k.includes('/' + l.split('/')[0]));
        if (found) return found[1].sum / found[1].cnt;
        return 0;
      });
      return data;
    };

    const datasets: any[] = [];
    if (visibleSets.mocktest) datasets.push({ label: 'MockTest', data: aggregate(allSets.mocktest), backgroundColor: 'rgba(99,102,241,0.6)', borderColor: 'rgba(99,102,241,1)' });
    if (visibleSets.topic) datasets.push({ label: 'Topic', data: aggregate(allSets.topic), backgroundColor: 'rgba(16,185,129,0.6)', borderColor: 'rgba(16,185,129,1)' });
    if (visibleSets.format) datasets.push({ label: 'Format', data: aggregate(allSets.format), backgroundColor: 'rgba(236,72,153,0.6)', borderColor: 'rgba(236,72,153,1)' });

    return { labels, datasets };
  }, [allSets, visibleSets, chartDays]);

  const openDetail = (item: any) => {
    setActiveItem(item);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setActiveItem(null);
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString() : '-';

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-md rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="!mb-0">Lịch sử làm bài của tôi</Title>
          <Space>
            <Button type="default" onClick={() => fetch(0, size)}>Refresh</Button>
            <Link href="/leaderboard"><Button icon={<LinkOutlined />}>Leaderboard</Button></Link>
          </Space>
        </div>

        <Tabs activeKey={topTab} onChange={(k) => setTopTab(k as any)}>
          <Tabs.TabPane tab="Lịch sử" key="history">
            <div className="mb-4">
              <Tabs tabPosition="left" activeKey={tabKey} onChange={(k) => setTabKey(k as any)}>
                <Tabs.TabPane tab={<span>Quiz</span>} key="mocktest">
                  <HistoryTab
                    filteredList={filteredList}
                    loading={loading}
                    page={page}
                    size={size}
                    total={total}
                    fetch={fetch}
                    openDetail={openDetail}
                    tabKey={tabKey}
                    setTabKey={setTabKey}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    daysFilter={daysFilter}
                    setDaysFilter={setDaysFilter}
                    fmtDate={fmtDate}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span>Chủ điểm</span>} key="topic">
                  <HistoryTab
                    filteredList={filteredList}
                    loading={loading}
                    page={page}
                    size={size}
                    total={total}
                    fetch={fetch}
                    openDetail={openDetail}
                    tabKey={tabKey}
                    setTabKey={setTabKey}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    daysFilter={daysFilter}
                    setDaysFilter={setDaysFilter}
                    fmtDate={fmtDate}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span>Dạng bài</span>} key="format">
                  <HistoryTab
                    filteredList={filteredList}
                    loading={loading}
                    page={page}
                    size={size}
                    total={total}
                    fetch={fetch}
                    openDetail={openDetail}
                    tabKey={tabKey}
                    setTabKey={setTabKey}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    daysFilter={daysFilter}
                    setDaysFilter={setDaysFilter}
                    fmtDate={fmtDate}
                  />
                </Tabs.TabPane>
              </Tabs>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Thống kê" key="stats">
            <StatsTab
              chartData={chartData}
              chartType={chartType}
              setChartType={setChartType}
              stacked={stacked}
              setStacked={setStacked}
              visibleSets={visibleSets}
              setVisibleSets={setVisibleSets}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      <Modal visible={detailVisible} title="Chi tiết lần làm bài" footer={null} onCancel={closeDetail} width={800}>
        {activeItem ? (
          <div>
            <Row gutter={[16,16]}>
              <Col span={12}><Text strong>Quiz:</Text> <div>{activeItem.title ?? `Quiz ${activeItem.quizMockTestId ?? activeItem.id}`}</div></Col>
              <Col span={12}><Text strong>Ngày:</Text> <div>{fmtDate(activeItem.createdAt)}</div></Col>
              <Col span={12}><Text strong>Điểm:</Text> <div>{(activeItem.score ?? 0).toFixed(2)}/10</div></Col>
              <Col span={12}><Text strong>Đúng:</Text> <div>{activeItem.correctCount ?? 0}/{activeItem.totalQuestions ?? '-'}</div></Col>
            </Row>

            <div className="mt-4">
              <Text strong>Những câu sai (ví dụ):</Text>
              <List
                dataSource={activeItem.wrongQuestions ?? [{q:'Q1', your:'A', correct:'B'},{q:'Q3', your:'D', correct:'C'}]}
                renderItem={(w:any)=>(
                  <List.Item>
                    <div className="w-full flex justify-between">
                      <div>{w.q}</div>
                      <div className="text-sm text-red-600">Bạn: {w.your} • Đúng: {w.correct}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
