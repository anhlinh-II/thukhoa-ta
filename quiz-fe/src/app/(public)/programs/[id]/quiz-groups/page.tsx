"use client";

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Spin, Button, Breadcrumb } from "antd";
import { useParams, useRouter } from "next/navigation";
import { ArrowRightOutlined } from "@ant-design/icons";
import { GroupType, QuizGroupView } from "@/share/services/quiz_group/models";
import { quizGroupService } from "@/share/services/quiz_group/quiz-group.service";

const { Title, Text } = Typography;

// Config for each group type
const GROUP_TYPE_CONFIG = {
  [GroupType.FORMAT]: {
    title: "ĐỀ KIỂM TRA",
    label: "Bài",
    color: "from-green-100 to-green-50",
    numberColor: "text-green-700",
    icon: (
      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md">
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="6" width="28" height="36" rx="2" fill="#4CAF50" opacity="0.2"/>
          <rect x="12" y="10" width="20" height="4" rx="1" fill="#4CAF50"/>
          <rect x="12" y="18" width="20" height="3" rx="1" fill="#4CAF50"/>
          <rect x="12" y="24" width="16" height="3" rx="1" fill="#4CAF50"/>
          <circle cx="36" cy="12" r="8" fill="#FFC107"/>
          <path d="M36 8v8M32 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  },
  [GroupType.TOPIC]: { 
    title: "BÀI TẬP BỔ TRỢ",
    label: "Bài",
    color: "from-blue-100 to-blue-50",
    numberColor: "text-blue-700",
    icon: (
      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md">
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="8" width="32" height="24" rx="2" fill="#2196F3" opacity="0.2"/>
          <path d="M14 16l8 8 12-12" stroke="#2196F3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="16" y="28" width="20" height="8" rx="2" fill="#FF5722"/>
          <path d="M20 32h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  },
  [GroupType.MOCK_TEST]: {
    title: "LUYỆN CHỦ ĐIỂM",
    label: "Chủ điểm",
    color: "from-purple-100 to-purple-50",
    numberColor: "text-purple-700",
    icon: (
      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md">
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <rect x="12" y="8" width="24" height="32" rx="2" fill="#9C27B0" opacity="0.2"/>
          <path d="M18 14h12M18 20h12M18 26h8" stroke="#9C27B0" strokeWidth="2" strokeLinecap="round"/>
          <rect x="28" y="28" width="12" height="12" rx="1" fill="#FF5722"/>
          <text x="34" y="37" fill="white" fontSize="10" fontWeight="bold">A=</text>
        </svg>
      </div>
    )
  },
  [GroupType.OTHER]: {
    title: "KHÁC",
    label: "Bài",
    color: "from-gray-100 to-gray-50",
    numberColor: "text-gray-700",
    icon: (
      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md">
        <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="16" fill="#607D8B" opacity="0.2"/>
          <path d="M24 16v16M16 24h16" stroke="#607D8B" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
};

export default function ProgramQuizGroupsPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [quizGroups, setQuizGroups] = useState<QuizGroupView[]>([]);
  const [programName, setProgramName] = useState("");

  const fetchQuizGroups = async () => {
    setLoading(true);
    try {
      // Fetch quiz groups with filter - using getViewsPagedWithFilter
      // Backend expects filter as an array of FilterItemDto
      const request = {
        skip: 0,
        take: 100,
        filter: programId ? JSON.stringify([
          {
            field: "programId",
            operator: "EQUALS",
            value: Number(programId),
            dataType: "NUMBER"
          }
        ]) : undefined,
      };
      
      const response = await quizGroupService.getViewsPagedWithFilter(request);
      const groups = response.data as QuizGroupView[];
      
      setQuizGroups(groups);
      
      // Set program name if available (you might need to fetch program separately)
      if (programId) {
        setProgramName(groups[0]?.programName || `Chương trình ${programId}`);
      }
    } catch (error) {
      console.error("Error fetching quiz groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (programId) {
      fetchQuizGroups();
    }
  }, [programId]);

  const handleCardClick = (quizGroupId: number | string) => {
    // Find the group to check its type
    const groupId = typeof quizGroupId === 'string' ? parseInt(quizGroupId, 10) : quizGroupId;
    const group = quizGroups.find(g => g.id === groupId);
    
    const qs = new URLSearchParams();
    if (group?.name) qs.set('groupName', String(group.name));
    if (programName) qs.set('programName', String(programName));
    if(group?.programId) qs.set('programId', String(group.programId));
    const q = qs.toString() ? `?${qs.toString()}` : '';

    if (group?.groupType === GroupType.MOCK_TEST) {
      router.push(`/quiz-groups/${groupId}/mock-tests${q}`);
    } else {
      // For other types, navigate to quizzes page
      router.push(`/quiz-groups/${groupId}/quizzes${q}`);
    }
  };

  const getGroupConfig = (groupType: any) => {
    let type: GroupType;
    
    if (typeof groupType === 'string') {
      type = GroupType[groupType as keyof typeof GroupType] ?? GroupType.OTHER;
    } else {
      type = GroupType.OTHER;
    }
    
    return GROUP_TYPE_CONFIG[type] || GROUP_TYPE_CONFIG[GroupType.OTHER];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item onClick={() => router.push('/')}>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item>{programName || `Chương trình ${programId}`}</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Hero banner above quiz group cards */}
      <div className="mb-6">
        <div className="relative w-full rounded-lg overflow-hidden">
          <img src="/img/vao-6-desktop-1000-1.png" alt="Course hero" className="w-full h-56 md:h-72 lg:h-96 object-cover" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 drop-shadow-lg">Learn English</h1>
              <p className="mt-3 text-sm md:text-base text-gray-800">Suitable for learners of all levels — build strong foundations and gain confidence in English.</p>
              <div className="mt-5">
                <button onClick={() => router.push('/programs')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-md">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full text-center py-12">
          <Spin size="large" />
        </div>
      ) : quizGroups.length === 0 ? (
        <div className="text-center py-12">
          <Card>
            <Text type="secondary">Chưa có nhóm quiz nào</Text>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizGroups.map((group) => {
              const config = getGroupConfig(group.groupType);
              let quizCount = 0;
              if (group.groupType === GroupType.MOCK_TEST && group.totalMockTest) {
                quizCount = group.totalMockTest;
              } else if (group.groupType === GroupType.FORMAT && group.totalFormat) {
                quizCount = group.totalFormat;
              } else if (group.groupType === GroupType.TOPIC && group.totalTopic) {
                quizCount = group.totalTopic;
              }

              return (
                <div key={group.id} onClick={() => handleCardClick(group.id)} className={`cursor-pointer rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg bg-gradient-to-r ${config.color}`}>
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
                          <span>{config.title}</span>
                          <ArrowRightOutlined className="text-gray-400" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className={`text-4xl font-extrabold ${config.numberColor}`}>{quizCount || 0}</div>
                        <div className="text-sm text-gray-600 mt-1">{config.label}</div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md">
                        {config.icon}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Roadmap section: khai thác hiệu quả (sử dụng màu chủ đạo sky-500) */}
          <div className="mt-10 p-6 rounded-lg border-2 border-dashed border-sky-500">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold">💡 Lộ trình khai thác hiệu quả</h2>
                <p className="mt-2 text-sm text-gray-600">Theo dõi từng bước để tận dụng tối đa nguồn luyện tập trên nền tảng.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-sky-600" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h10M4 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-sky-600">GIAI ĐOẠN 1</div>
                    <h3 className="mt-4 font-bold text-md">Ôn theo dạng</h3>
                    <ul className="mt-4 text-sm text-gray-700 space-y-2 text-left">
                      <li className="flex items-start"><span className="text-sky-500 mr-2">✔</span>Ôn các dạng bài trọng tâm (ngữ pháp, đọc hiểu, trắc nghiệm).</li>
                      <li className="flex items-start"><span className="text-sky-500 mr-2">✔</span>Làm đề mẫu để nhận diện dạng và chiến lược làm bài.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-sky-600" viewBox="0 0 24 24" fill="none"><path d="M12 20v-6M6 8h12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-sky-600">GIAI ĐOẠN 2</div>
                    <h3 className="mt-4 font-bold text-md">Ôn theo chủ đề</h3>
                    <ul className="mt-4 text-sm text-gray-700 space-y-2 text-left">
                      <li className="flex items-start"><span className="text-sky-500 mr-2">✔</span>Luyện theo topic để mở rộng từ vựng và ngữ cảnh sử dụng.</li>
                      <li className="flex items-start"><span className="text-sky-500 mr-2">✔</span>Ghép các bài theo chủ đề để củng cố lâu dài.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-sky-600" viewBox="0 0 24 24" fill="none"><path d="M11 11V7a4 4 0 1 1 4 4h-4zM5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-sky-600">GIAI ĐOẠN 3</div>
                    <h3 className="mt-4 font-bold text-md">Luyện từ vựng đã lưu</h3>
                    <ul className="mt-4 text-sm text-gray-700 space-y-2 text-left">
                      <li className="flex items-start"><span className="text-sky-500 mr-2">✔</span>Làm quiz từ chính danh sách từ bạn đã lưu.</li>
                      <li className="flex items-start"><span className="text-sky-500 mr-2">✔</span>Xem báo cáo từ sai/nhớ để ôn lại hiệu quả.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
