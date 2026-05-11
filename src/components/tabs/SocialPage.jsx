import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const SPECIES_EMOJI = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };

export default function SocialPage() {
  const navigate = useNavigate();
  const { posts, user, friends, allUsers, allPets, records, sendFriendRequest, toggleLike, addComment } = useApp();
  const [filter, setFilter] = useState('all');
  const [showAddFriend, setShowAddFriend] = useState(false);

  const friendIds = friends
    .filter(f => f.status === 'accepted' && (f.fromUserId === user?.id || f.toUserId === user?.id))
    .map(f => f.fromUserId === user?.id ? f.toUserId : f.fromUserId);

  const friendUsers = allUsers.filter(u => friendIds.includes(u.id));

  let visiblePosts = posts;
  if (filter === 'friends') {
    visiblePosts = posts.filter(p => p.userId === user?.id || friendIds.includes(p.userId));
  }

  return (
    <div className="tab-page" style={{ position: 'relative' }}>
      <div className="tab-content">

        {/* ===== Friends Section ===== */}
        <div className="section-card" style={{ padding: '14px 14px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>好友打卡</div>
            <button className="pixel-btn secondary" style={{ fontSize: 10, padding: '6px 12px' }} onClick={() => setShowAddFriend(true)}>
              ＋ 添加好友
            </button>
          </div>

          {friendUsers.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#A09080', textAlign: 'center', padding: 18 }}>
              还没有好友，去添加吧！
            </div>
          ) : (
            <div className="friend-strip">
              {friendUsers.map(fu => {
                const fp = allPets.find(p => p.ownerId === fu.id && p.isEquipped);
                const last5 = Array.from({ length: 5 }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() - (4 - i));
                  return records.some(r => r.userId === fu.id && r.startTime?.startsWith(d.toISOString().split('T')[0]));
                });
                return (
                  <div key={fu.id} className="friend-chip" onClick={() => navigate(`/chat/${fu.id}`)}>
                    <span className="friend-chip-avatar">
                      {fp ? SPECIES_EMOJI[fp.species] || '🐾' : '👤'}
                    </span>
                    <span className="friend-chip-name">{fu.nickname}</span>
                    <div className="friend-chip-dots">
                      {last5.map((ok, i) => (
                        <div key={i} className={`friend-chip-dot ${ok ? 'filled' : 'empty'}`} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Filter + Feed ===== */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {[
            { key: 'all', label: '全部动态' },
            { key: 'friends', label: '好友动态' },
          ].map(f => (
            <button
              key={f.key}
              className={`freq-btn ${filter === f.key ? 'selected' : ''}`}
              onClick={() => setFilter(f.key)}
              style={{ fontSize: 11, padding: '8px 16px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ===== Feed ===== */}
        {visiblePosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">还没有动态，<br />发第一条帖子吧！</div>
          </div>
        ) : (
          visiblePosts.map(post => {
            const author = allUsers.find(u => u.id === post.userId);
            const liked = post.likes?.includes(user?.id);
            return (
              <div key={post.id} className="feed-card">
                <div className="feed-header">
                  <div className="feed-avatar">👤</div>
                  <div>
                    <div className="feed-nickname">{author?.nickname || '未知用户'}</div>
                    <div className="feed-time">{new Date(post.createdAt).toLocaleDateString('zh-CN')}</div>
                  </div>
                </div>
                <div className="feed-text">{post.text}</div>
                <div className="feed-actions">
                  <button className="feed-action-btn" onClick={() => toggleLike(post.id)} style={{ color: liked ? '#E0745C' : '#8B7355' }}>
                    {liked ? '❤️' : '🤍'} {post.likes?.length || 0} 赞
                  </button>
                  <button className="feed-action-btn" onClick={() => {
                    const text = prompt('输入评论：');
                    if (text?.trim()) addComment(post.id, text.trim());
                  }}>
                    💬 {post.comments?.length || 0} 评论
                  </button>
                </div>
                {post.comments?.length > 0 && (
                  <div style={{ padding: '8px 14px 12px', borderTop: '2px solid #E8E0D5' }}>
                    {post.comments.slice(-3).map((c, i) => {
                      const cu = allUsers.find(u => u.id === c.userId);
                      return (
                        <div key={i} style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#3E2723', marginBottom: 3, lineHeight: 1.6 }}>
                          <strong>{cu?.nickname || '?'}</strong>: {c.text}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/create-post')}>＋</button>

      {showAddFriend && <AddFriendModal onClose={() => setShowAddFriend(false)} />}
    </div>
  );
}

function AddFriendModal({ onClose }) {
  const { allUsers, user, sendFriendRequest } = useApp();
  const [school, setSchool] = useState('');
  const [nickname, setNickname] = useState('');
  const [result, setResult] = useState('');

  const handleSearch = () => {
    const found = allUsers.find(u =>
      u.id !== user?.id &&
      u.school?.includes(school.trim()) &&
      u.nickname?.includes(nickname.trim())
    );
    if (!found) { setResult('未找到该用户'); return; }
    const ok = sendFriendRequest(found.id);
    setResult(ok ? `已向 ${found.nickname} 发送申请` : '已发送过申请');
  };

  return (
    <div className="shop-overlay" onClick={onClose}>
      <div className="shop-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#6B3A2E' }}>添加好友</span>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-pixel)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <input className="pixel-input" placeholder="学校名称" value={school} onChange={e => setSchool(e.target.value)} style={{ marginBottom: 10 }} />
        <input className="pixel-input" placeholder="对方昵称" value={nickname} onChange={e => setNickname(e.target.value)} style={{ marginBottom: 10 }} />
        <button className="pixel-btn primary" style={{ width: '100%', marginBottom: 8, fontSize: 12 }} onClick={handleSearch}>发送申请</button>
        {result && <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#6B3A2E', textAlign: 'center', marginTop: 6 }}>{result}</div>}
      </div>
    </div>
  );
}
