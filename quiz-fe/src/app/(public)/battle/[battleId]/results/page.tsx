"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Typography, Avatar, Tag, Button, Confetti } from "antd";
import { TrophyOutlined, UserOutlined, WarningOutlined, HomeOutlined, ReloadOutlined, CrownOutlined } from "@ant-design/icons";
import { useBattleWebSocket } from "@/share/hooks/useBattleWebSocket";
import { useAccount } from "@/share/hooks/useAuth";
import { battleService, BattleResultResp, BattleParticipantResp, TeamResultResp } from "@/share/services/battle.service";

const { Title, Text } = Typography;

export default function BattleResultsPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = Number(params.battleId as string);
  const { data: user } = useAccount();

  const { leaderboard } = useBattleWebSocket(battleId, user?.id || 0);
  const [results, setResults] = useState<BattleResultResp | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await battleService.getResults(battleId);
        if (mounted) setResults(resp);
      } catch (e) {
        console.error('Failed to fetch battle results', e);
      }
    })();
    return () => { mounted = false; };
  }, [battleId]);

  const participants = results?.participants || leaderboard || [];
  const sortedParticipants = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedParticipants[0];
  const isCurrentUserWinner = winner?.userId === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Winner Banner */}
        {winner && (
          <Card className="shadow-xl rounded-2xl border-0 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 -m-6 p-8 text-center">
              <CrownOutlined className="text-6xl text-white mb-4 animate-bounce" />
              <Title level={2} className="!text-white !mb-2">
                🎉 {isCurrentUserWinner ? 'Chúc mừng bạn!' : `${winner.userName || `User #${winner.userId}`} chiến thắng!`}
              </Title>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Avatar 
                  size={80} 
                  src={winner.avatarUrl || undefined} 
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
                />
                <div className="text-left">
                  <Text className="text-white/90 block text-lg">{winner.userName || `User #${winner.userId}`}</Text>
                  <Text className="text-white text-3xl font-bold">{winner.score} điểm</Text>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="shadow-lg rounded-2xl border-0">
          <div className="text-center mb-6">
            <TrophyOutlined className="text-4xl text-yellow-500 mb-2" />
            <Title level={3} className="!mb-1">Bảng Xếp Hạng</Title>
            <Text type="secondary">Battle #{battleId}</Text>
          </div>

          <div className="space-y-3">
            {/* If teams exist, show team leaderboard */}
            {results && results.teams && results.teams.length > 0 ? (
              results.teams.map((team: TeamResultResp) => (
                <div key={team.teamId} className="p-3 rounded-xl bg-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar icon={<TrophyOutlined />} />
                      <div className="text-left">
                        <Text strong>Team {team.teamId}</Text>
                        <Text type="secondary" className="block text-sm">Tổng điểm: {team.totalScore}</Text>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text strong className="text-lg text-sky-600">{team.totalScore}</Text>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {team.participants.map((p: BattleParticipantResp) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-white">
                        <Avatar src={p.avatarUrl || undefined} icon={<UserOutlined />} />
                        <div className="flex-1 text-left">
                          <Text strong>{p.userName || `User #${p.userId}`}</Text>
                          <Text type="secondary" className="block text-xs">Team {p.teamId}</Text>
                        </div>
                        <div className="text-right">
                          <Text strong className="text-lg text-sky-600">{p.score}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              /* Individual leaderboard */
              sortedParticipants.map((p, index) => (
                <div 
                  key={p.id} 
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    p.userId === user?.id 
                      ? 'bg-sky-50 border-2 border-sky-500' 
                      : 'bg-white/50 hover:bg-white'
                  } ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <Avatar 
                    size={48} 
                    src={p.avatarUrl || undefined} 
                    icon={<UserOutlined />}
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <Text strong className="text-base">{p.userName || `User #${p.userId}`}</Text>
                      {p.userId === user?.id && <Tag color="blue" className="text-xs">Bạn</Tag>}
                      {index === 0 && <Tag color="gold" className="text-xs">👑 Vô địch</Tag>}
                      {p.isSuspicious && <Tag color="red" className="text-xs"><WarningOutlined /> Khả nghi</Tag>}
                    </div>
                    {p.isCompleted && (
                      <Text type="secondary" className="text-xs">Đã hoàn thành</Text>
                    )}
                  </div>
                  <div className="text-right">
                    <Text strong className="text-2xl text-sky-600">{p.score}</Text>
                    <Text type="secondary" className="block text-xs">điểm</Text>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Button 
              type="primary" 
              icon={<HomeOutlined />} 
              size="large"
              onClick={() => router.push('/')}
              className="!bg-gradient-to-r !from-sky-500 !to-blue-600 !border-0"
            >
              Về trang chủ
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              size="large"
              onClick={() => router.push('/battle')}
            >
              Chơi lại
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
