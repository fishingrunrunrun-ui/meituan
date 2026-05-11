import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { addPost } = useApp();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState('全部可见');

  const handleSubmit = () => {
    if (!text.trim()) return;
    addPost({ text: text.trim(), visibility });
    navigate('/social');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#FFF8E7', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={() => navigate('/social')} style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}>← 取消</button>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#6B3A2E' }}>发布动态</span>
        <button className="pixel-btn primary" style={{ fontSize: 10, padding: '6px 14px' }} onClick={handleSubmit} disabled={!text.trim()}>
          发布
        </button>
      </div>

      <textarea
        style={{
          flex: 1,
          fontFamily: 'var(--font-pixel)',
          fontSize: 11,
          padding: 12,
          background: '#FFFAF0',
          border: '3px solid #6B3A2E',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.8,
          color: '#3E2723',
        }}
        placeholder="分享你的运动故事..."
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={500}
      />

      <div style={{ marginTop: 12 }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginBottom: 8 }}>可见范围</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['全部可见', '全校可见', '好友可见', '仅自己可见'].map(v => (
            <button
              key={v}
              className={`freq-btn ${visibility === v ? 'selected' : ''}`}
              onClick={() => setVisibility(v)}
              style={{ fontSize: 9 }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
