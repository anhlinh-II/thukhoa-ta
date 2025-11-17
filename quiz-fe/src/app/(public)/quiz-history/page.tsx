"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card, List, Typography, Pagination, Spin, Button, Tag, Space, Modal, Row, Col, Tabs, Input, Select, Radio, Checkbox, Divider } from 'antd';
import { userQuizHistoryService } from '@/share/services/user_quiz_history/user-quiz-history.service';
import { questionService } from '@/share/services/question/question.service';
import { questionOptionService } from '@/share/services/question_option/question-option.service';
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
    // load detail from backend    
    setActiveItem(item);
    setDetailVisible(true);
    loadDetail(item);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setActiveItem(null);
  };

  const [detailLoading, setDetailLoading] = useState(false);
  const [historyDetail, setHistoryDetail] = useState<any | null>(null);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionDetail, setQuestionDetail] = useState<any | null>(null);
  const [questionOptions, setQuestionOptions] = useState<any[]>([]);

  const loadDetail = async (item: any) => {
    setDetailLoading(true);
    try {
      const res = await userQuizHistoryService.getDetail(item.id ?? item);
      setHistoryDetail(res || null);
    } catch (e) {
      console.error('Failed to load history detail', e);
      setHistoryDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

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
              <Text strong>Danh sách câu hỏi:</Text>
              {detailLoading ? (
                <div className="py-8 flex justify-center"><Spin /></div>
              ) : (
                <List
                  dataSource={historyDetail?.questions ?? []}
                  locale={{ emptyText: 'Không có dữ liệu' }}
                  renderItem={(q: any, idx: number) => (
                    <List.Item>
                      <div className="w-full flex justify-between items-center">
                        <div>
                          <Text>{idx + 1}. </Text>
                          <Text>Câu #{q.questionId}</Text>
                          <div className="text-sm text-gray-600">(Question id: {q.questionId})</div>
                        </div>
                        <div className="text-sm">
                          {q.isCorrect ? (
                            <Tag color="green">Đúng</Tag>
                          ) : (
                            <Tag color="red">Sai</Tag>
                          )}
                          <div className="mt-1">
                            <span className="mr-4">Bạn: {q.userOptionId ?? '-'}</span>
                            <span>Đúng: {q.correctOptionId ?? '-'}</span>
                          </div>
                          <div className="mt-2">
                            <Button size="small" onClick={async () => {
                              setQuestionLoading(true);
                              setQuestionDetail(null);
                              setQuestionOptions([]);
                              try {
                                const qd = await questionService.findById(q.questionId);
                                const opts = await questionOptionService.findAll();
                                const filtered = (opts || []).filter((o:any) => o.questionId === q.questionId);
                                setQuestionDetail(qd);
                                setQuestionOptions(filtered);
                                setQuestionModalVisible(true);
                              } catch (e) {
                                console.error('Failed to load question detail', e);
                              } finally {
                                setQuestionLoading(false);
                              }
                            }}>Xem chi tiết</Button>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        ) : null}
      </Modal>
      <Modal visible={questionModalVisible} title={questionDetail?.contentHtml ? 'Chi tiết câu hỏi' : 'Loading...'} footer={null} onCancel={() => setQuestionModalVisible(false)} width={900}>
        {questionLoading ? (
          <div className="py-8 flex justify-center"><Spin /></div>
        ) : questionDetail ? (
          <div>
            <div className="mb-4" dangerouslySetInnerHTML={{ __html: questionDetail.contentHtml }} />
            <List
              dataSource={questionOptions}
              renderItem={(opt: any) => (
                <List.Item>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <div dangerouslySetInnerHTML={{ __html: opt.contentHtml }} />
                    </div>
                    <div className="text-right">
                      {historyDetail && historyDetail.questions?.find((qq:any) => qq.questionId === questionDetail.id)?.userOptionId === opt.id && (
                        <Tag color="blue">Bạn chọn</Tag>
                      )}
                      {opt.isCorrect && (
                        <Tag color="green">Đáp án đúng</Tag>
                      )}
                      {historyDetail && historyDetail.questions?.find((qq:any) => qq.questionId === questionDetail.id)?.userOptionId === opt.id && !opt.isCorrect && (
                        <div className="text-red-600 line-through">Sai</div>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />

            {historyDetail?.isShowExplain && questionDetail.explanationHtml && (
              <div className="mt-4 p-3 bg-gray-50 rounded" dangerouslySetInnerHTML={{ __html: questionDetail.explanationHtml }} />
            )}
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
      </Modal>
    </div>
  );
}
