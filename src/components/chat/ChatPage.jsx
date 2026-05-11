import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function ChatPage() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user, allUsers, messages, sendMessage } = useApp();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const friend = allUsers.find(u => u.id === friendId);
  const chatMsgs = messages.filter(m =>
    (m.fromUserId === user?.id && m.toUserId === friendId) ||
    (m.fromUserId === friendId && m.toUserId === user?.id)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(friendId, text.trim());
    setText('');
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button onClick={() => navigate('/social')} style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>←</button>
        <span style={{ fontSize: 24 }}>👤</span>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: '#3E2723' }}>{friend?.nickname || '好友'}</span>
      </div>
      <div className="chat-messages">
        {chatMsgs.length === 0 && (
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#A09080', marginTop: 40 }}>
            发送第一条消息吧！
          </div>
        )}
        {chatMsgs.map(m => (
          <div key={m.id} className={`chat-bubble ${m.fromUserId === user?.id ? 'mine' : 'theirs'}`}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="pixel-input"
          style={{ flex: 1 }}
          placeholder="输入消息..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="pixel-btn primary" style={{ fontSize: 10, padding: '8px 14px' }} onClick={handleSend}>
          发送
        </button>
      </div>
    </div>
  );
}
