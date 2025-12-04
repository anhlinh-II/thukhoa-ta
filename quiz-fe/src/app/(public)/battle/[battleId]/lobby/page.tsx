"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Typography, Avatar, Button, Tag, Spin, message } from "antd";
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined, FullscreenOutlined, BgColorsOutlined } from "@ant-design/icons";
import { useBattleWebSocket } from "@/share/hooks/useBattleWebSocket";
import { useAccount } from "@/share/hooks/useAuth";
import { BattleStatus, BattleParticipant } from "@/share/services/battle.types";
import { battleService } from "@/share/services/battle.service";

const { Title, Text } = Typography;

export default function BattleWaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const battleId = parseInt(params.battleId as string);
  const { data: user } = useAccount();
  const [battle, setBattle] = useState<any>(null);
  const [initialParticipants, setInitialParticipants] = useState<BattleParticipant[]>([]);
  const [quizTitle, setQuizTitle] = useState<string | null>(null);
  
  const { connected, battleState, setReady, sendEmote, lastEmote } = useBattleWebSocket(
    battleId,
    user?.id || 0
  );

  const [recentEmotes, setRecentEmotes] = useState<Record<number, any>>({});

  const EMOTE_ICONS: Record<string, string> = {
    taunt: '🔥',
    cheer: '👏',
    tease: '😏',
    love: '💘',
  };

  useEffect(() => {
    if (!lastEmote) return;
    const from = lastEmote.fromUserId;
    if (!from) return;
    // show emote on sender's card
    setRecentEmotes(prev => ({ ...prev, [from]: lastEmote }));
    // remove after 3 seconds
    const t = setTimeout(() => {
      setRecentEmotes(prev => {
        const copy = { ...prev };
        delete copy[from];
        return copy;
      });
    }, 3000);
    return () => clearTimeout(t);
  }, [lastEmote]);

  useEffect(() => {
    // Fetch battle details and participants on page load/refresh
    let mounted = true;
    (async () => {
      if (!user) return;
      if (!params?.battleId) return;
      const numeric = Number(params.battleId);
      if (Number.isNaN(numeric)) return;
      try {
        const battleData = await battleService.getBattle(battleId);
        const participants = await battleService.getParticipants(battleId);
        if (mounted) {
          setBattle(battleData);
          setInitialParticipants(participants);
          // Use quizName from battle if available, otherwise fetch from preview
          if (battleData.quizName) {
            setQuizTitle(battleData.quizName);
          } else if (battleData.quizId) {
            try {
              const preview = await battleService.getQuizPreview(battleData.quizId);
              const title = preview?.examName || preview?.title || preview?.name || null;
              if (title) setQuizTitle(title);
            } catch (err) {
              // ignore quiz preview errors
            }
          }
        }
      } catch (e: any) { 
        if (!mounted) return;
        console.error('Failed to fetch battle', e);
      }
    })();
    return () => { mounted = false; };
  }, [battleId, user]);

  // Remove participant on unmount, or disband if leader
  React.useEffect(() => {
    return () => {
      if (!user) return;
      try {
        const isLeader = battleState?.leaderId && battleState.leaderId === user.id;
        const isWaiting = battleState?.status === BattleStatus.WAITING;
        
        if (isLeader && isWaiting) {
          // Leader leaving: disband the battle
          const url = `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1')}/battles/${battleId}/disband`;
          const payload = JSON.stringify({ userId: user.id });
          if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
            try {
              navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
            } catch (e) {
              fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
            }
          } else {
            fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
          }
        } else if (isWaiting) {
          // Non-leader leaving: remove participant
          const url = `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1')}/battles/${battleId}/participants/${user.id}`;
          if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
            fetch(url, { method: 'DELETE', keepalive: true });
          } else {
            fetch(url, { method: 'DELETE' });
          }
        }
      } catch (e) {
        // ignore errors during unload
      }
    };
  }, [battleState, user, battleId]);

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (battleState?.status === BattleStatus.IN_PROGRESS) {
      router.push(`/battle/${battleId}/quiz`);
    }
    if (battleState?.status === BattleStatus.CANCELLED) {
      message.warning('Battle đã bị hủy bởi người tạo');
      router.push('/');
    }
  }, [battleState?.status, battleId, router]);

  const handleReady = () => {
    setReady(true);
    message.success('Bạn đã sẵn sàng!');
  };

  // Use WebSocket state if available, otherwise fall back to initial fetch
  const displayParticipants = battleState?.participants && battleState.participants.length > 0 
    ? battleState.participants 
    : initialParticipants;

  const currentParticipant = displayParticipants.find(p => p.userId === user?.id);
  const allReady = displayParticipants.every(p => p.isReady) || false;

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <Text className="block mt-4">Đang kết nối...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4f1f4] via-[#a8dfe8] to-[#9ed5dd] py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* In-page header with player info and game rules */}
        <Card className="shadow-xl rounded-2xl border-0 p-6 bg-gradient-to-br from-teal-200 to-cyan-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title level={3} className="!mb-1 !text-gray-800">{user?.username || user?.email?.split('@')[0] || 'linh'}</Title>
              <Text className="text-gray-700 font-medium">Luật chơi & Cách tính điểm</Text>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white/50 rounded-md shadow-sm hover:bg-white transition">
                <BgColorsOutlined className="text-gray-700" />
              </button>
              <div className="px-3 py-1 bg-white/70 rounded-full shadow-sm text-sm font-bold text-gray-800">{battle?.inviteCode || `#${battleId}`}</div>
              <button
                onClick={() => {
                  try { document.documentElement.requestFullscreen(); } catch (e) {}
                }}
                className="p-2 bg-white/50 rounded-md shadow-sm hover:bg-white transition"
                title="Phóng to"
              >
                <FullscreenOutlined className="text-gray-700" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-lime-300 to-green-400 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🎯</div>
              <Text strong className="text-sm text-gray-800">Trả lời nhanh</Text>
              <div className="text-xs text-gray-700 mt-1">Trả lời đúng càng nhanh điểm càng cao</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-300 to-teal-400 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">⚡</div>
              <Text strong className="text-sm text-gray-800">Combo điểm</Text>
              <div className="text-xs text-gray-700 mt-1">Liên tiếp đúng để nhân điểm</div>
            </div>
            <div className="bg-gradient-to-br from-purple-300 to-indigo-400 rounded-xl p-4 shadow-sm">
              <div className="text-2xl mb-2">🏆</div>
              <Text strong className="text-sm text-gray-800">Chiến thắng</Text>
              <div className="text-xs text-gray-700 mt-1">Người có điểm cao nhất thắng cuộc</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300">
              <div className="text-2xl mb-2">🎊</div>
              <Text strong className="text-sm text-gray-800">Chúc may mắn!</Text>
              <div className="text-xs text-gray-700 mt-1">Hãy chiến thắng đối thủ</div>
            </div>
          </div>
        </Card>

        <Card className="shadow-xl rounded-2xl border-0 p-8 bg-white">
          <div className="text-center mb-6">
            <Title level={2} className="!mb-2">{quizTitle ?? (battle?.quizId ? `Quiz #${battle?.quizId}` : 'Battle')}</Title>
            <div className="text-sm text-gray-500">Waiting for the host to start...</div>
            <div className="mt-4 w-full flex items-center justify-center">
              {battle?.battleMode && (
                <Tag color="purple">{battle?.battleMode === 'SOLO_1V1' ? '1vs1' : battle?.battleMode === 'TEAM_2V2' ? '2v2' : battle?.battleMode}</Tag>
              )}
            </div>
          </div>

          {/* Countdown */}
          {allReady && countdown !== null && (
            <div className="text-center mb-6 p-4 bg-yellow-50 rounded-xl">
              <ClockCircleOutlined className="text-4xl text-yellow-500 mb-2" />
              <Title level={2} className="!mb-0 !text-yellow-600">{countdown}</Title>
              <Text>Bắt đầu sau...</Text>
            </div>
          )}

          {/* Participants / Center Avatar when alone */}
          {displayParticipants.length <= 1 ? (
            <div className="py-12 flex flex-col items-center">
              <div className="relative">
                {/* Cloud-shaped message bubble */}
                {recentEmotes[user?.id || 0] && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in">
                    <div className="relative bg-white rounded-3xl px-4 py-3 shadow-lg border border-gray-200 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{EMOTE_ICONS[recentEmotes[user?.id || 0].emoteKey] || '💬'}</span>
                        <span className="text-sm font-medium text-gray-700">{recentEmotes[user?.id || 0].label}</span>
                      </div>
                      {/* Cloud tail */}
                      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
                    </div>
                  </div>
                )}
                <div className="w-48 h-56 rounded-3xl bg-gradient-to-b from-gray-400 to-gray-500 flex flex-col items-center justify-center shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white text-xs px-3 py-1 rounded-full">
                    You
                  </div>
                  <Avatar size={160} src={user?.avatarUrl || undefined} icon={<UserOutlined />} />
                  <div className="absolute top-2 right-2 text-xl">✏️</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Text className="text-lg text-gray-700">You're the first to join!</Text>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {displayParticipants.map((participant) => (
                <div key={participant.id} className="relative flex flex-col items-center">
                  {/* Cloud-shaped message bubble */}
                  {recentEmotes[participant.userId] && (
                    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-20 animate-fade-in">
                      <div className="relative bg-white rounded-3xl px-4 py-3 shadow-lg border border-gray-200 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{EMOTE_ICONS[recentEmotes[participant.userId].emoteKey] || '💬'}</span>
                          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{recentEmotes[participant.userId].label}</span>
                        </div>
                        {/* Cloud tail */}
                        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
                      </div>
                    </div>
                  )}

                  <div className={`w-48 h-56 rounded-3xl ${participant.userId === user?.id ? 'bg-gradient-to-b from-gray-400 to-gray-500' : 'bg-white border-2 border-gray-200'} flex flex-col items-center justify-center shadow-lg relative transition-all`}>
                    <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${participant.userId === user?.id ? 'bg-gray-600' : 'bg-white border border-gray-300'} text-xs px-3 py-1 rounded-full ${participant.userId === user?.id ? 'text-white' : 'text-gray-700'}`}>
                      {participant.userId === user?.id ? 'You' : participant.userName || `User #${participant.userId}`}
                    </div>
                    {participant.userId === user?.id && (
                      <div className="absolute top-2 right-2 text-xl">✏️</div>
                    )}
                    <Avatar size={140} src={participant.avatarUrl || undefined} icon={<UserOutlined />} />
                    {participant.isReady ? (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <Tag color="green" className="!px-4 !py-1 !text-sm">Sẵn sàng</Tag>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <ClockCircleOutlined className="text-3xl text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Participant summary removed per design */}

          {/* Ready Button */}
          {!currentParticipant?.isReady && (
            <div className="mt-6">
              <Button
                type="primary"
                size="large"
                block
                onClick={handleReady}
                disabled={!connected}
                className="!bg-gradient-to-r !from-green-500 !to-emerald-600 !border-0 !h-12 !font-semibold"
              >
                {connected ? 'Sẵn sàng!' : 'Đang kết nối WebSocket...'}
              </Button>
            </div>
          )}
        </Card>
      </div>
      {/* Right-side emote icons */}
      <div className="fixed right-6 top-1/3 flex flex-col gap-3 z-40">
        {[
          { key: 'taunt', label: 'Mấy con gà biết gì!', icon: '🔥', bg: 'from-orange-400 to-red-400' },
          { key: 'cheer', label: 'Cố gắng hết sức nhé!', icon: '👏', bg: 'from-yellow-300 to-orange-300' },
          { key: 'tease', label: 'Xem thử!', icon: '😏', bg: 'from-pink-300 to-rose-400' },
          { key: 'love', label: 'Tha em đi', icon: '💘', bg: 'from-purple-400 to-pink-400' },
        ].map((em) => (
          <button
            key={em.key}
            onClick={() => {
              if (sendEmote) sendEmote(em.key, em.label);
            }}
            className={`w-14 h-14 bg-gradient-to-br ${em.bg} rounded-2xl shadow-lg flex items-center justify-center text-2xl hover:scale-110 transition-transform border-2 border-white`}
            title={em.label}
          >
            <span>{em.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
