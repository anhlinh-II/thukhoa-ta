"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Progress, Space } from 'antd';
import { userVocabularyService } from '@/share/services/user_vocabulary/user-vocabulary.service';
import { useIsAuthenticated } from '@/share/hooks/useAuth';
import Link from 'next/link';
import { PagingViewRequest } from '@/share/services/BaseService';

export default function VocabularyListPage() {
     const { isAuthenticated, user } = useIsAuthenticated();
     const userId = (user as any)?.id as number | undefined;

     const [data, setData] = useState<any[]>([]);
     const [loading, setLoading] = useState(false);
     const [sortBy, setSortBy] = useState<'createdAt' | 'ease'>('createdAt');
     const [direction, setDirection] = useState<'DESC' | 'ASC'>('DESC');

     useEffect(() => {
          if (!isAuthenticated || !userId) return;
          fetchList();
     }, [isAuthenticated, userId, sortBy, direction]);

     const fetchList = async () => {
          setLoading(true);
          try {
               const req: PagingViewRequest = { skip: 0, take: 200, sort: `${sortBy} ${direction}` };
               const res = await userVocabularyService.getViewsPagedWithFilter(req);
               setData(res.data || []);
          } catch (e) {
               console.error(e);
          } finally {
               setLoading(false);
          }
     };

     const columns = [
          {
               title: 'Word',
               dataIndex: 'word',
               key: 'word',
               render: (text: string, record: any) => <div className="font-medium">{text}</div>
          },
          {
               title: 'Ease',
               dataIndex: 'ease',
               key: 'ease',
               render: (val: number) => {
                    const pct = Math.max(0, Math.min(100, (val || 0) / 5 * 100));
                    return <Progress percent={Math.round(pct)} size="small" showInfo={false} />;
               }
          },
          {
               title: 'Saved At',
               dataIndex: 'createdAt',
               key: 'createdAt',
               render: (val: string) => val ? new Date(val).toLocaleString() : ''
          },
     ];

     return (
          <div className="w-full p-4">
               <h2 className="text-xl font-bold mb-4">Từ vựng của tôi</h2>
               {!isAuthenticated ? (
                    <div>Bạn cần đăng nhập để xem từ vựng.</div>
               ) : (
                    <div>
                         <div className="mb-2 flex items-center justify-between">
                              <div className="flex gap-2">
                                   <Button onClick={() => { setSortBy('createdAt'); setDirection(d => d === 'DESC' ? 'ASC' : 'DESC'); }}>
                                        Sắp xếp theo Ngày lưu ({direction})
                                   </Button>
                                   <Button onClick={() => { setSortBy('ease'); setDirection(d => d === 'DESC' ? 'ASC' : 'DESC'); }}>
                                        Sắp xếp theo Độ dễ ({direction})
                                   </Button>
                              </div>
                              <div>
                                   <Link href="/vocabulary/review">
                                        <Button type="primary" disabled={!data || data.length === 0}>Ôn tập</Button>
                                   </Link>
                              </div>
                         </div>
                         <Table rowKey="id" dataSource={data} columns={columns} loading={loading} pagination={false} />
                    </div>
               )}
          </div>
     );
}
