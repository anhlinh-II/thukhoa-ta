import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BattleState, BattleParticipant, SubmitAnswerRequest } from '../services/battle.types';

const WS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

export function useBattleWebSocket(battleId: number, userId: number) {
  const [connected, setConnected] = useState(false);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [leaderboard, setLeaderboard] = useState<BattleParticipant[]>([]);
  const [lastEmote, setLastEmote] = useState<any | null>(null);
  const clientRef = useRef<Client | null>(null);
  const [clientReady, setClientReady] = useState(false);

  // guard: do not attempt to connect if battleId is invalid
  if (!battleId || Number.isNaN(battleId)) {
    return {
      connected: false,
      battleState: null,
      leaderboard: [],
      setReady: () => {},
      submitAnswer: (_: Omit<SubmitAnswerRequest, 'battleId' | 'userId'>) => {},
      reportTabSwitch: () => {},
      completeBattle: () => {},
    } as const;
  }

  useEffect(() => {
    console.log('🔌 Creating WebSocket client for battle:', battleId);
    const socket = new SockJS(`${WS_URL}/ws/battle`);
    const client = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => console.log('[STOMP Debug]', str),
      onConnect: () => {
        console.log('✅ WebSocket CONNECTED for battle:', battleId);
        setConnected(true);
        setClientReady(true);
        
        // Subscribe to battle state
        client.subscribe(`/topic/battle/${battleId}/state`, (message) => {
          const state = JSON.parse(message.body) as BattleState;
          console.log('📥 Received battle state update:', state);
          setBattleState(state);
        });
        
        // Subscribe to leaderboard
        client.subscribe(`/topic/battle/${battleId}/leaderboard`, (message) => {
          const board = JSON.parse(message.body) as BattleParticipant[];
          console.log('📥 Received leaderboard update:', board);
          setLeaderboard(board);
        });
        // Subscribe to emotes
        client.subscribe(`/topic/battle/${battleId}/emote`, (message) => {
          try {
            const em = JSON.parse(message.body);
            console.log('📥 Received emote:', em);
            setLastEmote(em);
          } catch (e) {
            console.error('Failed to parse emote message', e);
          }
        });
      },
      onDisconnect: () => {
        console.log('❌ WebSocket DISCONNECTED for battle:', battleId);
        setConnected(false);
        setClientReady(false);
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      },
    });

    console.log('🔌 Activating WebSocket client for battle:', battleId);
    client.activate();
    clientRef.current = client;
    console.log('✅ Client assigned to ref:', clientRef.current);

    return () => {
      console.log('🔌 Deactivating WebSocket client for battle:', battleId);
      setClientReady(false);
      client.deactivate();
    };
  }, [battleId]);

  const setReady = useCallback((ready: boolean) => {
    const client = clientRef.current;
    console.log('setReady called:', { 
      ready, 
      userId, 
      battleId, 
      hasClient: !!client,
      clientActive: client?.active,
      clientConnected: client?.connected,
      clientState: client?.state
    });
    
    if (!client) {
      console.error('❌ clientRef.current is null/undefined!');
      return;
    }
    
    if (!client.active) {
      console.error('❌ WebSocket client is not active!');
      return;
    }
    
    if (!client.connected) {
      console.error('❌ WebSocket client not connected!');
      return;
    }
    
    console.log('✅ Publishing ready message to:', `/app/battle/${battleId}/ready`);
    try {
      client.publish({
        destination: `/app/battle/${battleId}/ready`,
        body: JSON.stringify({ userId, ready }),
      });
      console.log('✅ Message published successfully');
    } catch (error) {
      console.error('❌ Error publishing message:', error);
    }
  }, [battleId, userId]);

  const submitAnswer = useCallback((request: Omit<SubmitAnswerRequest, 'battleId' | 'userId'>) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/battle/answer',
        body: JSON.stringify({ ...request, battleId, userId }),
      });
    }
  }, [battleId, userId]);

  const sendEmote = useCallback((emoteKey: string, label?: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/battle/${battleId}/emote`,
        body: JSON.stringify({ emoteKey, label, fromUserId: userId, timestamp: Date.now() }),
      });
    }
  }, [battleId, userId]);

  const applyLocalScoreDelta = useCallback((delta: number) => {
    setLeaderboard(prev => prev.map(p => ({ ...p, score: p.userId === userId ? (Number(p.score || 0) + delta) : p.score })));
  }, [userId]);

  const reportTabSwitch = useCallback(() => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/battle/${battleId}/tab-switch`,
        body: JSON.stringify({ userId }),
      });
    }
  }, [battleId, userId]);

  const completeBattle = useCallback(() => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/battle/${battleId}/complete`,
        body: JSON.stringify({ userId }),
      });
    }
  }, [battleId, userId]);

  return {
    connected,
    battleState,
    leaderboard,
    lastEmote,
    setReady,
    submitAnswer,
    sendEmote,
    applyLocalScoreDelta,
    reportTabSwitch,
    completeBattle,
  };
}
