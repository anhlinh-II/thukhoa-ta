"use client";

import React, { useEffect, useState } from 'react';
import { Table, Button, Progress, Space, Input } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import type { Breakpoint } from 'antd';
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
     const [total, setTotal] = useState(0);
     const [pageSize, setPageSize] = useState(10);
     const [currentPage, setCurrentPage] = useState(1);
     const [searchText, setSearchText] = useState('');
     const [searchDebounced, setSearchDebounced] = useState('');

     useEffect(() => {
          if (!isAuthenticated || !userId) return;
          fetchList();
     }, [isAuthenticated, userId, sortBy, direction, currentPage, pageSize, searchDebounced]);

    // debounce searchText before applying to query
    useEffect(() => {
         const t = setTimeout(() => setSearchDebounced(searchText), 350);
         return () => clearTimeout(t);
    }, [searchText]);

    const dirLabel = direction === 'ASC' ? 'Tăng' : 'Giảm';
    const dirDateLabel = direction === 'ASC' ? 'Cũ' : 'Mới';

     const fetchList = async () => {
          setLoading(true);
          try {
               const skip = (currentPage - 1) * pageSize;
               const req: PagingViewRequest = { 
                    skip: skip, 
                    take: pageSize, 
                    sort: `${sortBy} ${direction}`,
                    isGetTotal: true
               };

               if (searchDebounced && searchDebounced.trim().length > 0) {
                    req.filter = JSON.stringify([{ field: 'word', operator: 'CONTAINS', value: searchDebounced.trim(), dataType: 'STRING' }]);
               }

               const res = await userVocabularyService.getViewsPagedWithFilter(req);
               setData(res.data || []);
               setTotal(res.total || 0);
          } catch (e) {
               console.error(e);
          } finally {
               setLoading(false);
          }
     };

     const columns = [
          {
               title: 'Từ vựng',
               dataIndex: 'word',
               key: 'word',
               width: 120,
               fixed: 'left' as 'left',
               render: (text: string, record: any) => <div className="font-medium text-sm md:text-base">{text}</div>
          },
          {
               title: 'Định nghĩa',
               dataIndex: 'definitions',
               key: 'definitions',
               ellipsis: true,
               render: (definitions: any) => {
                    try {
                         if (typeof definitions === 'string') {
                              const defsArray = JSON.parse(definitions);
                              const firstDef = Array.isArray(defsArray) && defsArray.length > 0 ? defsArray[0] : '';
                              return <div className="text-xs md:text-sm text-gray-600 line-clamp-2">{firstDef}</div>;
                         }
                    } catch (e) {
                         return <span className="text-gray-400">-</span>;
                    }
                    return <span className="text-gray-400">-</span>;
               }
          },
          {
               title: 'Ghi nhớ',
               dataIndex: 'ease',
               key: 'ease',
               width: 100,
               responsive: ['md' as Breakpoint],
               render: (val: number) => {
                    const pct = Math.max(0, Math.min(100, (val || 0) / 5 * 100));
                    return <Progress percent={Math.round(pct)} size="small" showInfo={false} />;
               }
          },
          {
               title: 'Ngày lưu',
               dataIndex: 'createdAt',
               key: 'createdAt',
               width: 160,
               responsive: ['lg' as Breakpoint],
               render: (val: string) => val ? new Date(val).toLocaleString('vi-VN', { 
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
               }) : ''
          },
     ];

     return (
          <div className="w-full p-2 md:p-4">
               <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Từ vựng của tôi</h2>
               {!isAuthenticated ? (
                    <div>Bạn cần đăng nhập để xem từ vựng.</div>
               ) : (
                    <div>
                         <div className="mb-3 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
                              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                                   <Button 
                                        size="small"
                                        className="text-xs md:text-sm"
                                        icon={direction === 'ASC' ? <UpOutlined /> : <DownOutlined />}
                                        onClick={() => { setSortBy('createdAt'); setDirection(d => d === 'DESC' ? 'ASC' : 'DESC'); }}>
                                        Ngày lưu ({dirDateLabel})
                                   </Button>
                                   <Button 
                                        size="small"
                                        className="text-xs md:text-sm"
                                        icon={direction === 'ASC' ? <UpOutlined /> : <DownOutlined />}
                                        onClick={() => { setSortBy('ease'); setDirection(d => d === 'DESC' ? 'ASC' : 'DESC'); }}>
                                        Mức độ ghi nhớ ({dirLabel})
                                   </Button>
                                   <Input.Search
                                        placeholder="Tìm theo từ"
                                        allowClear
                                        onSearch={(val) => { setSearchText(val); setCurrentPage(1); }}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        style={{ width: 220 }}
                                        size="small"
                                   />
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                   <Link href="/vocabulary/my-flashcards">
                                        <Button size="small" type="default">Flashcard của tôi</Button>
                                   </Link>
                                   <Link href="/vocabulary/flashcards">
                                        <Button size="small" type="default" disabled={!data || data.length === 0}>Flashcard</Button>
                                   </Link>
                                   <Link href="/vocabulary/spelling">
                                        <Button size="small" type="default" disabled={!data || data.length === 0}>Chính tả</Button>
                                   </Link>
                                   <Link href="/vocabulary/review">
                                        <Button size="small" type="primary" disabled={!data || data.length === 0}>Ôn tập</Button>
                                   </Link>
                              </div>
                         </div>
                         <div className="overflow-x-auto">
                              <Table 
                                   rowKey="id" 
                                   dataSource={data} 
                                   columns={columns} 
                                   loading={loading}
                                   size="small"
                                   scroll={{ x: 'max-content' }}
                                   pagination={{
                                        current: currentPage,
                                        pageSize: pageSize,
                                        total: total,
                                        showSizeChanger: true,
                                        pageSizeOptions: ['10', '20', '50', '100'],
                                        showTotal: (total) => `Tổng ${total} từ`,
                                        onChange: (page, pageSize) => {
                                             setCurrentPage(page);
                                             setPageSize(pageSize);
                                        },
                                        simple: typeof window !== 'undefined' && window.innerWidth < 640,
                                        size: 'small'
                                   }} 
                              />
                         </div>
                    </div>
               )}
          </div>
     );
}
