"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Typography, Input, message, Space } from "antd";
import { TrophyOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { battleService } from "@/share/services/battle.service";
import { useAccount } from "@/share/hooks/useAuth";

const { Title, Text } = Typography;

export default function BattleChallengePage() {
     const router = useRouter();
     const { data: user } = useAccount();
     const [inviteCode, setInviteCode] = useState("");
     const [joining, setJoining] = useState(false);

     const handleJoinByCode = async () => {
          if (!user) {
               message.error("Vui lòng đăng nhập để tham gia battle");
               return;
          }

          if (!inviteCode || inviteCode.trim().length !== 6) {
               message.error("Vui lòng nhập mã mời hợp lệ (6 ký tự)");
               return;
          }

          try {
               setJoining(true);
               const resp: any = await battleService.joinBattleByCode(inviteCode.trim().toUpperCase(), {
                    userId: user.id,
                    ipAddress: undefined,
                    userAgent: navigator.userAgent,
               });

               // Backend uses ApiResponse with `code` and `result` fields
               if (resp && resp.code === 1000) {
                    const participant = resp.result;
                    // Backend now returns DTO with battleId field
                    if (participant?.battleId) {
                         message.success("Tham gia battle thành công!");
                         router.push(`/battle/${participant.battleId}/lobby`);
                         return;
                    }
                    message.error("Không thể tìm thấy thông tin battle");
                    return;
               }

               // If backend returned non-success code, show message
               const errMsg = resp?.message || "Mã mời không hợp lệ hoặc battle đã đầy";
               message.error(errMsg);
          } catch (error: any) {
               console.error("Join battle error:", error);
               message.error(error?.message || "Mã mời không hợp lệ hoặc battle đã đầy");
          } finally {
               setJoining(false);
          }
     };

     return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-16">
               <div className="max-w-2xl mx-auto px-6">
                    <div className="text-center mb-12">
                         <TrophyOutlined className="text-6xl text-yellow-500 mb-4" />
                         <Title level={1} className="!mb-2">
                              Battle Challenge
                         </Title>
                         <Text type="secondary" className="text-lg">
                              Nhập mã mời để tham gia phòng battle
                         </Text>
                    </div>

                    <Card className="shadow-2xl rounded-2xl border-0 overflow-hidden">
                         <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 -m-6 mb-6">
                              <ThunderboltOutlined className="text-white text-4xl mb-2" />
                              <Title level={3} className="!text-white !mb-1">
                                   Tham Gia Battle
                              </Title>
                              <Text className="text-white/90">
                                   Nhập mã mời 6 ký tự từ người tạo phòng
                              </Text>
                         </div>

                         <Space direction="vertical" size="large" className="w-full">
                              <div>
                                   <Text strong className="block mb-2">
                                        Mã Mời Battle
                                   </Text>
                                   <Input
                                        placeholder="Nhập mã 6 ký tự (VD: ABC123)"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        onPressEnter={handleJoinByCode}
                                        maxLength={6}
                                        size="large"
                                        className="text-center font-mono text-2xl tracking-widest"
                                        style={{ letterSpacing: "0.5em" }}
                                   />
                                   <Text type="secondary" className="text-xs block mt-1">
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
                                   className="!bg-gradient-to-r !from-purple-500 !to-pink-500 !border-0 !h-14 !font-semibold !text-lg"
                              >
                                   Tham Gia Battle
                              </Button>

                              <div className="pt-4 border-t">
                                   <Text type="secondary" className="text-sm">
                                        💡 <strong>Mẹo:</strong> Yêu cầu người tạo phòng chia sẻ mã mời với bạn. Mã mời chỉ có hiệu lực khi phòng đang ở trạng thái chờ.
                                   </Text>
                              </div>
                         </Space>
                    </Card>

                    <div className="text-center mt-8">
                         <Button type="link" onClick={() => router.push("/")}>
                              ← Quay lại trang chủ
                         </Button>
                    </div>
               </div>
          </div>
     );
}
