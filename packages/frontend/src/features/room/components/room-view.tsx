import { useEffect, useReducer, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../../shared/hooks/use-websocket';
import type { ServerMessage } from '../../../shared/lib/types';
import { roomReducer, type RoomState, type RoomAction, type ParticipantState } from '../room-reducer';
import { CardSelector } from './card-selector';
import { ParticipantsList } from './participants-list';
import { VotingResult } from './voting-result';
import { HostControls } from './host-controls';
import { InviteLink } from './invite-link';

interface RoomViewProps {
  roomId: string;
  wsUrl: string;
  userName: string;
  mode: 'create' | 'join';
}

type RoomCreatedAction = Extract<ServerMessage, { type: 'roomCreated' }>;
type RoomJoinedAction = Extract<ServerMessage, { type: 'roomJoined' }>;

type ViewAction = RoomAction | RoomCreatedAction | RoomJoinedAction;

function viewReducer(state: RoomState, action: ViewAction): RoomState {
  if (action.type === 'roomCreated') {
    const participants = new Map<string, ParticipantState>();
    participants.set(action.you.connectionId, {
      connectionId: action.you.connectionId,
      userName: action.you.userName,
      hasVoted: false,
      vote: null,
    });
    return {
      ...state,
      roomId: action.roomId,
      status: 'voting',
      participants,
      myConnectionId: action.you.connectionId,
      myUserName: action.you.userName,
      isHost: action.you.isHost,
      average: null,
    };
  }
  if (action.type === 'roomJoined') {
    const participants = new Map<string, ParticipantState>();
    for (const p of action.participants) {
      participants.set(p.connectionId, {
        connectionId: p.connectionId,
        userName: p.userName,
        hasVoted: p.hasVoted,
        vote: null,
      });
    }
    // 自分自身も参加者に追加
    participants.set(action.you.connectionId, {
      connectionId: action.you.connectionId,
      userName: action.you.userName,
      hasVoted: false,
      vote: null,
    });
    return {
      ...state,
      roomId: action.roomId,
      status: action.status,
      participants,
      myConnectionId: action.you.connectionId,
      myUserName: action.you.userName,
      isHost: action.you.isHost,
      average: null,
    };
  }
  return roomReducer(state, action);
}

function createInitialState(roomId: string): RoomState {
  return {
    roomId,
    status: 'voting',
    participants: new Map<string, ParticipantState>(),
    myConnectionId: '',
    myUserName: '',
    isHost: false,
    average: null,
  };
}

export function RoomView({ roomId, wsUrl, userName, mode }: RoomViewProps) {
  const navigate = useNavigate();
  const { status: wsStatus, lastMessage, error: wsError, connect, send } = useWebSocket(wsUrl);
  const [state, dispatch] = useReducer(viewReducer, roomId, createInitialState);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  // roomCreated後のnavigate→useEffect再発火で二重送信されるのを防止
  const hasSentRef = useRef(false);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (wsStatus === 'connected' && !hasSentRef.current) {
      hasSentRef.current = true;
      if (mode === 'create') {
        send({ action: 'createRoom', userName });
      } else {
        send({ action: 'joinRoom', roomId, userName });
      }
    }
  }, [wsStatus, roomId, userName, send, mode]);

  useEffect(() => {
    if (!lastMessage) return;
    const msg = lastMessage as ServerMessage;
    switch (msg.type) {
      case 'roomCreated':
        dispatch(msg);
        // URL を実際のroomIdに置き換え
        navigate(`/room/${msg.roomId}`, { replace: true, state: { userName, mode: 'join' } });
        break;
      case 'roomJoined':
      case 'participantJoined':
      case 'participantLeft':
      case 'voteUpdate':
      case 'revealed':
        dispatch(msg);
        break;
      case 'reset':
        dispatch(msg);
        setSelectedCard(null);
        break;
      case 'error':
        dispatch(msg);
        break;
    }
  }, [lastMessage, navigate, userName]);

  const handleSelectCard = useCallback((value: string) => {
    setSelectedCard(value);
    send({ action: 'vote', cardValue: value });
  }, [send]);

  const handleReveal = useCallback(() => {
    send({ action: 'reveal' });
  }, [send]);

  const handleReset = useCallback(() => {
    send({ action: 'reset' });
    setSelectedCard(null);
  }, [send]);

  const participantsArray = Array.from(state.participants.values());

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">ルーム: {state.roomId}</h1>

      {state.roomId && <InviteLink roomId={state.roomId} />}

      {wsError !== null && (
        <div role="alert" className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700">
          接続エラーが発生しました
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">参加者</h2>
        <ParticipantsList
          participants={participantsArray}
          status={state.status}
          myConnectionId={state.myConnectionId}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">カード選択</h2>
        <CardSelector
          onSelect={handleSelectCard}
          disabled={state.status === 'revealed'}
          selectedCard={selectedCard}
        />
      </section>

      <section>
        <HostControls
          status={state.status}
          onReveal={handleReveal}
          onReset={handleReset}
        />
      </section>

      {state.status === 'revealed' && (
        <section>
          <h2 className="text-lg font-semibold mb-3">投票結果</h2>
          <VotingResult
            participants={participantsArray.map((p) => ({
              connectionId: p.connectionId,
              userName: p.userName,
              vote: p.vote,
            }))}
            average={state.average}
          />
        </section>
      )}
    </div>
  );
}
