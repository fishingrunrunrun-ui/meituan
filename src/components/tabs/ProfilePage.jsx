import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ProfilePage() {
  const { user, updateUser, getAchievements, consecutiveDays, friends, myPets, records, posts, allUsers, respondFriendRequest } = useApp();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const achievements = getAchievements();
  const pendingRequests = friends.filter(f => f.toUserId === user?.id && f.status === 'pending');

  if (!user) return null;

  const handleEdit = () => {
    setEditData({
      nickname: user?.nickname || '',
      heightCm: String(user?.heightCm || ''),
      weightKg: String(user?.weightKg || ''),
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateUser({
      nickname: editData.nickname,
      heightCm: parseFloat(editData.heightCm) || user?.heightCm,
      weightKg: parseFloat(editData.weightKg) || user?.weightKg,
    });
    setEditing(false);
  };

  const bmi = user.heightCm && user.weightKg
    ? (user.weightKg / ((user.heightCm / 100) ** 2)).toFixed(1)
    : null;

  return (
    <div className="tab-page">
      <div className="tab-content">

        {/* ===== Profile Card ===== */}
        <div className="section-card highlight" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>👤</div>

          {editing ? (
            <div style={{ marginTop: 8 }}>
              <input className="pixel-input" style={{ marginBottom: 8, textAlign: 'center' }} value={editData.nickname} onChange={e => setEditData(prev => ({ ...prev, nickname: e.target.value }))} maxLength={12} placeholder="昵称" />
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="pixel-input" type="number" placeholder="身高cm" value={editData.heightCm} onChange={e => setEditData(prev => ({ ...prev, heightCm: e.target.value }))} />
                <input className="pixel-input" type="number" placeholder="体重kg" value={editData.weightKg} onChange={e => setEditData(prev => ({ ...prev, weightKg: e.target.value }))} />
              </div>
              <button className="pixel-btn primary" style={{ marginTop: 10, width: '100%', fontSize: 12 }} onClick={handleSave}>保存</button>
              <button className="pixel-btn secondary" style={{ marginTop: 6, width: '100%', fontSize: 11 }} onClick={() => setEditing(false)}>取消</button>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: '#3E2723', marginTop: 10 }}>
                {user.nickname}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginTop: 4 }}>
                {user.school} · {user.gender === 'male' ? '男' : '女'} · {user.age}岁
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginTop: 3 }}>
                {user.heightCm}cm · {user.weightKg}kg · BMI {bmi || '-'}
              </div>
              <button className="pixel-btn secondary" style={{ marginTop: 10, fontSize: 10, padding: '8px 18px' }} onClick={handleEdit}>
                编辑资料
              </button>
            </>
          )}
        </div>

        {/* ===== Stats ===== */}
        <div className="section-card">
          <div className="section-title">运动数据</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {[
              { val: consecutiveDays, label: '连续打卡' },
              { val: records?.length || 0, label: '运动记录' },
              { val: myPets?.length || 0, label: '宠物数量' },
              { val: posts?.filter(p => p.userId === user.id).length || 0, label: '动态' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: '#6B3A2E' }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#8B7355', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Friend Requests ===== */}
        {pendingRequests.length > 0 && (
          <div className="section-card" style={{ borderColor: '#F4BFBF' }}>
            <div className="section-title" style={{ color: '#E0745C' }}>好友申请 ({pendingRequests.length})</div>
            {pendingRequests.map(req => {
              const fromUser = allUsers.find(u => u.id === req.fromUserId);
              return (
                <div key={req.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '2px solid #E8E0D5' }}>
                  <span style={{ fontSize: 28 }}>👤</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#3E2723', flex: 1 }}>{fromUser?.nickname || '?'}</span>
                  <button className="pixel-btn primary" style={{ fontSize: 10, padding: '6px 12px' }} onClick={() => respondFriendRequest(req.id, true)}>同意</button>
                  <button className="pixel-btn secondary" style={{ fontSize: 10, padding: '6px 12px' }} onClick={() => respondFriendRequest(req.id, false)}>拒绝</button>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Achievements ===== */}
        <div className="section-card">
          <div className="section-title">成就徽章</div>
          <div className="achievement-grid">
            {ALL_ACHIEVEMENTS.map(ach => {
              const unlocked = achievements.find(a => a.id === ach.id);
              return (
                <div key={ach.id} className={`achievement-item ${unlocked ? 'unlocked' : 'locked'}`}>
                  <span className="achievement-icon">{unlocked ? ach.icon : '🔒'}</span>
                  <div className="achievement-name">{ach.name}</div>
                  <div className="achievement-desc">{ach.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const ALL_ACHIEVEMENTS = [
  // 连续打卡
  { id: 'checkin_3',  icon: '🥾', name: '初出茅庐', desc: '连续打卡3天' },
  { id: 'checkin_7',  icon: '🗡️', name: '小有所成', desc: '连续打卡7天' },
  { id: 'checkin_30', icon: '🛡️', name: '持之以恒', desc: '连续打卡30天' },
  { id: 'checkin_100',icon: '👑', name: '健身达人', desc: '连续打卡100天' },
  // 宠物收集
  { id: 'pet_2',      icon: '🥚', name: '宠物新手', desc: '拥有2只宠物' },
  { id: 'pet_5',      icon: '🐉', name: '宠物爱好者', desc: '拥有5只宠物' },
  { id: 'pet_10',     icon: '💠', name: '宠物收藏家', desc: '拥有10只宠物' },
  // 怪物挑战
  { id: 'battle_1',   icon: '⚔️', name: '初战告捷', desc: '击败1只怪物' },
  { id: 'battle_20',  icon: '🪓', name: '战士', desc: '击败20只怪物' },
  { id: 'battle_50',  icon: '⚜️', name: '勇者', desc: '击败50只怪物' },
  { id: 'boss_10',    icon: '💀', name: '屠龙者', desc: '击败10只Boss' },
  // 宠物PK
  { id: 'pk_10',      icon: '🥊', name: '格斗家', desc: 'PK胜利10场' },
  { id: 'pk_50',      icon: '🏅', name: '竞技场之王', desc: 'PK胜利50场' },
  // 社交
  { id: 'friend_1',   icon: '🧭', name: '初识伙伴', desc: '添加1位好友' },
  { id: 'friend_10',  icon: '🌐', name: '社交达人', desc: '添加10位好友' },
  { id: 'post_5',     icon: '📜', name: '畅所欲言', desc: '发布5条帖子' },
  { id: 'likes_100',  icon: '💫', name: '人气之星', desc: '累计100赞' },
  { id: 'likes_500',  icon: '🔮', name: '社区红人', desc: '累计500赞' },
  // 野外探索
  { id: 'explore_10', icon: '🔍', name: '探险家', desc: '探索10次' },
  { id: 'explore_50', icon: '🧳', name: '荒野行者', desc: '探索50次' },
  { id: 'runaway_3',  icon: '🦮', name: '宠物救援者', desc: '救回3只离家宠物' },
  { id: 'runaway_10', icon: '🦸', name: '守护者', desc: '救回10只离家宠物' },
];
