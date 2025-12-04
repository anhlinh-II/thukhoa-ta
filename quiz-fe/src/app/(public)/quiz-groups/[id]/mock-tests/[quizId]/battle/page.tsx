"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Typography, Radio, Spin, Tag, Avatar, message } from "antd";
import { UserOutlined, TeamOutlined, TrophyOutlined, LoadingOutlined } from "@ant-design/icons";
import { battleService } from "@/share/services/battle.service";
import { BattleMode } from "@/share/services/battle.types";
import { useAccount } from "@/share/hooks/useAuth";

const { Title, Text } = Typography;

export default function BattleLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = parseInt(params.quizId as string);
  const { data: user } = useAccount();
  
  const [mode, setMode] = useState<BattleMode>(BattleMode.SOLO_1V1);
  const [creating, setCreating] = useState(false);
  const [waitingBattles, setWaitingBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitingBattles();
  }, [quizId]);

  const loadWaitingBattles = async () => {
    try {
      setLoading(true);
      const battles = await battleService.getWaitingBattles(quizId);
      setWaitingBattles(battles);
    } catch (error) {
      console.error('Failed to load battles', error);
      setWaitingBattles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để tạo battle');
      return;
    }

    try {
      setCreating(true);
      const battle = await battleService.createBattle({ quizId, battleMode: mode, leaderId: user.id });
      message.success('Tạo battle thành công!');
      router.push(`/battle/${battle.id}/lobby`);
    } catch (error: any) {
      console.log('error', error.message);
      message.error(error?.message || 'Không thể tạo battle');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinBattle = (battleId: number) => {
    router.push(`/battle/${battleId}/lobby`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">
            <TrophyOutlined className="mr-2 text-yellow-500" />
            Battle Mode
          </Title>
          <Text type="secondary">Thách đấu real-time với người chơi khác</Text>
        </div>

        {/* Create Battle Section */}
        <Card className="mb-6 shadow-md rounded-xl border-0">
          <Title level={4} className="!mb-4">Tạo Battle Mới</Title>
          
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="mb-4 flex gap-4"
          >
            <Radio.Button value={BattleMode.SOLO_1V1} className="flex-1 h-20 flex items-center justify-center">
              <div className="text-center">
                <UserOutlined className="text-2xl mb-1 block" />
                <div className="font-semibold">1 vs 1</div>
                <div className="text-xs text-gray-500">Solo Battle</div>
              </div>
            </Radio.Button>
            <Radio.Button value={BattleMode.TEAM_2V2} className="flex-1 h-20 flex items-center justify-center">
              <div className="text-center">
                <TeamOutlined className="text-2xl mb-1 block" />
                <div className="font-semibold">2 vs 2</div>
                <div className="text-xs text-gray-500">Team Battle</div>
              </div>
            </Radio.Button>
          </Radio.Group>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleCreateBattle}
            loading={creating}
            className="!bg-gradient-to-r !from-sky-500 !to-blue-600 !border-0 !h-12 !font-semibold"
          >
            Tạo Battle
          </Button>
        </Card>

        {/* Waiting Battles */}
        <div>
          <Title level={4} className="!mb-4">Các Battle Đang Chờ</Title>
          
          {loading ? (
            <div className="text-center py-12">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
          ) : waitingBattles.length === 0 ? (
            <Card className="text-center py-8 shadow-sm">
              <Text type="secondary">Chưa có battle nào đang chờ</Text>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waitingBattles.map((battle) => (
                <Card
                  key={battle.id}
                  hoverable
                  className="shadow-md rounded-xl border-0"
                  onClick={() => handleJoinBattle(battle.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Tag color={battle.battleMode === BattleMode.SOLO_1V1 ? 'blue' : 'purple'}>
                      {battle.battleMode === BattleMode.SOLO_1V1 ? '1v1' : '2v2'}
                    </Tag>
                    <Text type="secondary" className="text-xs">
                      ID: #{battle.id}
                    </Text>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar.Group maxCount={4}>
                      {/* Placeholder avatars */}
                      <Avatar icon={<UserOutlined />} />
                    </Avatar.Group>
                    <Text className="text-sm text-gray-600">
                      Đang chờ người chơi...
                    </Text>
                  </div>

                  <Button type="primary" size="small" block className="!mt-3">
                    Tham gia
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
