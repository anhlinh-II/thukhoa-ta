"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, Typography, Spin, Tabs, Input, Select, Radio } from 'antd';
import { userQuizHistoryService } from '@/share/services/user_quiz_history/user-quiz-history.service';

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
  const [tabKey, setTabKey] = useState<'mocktest' | 'topic' | 'format'>('mocktest');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'scoreDesc' | 'scoreAsc'>('newest');
  const [daysFilter, setDaysFilter] = useState<number | 'all'>(30);

  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [stacked, setStacked] = useState(false);
  const [visibleSets, setVisibleSets] = useState({ mocktest: true, topic: true, format: true });
  const [topTab, setTopTab] = useState<'history' | 'stats'>('history');

  const fetch = async (p = 0, s = 10, tab?: 'mocktest' | 'topic' | 'format') => {
    setLoading(true);
    try {
      const map: Record<string, string | undefined> = { mocktest: 'MOCK_TEST', topic: 'TOPIC', format: 'FORMAT' };
      const qt = tab ? map[tab] : undefined;
      const resp = await userQuizHistoryService.listPaged(p, s, qt);
      const all = resp.content || [];

      // assign to the currently selected lists
      if ((tab ?? tabKey) === 'mocktest') setItems(all);
      else if ((tab ?? tabKey) === 'topic') setTopicItems(all);
      else if ((tab ?? tabKey) === 'format') setFormatItems(all);
      setTotal(resp.totalElements || 0);
      setPage(p);
      setSize(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(0, 10, tabKey); }, [tabKey]);

  // Fetch all quiz types when switching to stats tab
  useEffect(() => {
    if (topTab === 'stats') {
      const fetchAll = async () => {
        try {
          const [mockRes, topicRes, formatRes] = await Promise.all([
            userQuizHistoryService.listPaged(0, 100, 'MOCK_TEST'),
            userQuizHistoryService.listPaged(0, 100, 'TOPIC'),
            userQuizHistoryService.listPaged(0, 100, 'FORMAT'),
          ]);
          setItems(mockRes.content || []);
          setTopicItems(topicRes.content || []);
          setFormatItems(formatRes.content || []);
        } catch (e) {
          console.error('Failed to fetch stats data', e);
        }
      };
      fetchAll();
    }
  }, [topTab]);

  // derive lists for topic and format based on quizType returned from backend
  const [topicItems, setTopicItems] = useState<any[]>([]);
  const [formatItems, setFormatItems] = useState<any[]>([]);

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
        const date = new Date(it.createdAt || Date.now());
        const key = `${date.getMonth() + 1}/${date.getDate()}`;
        const val = it.score ?? 0;
        const cur = map.get(key) || { sum: 0, cnt: 0 };
        cur.sum += val; cur.cnt += 1; map.set(key, cur);
      });

      const data = labels.map(l => {
        const found = map.get(l);
        if (found && found.cnt > 0) return found.sum / found.cnt;
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

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString() : '-';

  return (
    <div className="p-2">
      <Card bordered={false} className="shadow-md rounded-lg">
        <Tabs activeKey={topTab} onChange={(k) => setTopTab(k as any)}>
          <Tabs.TabPane tab="Lịch sử làm bài" key="history">
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
    </div>
  );
}
