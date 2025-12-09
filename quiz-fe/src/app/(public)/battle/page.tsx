"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Typography, Input, Space } from "antd";
import messageService from '@/share/services/messageService';
import { TrophyOutlined, ThunderboltOutlined, RocketOutlined } from "@ant-design/icons";
import { battleService } from "@/share/services/battle.service";
import { useAccount } from "@/share/hooks/useAuth";

const { Title, Text } = Typography;

export default function BattleChallengePage() {
     const router = useRouter();
     const { data: user } = useAccount();
     const [inviteCode, setInviteCode] = useState("");
     const [joining, setJoining] = useState(false);
     const [isTransitioning, setIsTransitioning] = useState(false);

     const handleJoinByCode = async () => {
          if (!user) {
               messageService.error("Vui lòng đăng nhập để tham gia battle");
               return;
          }

          if (!inviteCode || inviteCode.trim().length !== 6) {
               messageService.error("Vui lòng nhập mã mời hợp lệ (6 ký tự)");
               return;
          }

          try {
               setJoining(true);
               const resp: any = await battleService.joinBattleByCode(inviteCode.trim().toUpperCase(), {
                    userId: user.id,
                    ipAddress: undefined,
                    userAgent: navigator.userAgent,
               });

               if (resp && resp.code === 1000) {
                    const participant = resp.result;
                    if (participant?.battleId) {
                         messageService.success("Tham gia battle thành công!");
                         setIsTransitioning(true);
                         setTimeout(() => {
                              router.push(`/battle/${participant.battleId}/lobby`);
                         }, 1500);
                         return;
                    }
                    messageService.error("Không thể tìm thấy thông tin battle");
                    return;
               }

               const errMsg = resp?.message || "Mã mời không hợp lệ hoặc battle đã đầy";
               messageService.error(errMsg);
          } catch (error: any) {
               console.error("Join battle error:", error);
               messageService.error(error?.message || "Mã mời không hợp lệ hoặc battle đã đầy");
          } finally {
               if (!isTransitioning) {
                    setJoining(false);
               }
          }
     };

     if (isTransitioning) {
          return (
               <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center z-50">
                    <div className="text-center">
                         <div className="relative">
                              <RocketOutlined 
                                   className="text-8xl text-white animate-bounce" 
                                   style={{ 
                                        animation: 'flyUp 1.5s ease-in-out forwards',
                                   }} 
                              />
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-white/30 rounded-full blur-sm animate-pulse" />
                         </div>
                         <Title level={2} className="!text-white !mt-8 !mb-2 animate-pulse">
                              Đang vào Battle...
                         </Title>
                         <Text className="text-white/80 text-lg">
                              Chuẩn bị sẵn sàng chiến đấu! 🎯
                         </Text>
                    </div>
                    <style jsx global>{`
                         @keyframes flyUp {
                              0% {
                                   transform: translateY(0) rotate(-45deg);
                                   opacity: 1;
                              }
                              100% {
                                   transform: translateY(-200px) rotate(-45deg);
                                   opacity: 0;
                              }
                         }
                    `}</style>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 flex items-center justify-center p-4">
               <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                         <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg shadow-blue-500/30">
                              <TrophyOutlined className="text-4xl !text-white" />
                         </div>
                         <Title level={2} className="!mb-1 !text-gray-800">
                              Battle Challenge
                         </Title>
                         <Text type="secondary">
                              Nhập mã mời để tham gia phòng battle
                         </Text>
                    </div>

                    <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
                         <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-5 -m-6 mb-6">
                              <div className="flex items-center gap-3">
                                   <ThunderboltOutlined className="!text-white text-3xl" />
                                   <div>
                                        <Title level={4} className="!text-white !mb-0">
                                             Tham Gia Battle
                                        </Title>
                                        <Text className="!text-white/80 text-sm">
                                             Nhập mã mời 6 ký tự từ người tạo phòng
                                        </Text>
                                   </div>
                              </div>
                         </div>

                         <Space direction="vertical" size="middle" className="w-full">
                              <div>
                                   <Text strong className="block mb-2 text-gray-700">
                                        Mã Mời Battle
                                   </Text>
                                   <Input
                                        placeholder="VD: ABC123"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        onPressEnter={handleJoinByCode}
                                        maxLength={6}
                                        size="large"
                                        className="text-center font-mono text-xl tracking-widest !h-14 !rounded-xl !border-2 focus:!border-blue-500"
                                        style={{ letterSpacing: "0.4em" }}
                                   />
                                   <Text type="secondary" className="text-xs block mt-2">
                                        Mã mời được cung cấp bởi người tạo phòng
                                   </Text>
                              </div>

                              <Button
                                   type="primary"
                                   size="large"
                                   block
                                   onClick={handleJoinByCode}
                                   loading={joining}
                                   disabled={!inviteCode || inviteCode.length !== 6}
                                   icon={<RocketOutlined />}
                                   className="!bg-gradient-to-r !from-blue-500 !to-cyan-500 !border-0 !h-12 !font-semibold !rounded-xl hover:!shadow-lg hover:!shadow-blue-500/30 transition-all"
                              >
                                   Tham Gia Battle
                              </Button>

                              <div className="pt-3 border-t border-gray-100">
                                   <Text type="secondary" className="text-xs">
                                        💡 <strong>Mẹo:</strong> Yêu cầu người tạo phòng chia sẻ mã mời. Mã chỉ có hiệu lực khi phòng đang chờ.
                                   </Text>
                              </div>
                         </Space>
                    </Card>

                    <div className="text-center mt-6">
                         <Button 
                              type="link" 
                              onClick={() => router.push("/")}
                              className="!text-blue-600 hover:!text-blue-700"
                         >
                              ← Quay lại trang chủ
                         </Button>
                    </div>
               </div>
          </div>
     );
}
