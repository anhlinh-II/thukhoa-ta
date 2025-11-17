"use client";

import React, { useMemo, useState } from 'react';
import { Card, Checkbox, Radio, Row, Col } from 'antd';
import { Bar, Line } from 'react-chartjs-2';

interface Props {
  chartData: any;
  chartType: 'line' | 'bar';
  setChartType: (t: 'line' | 'bar') => void;
  stacked: boolean;
  setStacked: (s: boolean) => void;
  visibleSets: { mocktest: boolean; topic: boolean; format: boolean };
  setVisibleSets: (v: any) => void;
}

export default function StatsTab({ chartData, chartType, setChartType, stacked, setStacked, visibleSets, setVisibleSets }: Props) {
  // no area fill option anymore
  const [rangeMode, setRangeMode] = useState<'7d' | '4w' | '12m'>('7d');

  

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: chartType === 'bar' ? { x: { stacked }, y: { stacked } } : undefined,
  }), [chartType, stacked]);

  // second chart: a small example (time spent) derived from the same data but aggregated differently
  // Aggregate helper: supports 7 days (last 7), 4 weeks (last 28 days -> 4 buckets of 7), 12 months (last 360 days -> 12 buckets of 30)
  const getAggregated = (mode: '7d' | '4w' | '12m') => {
    const labels: string[] = chartData.labels || [];
    // get datasets per visible series
    const origDatasets: any[] = chartData.datasets || [];

    if (mode === '7d') {
      const take = 7;
      const start = Math.max(0, labels.length - take);
      const newLabels = labels.slice(start);
      const newDatasets = origDatasets.map(ds => ({
        ...ds,
        data: (ds.data || []).slice(start),
      }));
      return { labels: newLabels, datasets: newDatasets };
    }

    if (mode === '4w') {
      const take = 28; // last 28 days
      const sliceStart = Math.max(0, labels.length - take);
      const segmentSize = 7;
      const segLabels: string[] = [];
      const segDatasets = origDatasets.map(ds => ({ ...ds, data: [] as number[] }));
      const slicedLabels = labels.slice(sliceStart);
      const slicedLen = slicedLabels.length;
      for (let s = 0; s < 4; s++) {
        const segStart = Math.max(0, slicedLen - (s + 1) * segmentSize);
        const segEnd = slicedLen - s * segmentSize;
        const segSlice = slicedLabels.slice(segStart, segEnd);
        // label = last day label in the segment
        segLabels.unshift(segSlice[segSlice.length - 1] || '');
      }
      // compute averages per segment for each dataset
      origDatasets.forEach((ds, idx) => {
        const values = ds.data ? (ds.data as number[]).slice(sliceStart) : [];
        const segVals: number[] = [];
        for (let s = 0; s < 4; s++) {
          const segStart = Math.max(0, values.length - (s + 1) * segmentSize);
          const segEnd = values.length - s * segmentSize;
          const seg = values.slice(segStart, segEnd);
          const avg = seg.length ? seg.reduce((a: number, b: number) => a + (b || 0), 0) / seg.length : 0;
          segVals.unshift(Math.round(avg * 100) / 100);
        }
        segDatasets[idx].data = segVals;
      });
      return { labels: segLabels, datasets: segDatasets };
    }

    // 12 months: approximate by 12 buckets of 30 days from last
    const take = 360; // 12 * 30
    const sliceStart = Math.max(0, labels.length - take);
    const slicedLabels = labels.slice(sliceStart);
    const segSize = 30;
    const segCount = 12;
    const segLabels: string[] = [];
    const segDatasets = origDatasets.map(ds => ({ ...ds, data: [] as number[] }));
    for (let m = 0; m < segCount; m++) {
      const segStart = Math.max(0, slicedLabels.length - (m + 1) * segSize);
      const segEnd = Math.max(0, slicedLabels.length - m * segSize);
      const segSlice = slicedLabels.slice(segStart, segEnd);
      segLabels.unshift(segSlice[segSlice.length - 1] || '');
    }
    origDatasets.forEach((ds, idx) => {
      const values = ds.data ? (ds.data as number[]).slice(sliceStart) : [];
      const segVals: number[] = [];
      for (let m = 0; m < segCount; m++) {
        const segStart = Math.max(0, values.length - (m + 1) * segSize);
        const segEnd = Math.max(0, values.length - m * segSize);
        const seg = values.slice(segStart, segEnd);
        const avg = seg.length ? seg.reduce((a: number, b: number) => a + (b || 0), 0) / seg.length : 0;
        segVals.unshift(Math.round(avg * 100) / 100);
      }
      segDatasets[idx].data = segVals;
    });
    return { labels: segLabels, datasets: segDatasets };
  };

  const displayed = useMemo(() => getAggregated(rangeMode), [chartData, rangeMode]);

  // Prepare datasets from aggregated `displayed` and apply visibility toggles
  const displayedDatasets = useMemo(() => {
    const ds: any[] = (displayed && displayed.datasets) ? displayed.datasets.slice() : [];
    // map labels/datasets to honor visibleSets — assume dataset.label contains the key name
    return ds
      .filter(d => {
        const lbl = (d.label || '').toString().toLowerCase();
        if (lbl.includes('mock')) return visibleSets.mocktest;
        if (lbl.includes('topic')) return visibleSets.topic;
        if (lbl.includes('format')) return visibleSets.format;
        return true;
      })
      .map(d => ({ ...d, fill: false, backgroundColor: d.backgroundColor }));
  }, [displayed, visibleSets]);

  const data = useMemo(() => ({ labels: (displayed && displayed.labels) || [], datasets: displayedDatasets }), [displayed, displayedDatasets]);

  const timeChartData = useMemo(() => {
    // use same aggregation logic to show time chart: for demo we derive random-ish values if no data
    const labels = displayed.labels.slice(-12);
    const values = displayed.datasets.length ? displayed.datasets[0].data.slice(-labels.length) : labels.map(() => Math.round(Math.random() * 60));
    return { labels, datasets: [{ label: 'Thời gian (phút)', data: values, backgroundColor: 'rgba(59,130,246,0.6)', borderColor: 'rgba(59,130,246,1)' }] };
  }, [displayed]);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox checked={visibleSets.mocktest} onChange={e=>setVisibleSets({...visibleSets, mocktest: e.target.checked})}>MockTest</Checkbox>
          <Checkbox checked={visibleSets.topic} onChange={e=>setVisibleSets({...visibleSets, topic: e.target.checked})}>Topic</Checkbox>
          <Checkbox checked={visibleSets.format} onChange={e=>setVisibleSets({...visibleSets, format: e.target.checked})}>Format</Checkbox>
        </div>

        <div className="flex items-center gap-3">
          <Radio.Group value={chartType} onChange={e=>setChartType(e.target.value)}>
            <Radio.Button value="line">Đường</Radio.Button>
            <Radio.Button value="bar">Cột</Radio.Button>
          </Radio.Group>
          {chartType === 'bar' ? (
            <Checkbox checked={stacked} onChange={e=>setStacked(e.target.checked)}>Xếp chồng</Checkbox>
          ) : null}
          <div className="ml-4">
            <Radio.Group value={rangeMode} onChange={(e) => setRangeMode(e.target.value)}>
              <Radio.Button value="7d">7 ngày</Radio.Button>
              <Radio.Button value="4w">4 tuần</Radio.Button>
              <Radio.Button value="12m">12 tháng</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>

      <Row gutter={[16,16]}>
        <Col xs={24} md={12}>
          <Card className="mb-4" style={{ height: 380 }} bodyStyle={{ height: '100%', padding: 12 }}>
            <div style={{ height: '100%' }}>
              {chartType === 'line' ? (
                <Line data={data} options={chartOptions} />
              ) : (
                <Bar data={data} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card className="mb-4" style={{ height: 380 }} bodyStyle={{ height: '100%', padding: 12 }}>
            <div style={{ height: '100%' }}>
              <h5 className="text-lg font-semibold">Thống kê thời gian học</h5>
              <div style={{ height: 'calc(100% - 36px)', marginTop: 8 }}>
                {chartType === 'line' ? (
                  <Line data={timeChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                ) : (
                  <Bar data={timeChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
