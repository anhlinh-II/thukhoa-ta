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
        <div className="space-y-4">
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
              <Card 
                key={group.id}
                hoverable
                className={`bg-gradient-to-r ${config.color} border-none shadow-md hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => handleCardClick(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {config.icon}
                    <div>
                      <div className="flex items-center gap-3">
                        <Title level={4} className="!m-0 !text-gray-800">
                          {group.name}
                        </Title>
                        <ArrowRightOutlined className="text-gray-400" />
                      </div>
                      {group.description && (
                        <Text type="secondary" className="text-sm block mt-1">
                          {group.description}
                        </Text>
                      )}
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-green-600">{quizCount || 0}</span>
                        <span className="ml-2 text-gray-600">{config.label}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(group.id);
                    }}
                    className="px-8"
                  >
                    Bắt đầu
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
