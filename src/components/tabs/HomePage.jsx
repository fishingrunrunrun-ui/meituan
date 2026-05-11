import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

const PET_MOODS = {
  active: { emoji: '😊', text: '今天也要一起加油哦！' },
  lazy: { emoji: '😴', text: '主人昨天偷懒了...' },
  urge: { emoji: '😢', text: '快带我去打倒怪物叭！' },
};

const SPORT_LABEL = { '步行': '户外步行', '跑步': '户外跑步', '骑行': '户外骑行', '球类': '球类运动', '健身': '健身训练', '游泳': '游泳', '格斗': '格斗训练', '舞蹈': '舞蹈' };

const ALL_SPORTS = [
  { key: '步行', icon: '🚶', label: '户外步行', unit: 'km' },
  { key: '跑步', icon: '🏃', label: '户外跑步', unit: 'km' },
  { key: '骑行', icon: '🚴', label: '户外骑行', unit: 'km' },
  { key: '球类', icon: '⚽', label: '球类运动', unit: '分钟' },
  { key: '健身', icon: '🏋️', label: '健身训练', unit: '分钟' },
  { key: '游泳', icon: '🏊', label: '游泳', unit: 'km' },
  { key: '格斗', icon: '🥊', label: '格斗训练', unit: '分钟' },
  { key: '舞蹈', icon: '💃', label: '舞蹈', unit: '分钟' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { equippedPet, consecutiveDays, records, plan } = useApp();
  const [editingTarget, setEditingTarget] = useState(false);
  const [showMonth, setShowMonth] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const todayChecked = records.some(r => {
    if (!r.startTime?.startsWith(todayStr)) return false;
    return plan?.categories?.includes(r.type) && (r.value || 0) >= (plan?.dailyTarget || 0);
  });

  let mood = PET_MOODS.active;
  if (consecutiveDays >= 3 && !todayChecked) mood = PET_MOODS.urge;
  else if (!todayChecked) mood = PET_MOODS.lazy;

  // 7-day week (Mon-Sun)
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const ds = d.toISOString().split('T')[0];
    const checked = records.some(r => {
      if (!r.startTime?.startsWith(ds)) return false;
      return plan?.categories?.includes(r.type) && (r.value || 0) >= (plan?.dailyTarget || 0);
    });
    weekDays.push({
      date: ds,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      dayName: ['日','一','二','三','四','五','六'][d.getDay()],
      checked,
      isToday: ds === todayStr,
    });
  }

  const getStreakText = () => {
    if (todayChecked) return '今日已打卡 ✓';
    if (consecutiveDays > 0) return '即将连胜';
    return '开始你的第一次打卡吧';
  };

  const sportKey = plan?.categories?.[0] || '步行';
  const sportName = SPORT_LABEL[sportKey] || sportKey || '自由运动';
  const targetDisplay = plan?.dailyTarget ? `${plan.dailyTarget}${plan.targetUnit || 'km'}` : '未设定';

  const speciesEmoji = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };

  return (
    <div className="tab-page">
      <div className="tab-content">

        {/* ===== Pet Card ===== */}
        <div className="section-card highlight" onClick={() => navigate('/pet')} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 10 }}>
            {equippedPet ? speciesEmoji[equippedPet.species] || '🐾' : '🥚'}
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 10,
            color: '#8B7355',
            marginBottom: 10,
          }}>
            {equippedPet ? `${equippedPet.species} · ${equippedPet.name} Lv.${equippedPet.level}` : '还没有宠物'}
          </div>
          <div style={{
            display: 'inline-block',
            background: '#FFF8E7',
            border: '3px solid #D0C0B0',
            borderRadius: 8,
            padding: '10px 18px',
            fontFamily: 'var(--font-pixel)',
            fontSize: 12,
            color: '#3E2723',
          }}>
            💬 快带我去打倒怪物叭
          </div>
        </div>

        {/* ===== Check-in Card ===== */}
        <div style={{
          background: '#FFFAF0',
          borderRadius: 12,
          border: '3px solid #DDD0C0',
          padding: '20px 16px 16px',
          marginBottom: 14,
          boxShadow: '0 2px 6px rgba(107,58,46,0.06)',
        }}>
          {/* Title row + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18 }}>🏃</span>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#3E2723' }}>
                {sportName} · 每次{targetDisplay}
              </span>
            </div>
            <div style={{ display: 'flex', border: '3px solid #8B7355', borderRadius: 6, overflow: 'hidden' }}>
              <button
                onClick={() => setShowMonth(false)}
                style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 10,
                  padding: '7px 12px', border: 'none', cursor: 'pointer',
                  background: !showMonth ? '#8B7355' : '#FFFAF0',
                  color: !showMonth ? '#FFF' : '#8B7355',
                }}
              >
                近7天
              </button>
              <button
                onClick={() => setShowMonth(true)}
                style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 10,
                  padding: '7px 12px', border: 'none', borderLeft: '3px solid #8B7355', cursor: 'pointer',
                  background: showMonth ? '#8B7355' : '#FFFAF0',
                  color: showMonth ? '#FFF' : '#8B7355',
                }}
              >
                月视图
              </button>
            </div>
          </div>

          {/* Flame + streak number */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 28, marginRight: 8 }}>🔥</span>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 44, color: '#E0745C', lineHeight: 1 }}>
              {consecutiveDays}
            </span>
          </div>

          {!showMonth ? (
            <>
              {/* 7-day node progress */}
              <div style={{ position: 'relative', padding: '0 12px', marginBottom: 8 }}>
                <div style={{ position: 'absolute', top: 17, left: 38, right: 38, height: 3, background: '#E8E0D5', borderRadius: 2 }} />
                {weekDays.map((d, i) => {
                  if (i < 6 && d.checked && weekDays[i + 1].checked) {
                    return (
                      <div key={i} style={{ position: 'absolute', top: 17, zIndex: 1,
                        left: `calc(38px + (100% - 76px) * ${i / 6})`,
                        width: `calc((100% - 76px) / 6)`, height: 3,
                        background: '#F4BFBF', borderRadius: 2 }} />
                    );
                  }
                  return null;
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                  {weekDays.map((d, i) => (
                    <div key={i} style={{
                      width: 34, height: 34, borderRadius: '50%',
                      border: d.checked ? '3px solid #E8A0A0' : '3px solid #D0C0B0',
                      background: d.checked ? '#F4BFBF' : '#FFFAF0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: d.isToday ? '0 0 0 3px rgba(107,58,46,0.18)' : 'none',
                    }}>
                      {d.checked && <span style={{ fontSize: 16, color: '#8B3A3A' }}>✓</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0 0', marginBottom: 18 }}>
                {weekDays.map((d, i) => (
                  <div key={i} style={{ width: 34, textAlign: 'center', fontFamily: 'var(--font-pixel)', fontSize: 9, color: d.isToday ? '#6B3A2E' : '#B0A090' }}>
                    {d.label}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <MonthCalendar records={records} plan={plan} />
            </div>
          )}

          {/* Bottom status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: todayChecked ? '#6B8E4A' : '#A09080' }}>
              {getStreakText()}
            </span>
            <button
              onClick={() => setEditingTarget(true)}
              style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#A09080', padding: 4 }}
            >
              ✏️
            </button>
          </div>
        </div>

        {/* ===== Edit Modal ===== */}
        {editingTarget && <EditTargetModal plan={plan} onClose={() => setEditingTarget(false)} />}

        {/* ===== Quick Record ===== */}
        <div className="section-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>
            {equippedPet ? speciesEmoji[equippedPet.species] || '🐾' : '🐾'}
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#3E2723', marginBottom: 16 }}>
            快来运动吧！
          </div>
          <button className="pixel-btn primary" style={{ width: '100%', fontSize: 13, padding: 14 }} onClick={() => navigate('/record')}>
            开始记录
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTargetModal({ plan, onClose }) {
  const [sportKey, setSportKey] = useState(plan?.categories?.[0] || '步行');
  const [target, setTarget] = useState(String(plan?.dailyTarget || ''));
  const [frequency, setFrequency] = useState(plan?.frequency || '每天');
  const frequencies = ['每天', '每周1次', '每周3次', '每周5次'];
  const currentSport = ALL_SPORTS.find(s => s.key === sportKey);

  const handleSave = () => {
    const fbPlan = JSON.parse(localStorage.getItem('fb_plan') || '{}');
    fbPlan.categories = [sportKey];
    fbPlan.dailyTarget = parseFloat(target) || 0;
    fbPlan.targetUnit = currentSport?.unit || 'km';
    fbPlan.frequency = frequency;
    localStorage.setItem('fb_plan', JSON.stringify(fbPlan));
    window.location.reload();
  };

  return (
    <div className="shop-overlay" onClick={onClose}>
      <div className="shop-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '85%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#6B3A2E' }}>编辑目标</span>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-pixel)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div className="step-section">
          <div className="step-label">运动类型</div>
          <div className="sport-type-grid">
            {ALL_SPORTS.map(s => (
              <div key={s.key} className={`sport-card ${sportKey === s.key ? 'selected' : ''}`} onClick={() => setSportKey(s.key)}>
                <span className="sport-card-icon">{s.icon}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div className="step-section">
          <div className="step-label">每次目标 ({currentSport?.unit || 'km'})</div>
          <input className="pixel-input" type="number" value={target} onChange={e => setTarget(e.target.value)} min={0} />
        </div>

        <div className="step-section">
          <div className="step-label">运动频次</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {frequencies.map(f => (
              <button key={f} className={`freq-btn ${frequency === f ? 'selected' : ''}`} onClick={() => setFrequency(f)} style={{ fontSize: 10 }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <button className="pixel-btn primary" style={{ width: '100%', marginTop: 16, fontSize: 13 }} onClick={handleSave}>保存</button>
      </div>
    </div>
  );
}

function MonthCalendar({ records, plan }) {
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);

  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  // Build heatmap data: for each day, check if user completed their plan
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayRecords = records.filter(r => r.startTime?.startsWith(ds));
    const checked = dayRecords.some(r =>
      plan?.categories?.includes(r.type) && (r.value || 0) >= (plan?.dailyTarget || 0)
    );
    days.push({ day: d, checked, isToday: ds === todayStr });
  }

  const prev = () => {
    if (calMonth === 1) { setCalYear(calYear - 1); setCalMonth(12); }
    else setCalMonth(calMonth - 1);
  };
  const next = () => {
    if (calMonth === 12) { setCalYear(calYear + 1); setCalMonth(1); }
    else setCalMonth(calMonth + 1);
  };

  const checkedCount = days.filter(d => d.checked).length;

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={prev} style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}>◀</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#6B3A2E' }}>
            {calYear}年{calMonth}月
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#A09080', marginTop: 2 }}>
            打卡 {checkedCount}/{daysInMonth} 天
          </div>
        </div>
        <button onClick={next} style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}>▶</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {['日','一','二','三','四','五','六'].map((w, i) => (
          <div key={w} style={{
            fontFamily: 'var(--font-pixel)', fontSize: 9,
            color: i === 0 || i === 6 ? '#C0A0A0' : '#A09080',
            textAlign: 'center', padding: '2px 0',
          }}>{w}</div>
        ))}
      </div>

      {/* Calendar heatmap grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={'pad'+i} style={{ aspectRatio: '1' }} />
        ))}
        {/* Day cells */}
        {days.map(d => (
          <div key={d.day} title={`${calMonth}/${d.day}${d.checked ? ' ✓已打卡' : ''}`} style={{
            aspectRatio: '1',
            borderRadius: 6,
            border: d.isToday ? '3px solid #6B3A2E' : '2px solid transparent',
            background: d.checked ? '#F4BFBF' : '#F0EBE3',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'default',
            transition: 'all 0.15s',
            boxShadow: d.checked ? 'inset 0 0 0 1px rgba(200,150,150,0.3)' : 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: 11,
              color: d.checked ? '#8B3A3A' : d.isToday ? '#6B3A2E' : '#B0A090',
              fontWeight: d.isToday ? 'bold' : 'normal',
              lineHeight: 1,
            }}>
              {d.day}
            </span>
            {d.checked && (
              <span style={{ fontSize: 8, lineHeight: 1, marginTop: 1 }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#F4BFBF', border: '1px solid #D09090' }} />
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#A09080' }}>已打卡</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: '#F0EBE3', border: '1px solid #DDD0C0' }} />
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#A09080' }}>未打卡</span>
        </div>
      </div>
    </div>
  );
}
