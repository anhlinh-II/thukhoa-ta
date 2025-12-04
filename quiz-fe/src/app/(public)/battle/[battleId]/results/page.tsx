"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Typography, Avatar, Tag } from "antd";
import { TrophyOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";
import { useBattleWebSocket } from "@/share/hooks/useBattleWebSocket";
import { useAccount } from "@/share/hooks/useAuth";
import { battleService, BattleResultResp, BattleParticipantResp, TeamResultResp } from "@/share/services/battle.service";

const { Title, Text } = Typography;

export default function BattleResultsPage() {
  const params = useParams();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <Card className="shadow-lg rounded-2xl border-0 text-center">
          <TrophyOutlined className="text-4xl text-yellow-500 mb-2" />
          <Title level={3}>Kết quả Battle</Title>
          <Text type="secondary">Battle ID: #{battleId}</Text>

          <div className="mt-6 space-y-3">
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
                        <Avatar icon={<UserOutlined />} />
                        <div className="flex-1 text-left">
                          <Text strong>User #{p.userId}</Text>
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
              /* Fallback: show individual leaderboard from results or websocket */
              (results && results.participants ? results.participants : leaderboard).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50">
                  <Avatar icon={<UserOutlined />} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <Text strong>User #{p.userId}</Text>
                      {p.isSuspicious && <Tag color="red">Khả nghi</Tag>}
                    </div>
                    <Text type="secondary" className="block text-sm">Team {p.teamId ?? '-'}</Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-lg text-sky-600">{p.score}</Text>
                    <Text type="secondary" className="block text-xs">điểm</Text>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
