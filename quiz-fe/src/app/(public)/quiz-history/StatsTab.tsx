"use client";

import React, { useState } from 'react';
import { Card, Checkbox, Radio } from 'antd';
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
  const [fillArea, setFillArea] = useState(false);

  // prepare datasets according to visibility and fillArea
  const prepareDatasets = () => {
    return chartData.datasets.map((ds: any) => ({
      ...ds,
      fill: chartType === 'line' ? fillArea : false,
      // if fill enabled, make background a translucent version
      backgroundColor: chartType === 'line' && fillArea ? (ds.backgroundColor || 'rgba(0,0,0,0.15)') : ds.backgroundColor,
    }));
  };

  const data = { labels: chartData.labels, datasets: prepareDatasets() };

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
          ) : (
            <Checkbox checked={fillArea} onChange={e=>setFillArea(e.target.checked)}>Tô vùng dưới</Checkbox>
          )}
        </div>
      </div>

      <Card className="mb-4">
        {chartType === 'line' ? (
          <Line data={data} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        ) : (
          <Bar data={data} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { stacked }, y: { stacked } } }} />
        )}
      </Card>

      <Card>
        <h5 className="text-lg font-semibold">Thống kê thời gian học</h5>
        <div className="text-sm text-gray-600">Biểu đồ mô phỏng thời gian dành cho học tập (ví dụ)</div>
      </Card>
    </>
  );
}
