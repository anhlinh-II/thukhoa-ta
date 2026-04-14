"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Form, Select, TreeSelect, Spin } from 'antd';
import { quizGroupService } from '@/share/services/quiz_group/quiz-group.service';
import { programService } from '@/share/services/program/programService';
import { PagingViewRequest } from '@/share/services/BaseService';

export default function QuizGroupSelector({ form, initialValue }: { form: any; initialValue?: number }) {
  const [options, setOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Array<any>>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setLoadingPrograms(true);
    programService.getViewsPagedWithFilter({ skip: 0, take: 200 }).then((resp: any) => {
      const list = resp?.data || [];
      setPrograms(list.map((p: any) => ({ title: p.name || p.title, value: p.id, key: p.id })));
    }).catch(() => setPrograms([])).finally(() => setLoadingPrograms(false));

    if (initialValue) {
      quizGroupService.findById(initialValue).then((r: any) => {
        setSelected(r as any);
        form.setFieldsValue({ quizGroup: initialValue });
        const programId = r?.programId || (r?.program && r.program.id) || null;
        if (programId) {
          setSelectedProgram(programId);
          fetchGroups(programId);
        } else {
          setOptions([{ label: r?.name || r?.title || r?.programName, value: r?.id }]);
        }
      }).catch(() => {});
    }
  }, [initialValue]);

  const fetchGroups = (programId?: number, q?: string) => {
    setLoading(true);
    const filters: any[] = [];
    if (programId) filters.push({ field: 'programId', operator: 'EQUALS', value: programId });
    filters.push({ field: 'groupType', operator: 'EQUALS', value: 'MOCK_TEST' });
    if (q) filters.push({ field: 'name', operator: 'CONTAINS', value: q });
    const req: PagingViewRequest = { skip: 0, take: 200, filter: filters.length ? JSON.stringify(filters) : '', columns: 'id,name' };
    quizGroupService.getViewsPagedWithFilter(req).then((resp: any) => {
      const list = resp?.data || [];
      const mapped = list.map((g: any) => ({ label: g.name || g.title || g.programName, value: g.id }));
      setOptions(mapped);
      try {
        const current = form?.getFieldValue?.('quizGroup');
        if (!current && mapped.length > 0) {
          const first = mapped[0];
          setSelected({ id: first.value, name: first.label });
          form?.setFieldsValue?.({ quizGroup: first.value });
        }
      } catch (e) {}
    }).catch((e) => { console.error('Group search failed', e); setOptions([]); }).finally(() => setLoading(false));
  };

  useEffect(() => { return () => { if (timerRef.current) window.clearTimeout(timerRef.current); }; }, []);

  const pick = (value: number, option: any) => {
    const item = { id: value, name: option?.label };
    setSelected(item as any);
    form.setFieldsValue({ quizGroup: value });
  };

  return (
    <>
      <Form.Item label="Program">
        {loadingPrograms ? (
          <div className="py-2"><Spin /></div>
        ) : (
          <TreeSelect
            treeData={programs}
            value={selectedProgram}
            onChange={(val) => { const id = val as number; setSelectedProgram(id); fetchGroups(id); }}
            placeholder="Select program"
            treeDefaultExpandAll
            style={{ width: '100%' }}
          />
        )}
      </Form.Item>

      <Form.Item label="Quiz Group" name="quizGroup" rules={[{ required: true, message: 'Please select group ID' }]}>
        <Select
          showSearch
          allowClear
          placeholder="Select quiz group"
          notFoundContent={loading ? 'Loading...' : null}
          filterOption={(input, option) => { const label = (option?.label as string) || ''; return label.toLowerCase().includes((input || '').toLowerCase()); }}
          onSearch={(v) => { if (timerRef.current) window.clearTimeout(timerRef.current); timerRef.current = window.setTimeout(() => fetchGroups(selectedProgram ?? undefined, v), 250); }}
          onChange={pick}
          options={options}
          loading={loading}
        />
      </Form.Item>
    </>
  );
}
