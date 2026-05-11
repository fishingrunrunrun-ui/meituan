import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const SPORT_TYPES = [
  { key: '户外步行', icon: '🚶', unit: 'km' },
  { key: '户外跑步', icon: '🏃', unit: 'km' },
  { key: '户外骑行', icon: '🚴', unit: 'km' },
  { key: '混合有氧', icon: '🏋️', unit: '分钟' },
];

const CARDIO_SUB = [
  { key: '球类运动', icon: '⚽' },
  { key: '健身训练', icon: '🏋️' },
  { key: '游泳', icon: '🏊' },
  { key: '格斗训练', icon: '🥊' },
  { key: '舞蹈', icon: '💃' },
];

const SPECIES_EMOJI = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };

export default function RecordPage() {
  const { equippedPet, addRecord } = useApp();
  const [sportType, setSportType] = useState(null);
  const [cardioSub, setCardioSub] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const timerRef = useRef(null);

  const isCardio = sportType === '混合有氧';
  const recordType = isCardio && cardioSub ? cardioSub : sportType;
  const unit = isCardio ? '分钟' : (SPORT_TYPES.find(s => s.key === sportType)?.unit || 'km');

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
        if (!isCardio) {
          setDistance(prev => prev + (Math.random() * 0.02 + 0.01));
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isCardio]);

  const handleStart = () => {
    if (!sportType) return;
    if (isCardio && !cardioSub) return;
    if (!isCardio) {
      navigator.geolocation?.getCurrentPosition(() => {}, () => {}, { enableHighAccuracy: true });
    }
    setIsRecording(true);
  };

  const handleStop = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);
    const value = isCardio ? elapsed / 60 : distance;
    const result = addRecord({
      type: recordType,
      startTime: new Date(Date.now() - elapsed * 1000).toISOString(),
      endTime: new Date().toISOString(),
      value: Math.round(value * 100) / 100,
      unit,
      durationMinutes: Math.round(elapsed / 6) / 10,
    });
    setElapsed(0);
    setDistance(0);
    if (result?.checked) {
      alert(`🎉 打卡成功！获得 +${result.bonus} 物资`);
    } else {
      alert('运动记录已保存');
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const selectSport = (key) => {
    if (isRecording) return;
    setSportType(key);
    if (key !== '混合有氧') setCardioSub(null);
  };

  return (
    <div className="tab-page" style={{ position: 'relative' }}>
      <div className="tab-content">

        {/* ===== Row 1: 4 Sport Type Cards ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
          {SPORT_TYPES.map(s => (
            <div
              key={s.key}
              onClick={() => selectSport(s.key)}
              style={{
                padding: '12px 6px',
                border: sportType === s.key ? '3px solid #6B3A2E' : '3px solid #D0C0B0',
                borderRadius: 10,
                background: sportType === s.key ? '#FFE4B5' : '#FFFAF0',
                textAlign: 'center',
                cursor: isRecording ? 'default' : 'pointer',
                transition: 'all 0.12s',
                opacity: isRecording ? 0.6 : 1,
                boxShadow: sportType === s.key ? '0 0 0 2px #6B3A2E' : '0 2px 4px rgba(107,58,46,0.05)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#3E2723' }}>
                {s.key}
              </div>
            </div>
          ))}
        </div>

        {/* ===== 混合有氧 Sub-types ===== */}
        {isCardio && sportType && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {CARDIO_SUB.map(sub => (
              <div
                key={sub.key}
                onClick={() => !isRecording && setCardioSub(sub.key)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  border: cardioSub === sub.key ? '3px solid #6B3A2E' : '3px solid #D0C0B0',
                  borderRadius: 8,
                  background: cardioSub === sub.key ? '#FFE4B5' : '#FFFAF0',
                  textAlign: 'center',
                  cursor: isRecording ? 'default' : 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 2 }}>{sub.icon}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#3E2723' }}>
                  {sub.key}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== Row 2: Map / Timer Area ===== */}
        <div style={{
          height: 260,
          borderRadius: 12,
          border: '3px solid #8B7355',
          background: isCardio
            ? 'linear-gradient(180deg, #FFF8E7 0%, #FFE4B5 100%)'
            : '#EDE5D8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          marginBottom: 14,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {!isCardio ? (
            <>
              {/* Map style background */}
              <div style={{ position: 'absolute', top: '25%', width: '120%', height: 2, background: 'rgba(139,115,85,0.1)', left: '-10%' }} />
              <div style={{ position: 'absolute', top: '50%', width: '120%', height: 2, background: 'rgba(139,115,85,0.1)', left: '-10%' }} />
              <div style={{ position: 'absolute', top: '75%', width: '120%', height: 2, background: 'rgba(139,115,85,0.1)', left: '-10%' }} />
              <div style={{ fontSize: 48, position: 'relative', zIndex: 1 }}>
                {equippedPet ? SPECIES_EMOJI[equippedPet.species] || '🐾' : '🐾'}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#A09080', marginTop: 4, zIndex: 1 }}>
                {isRecording ? '📍 GPS 路线记录中...' : '选择运动类型开始记录'}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: '#8B7355', marginBottom: 10 }}>
                {cardioSub ? `⏱️ ${cardioSub}` : '请选择混合有氧子类型'}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 52, color: '#6B3A2E', letterSpacing: 2 }}>
                {formatTime(elapsed)}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginTop: 6 }}>
                运动时长
              </div>
            </>
          )}

          {/* Recording overlay stats */}
          {isRecording && !isCardio && (
            <div style={{
              position: 'absolute', bottom: 14, left: 14, right: 14,
              background: 'rgba(255,250,240,0.95)', border: '2px solid #8B7355',
              borderRadius: 8, padding: '12px 16px',
              display: 'flex', justifyContent: 'space-around', textAlign: 'center',
              zIndex: 1,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: '#6B3A2E' }}>{formatTime(elapsed)}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginTop: 2 }}>时长</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 22, color: '#6B3A2E' }}>{distance.toFixed(2)}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginTop: 2 }}>{unit}</div>
              </div>
            </div>
          )}
        </div>

        {/* ===== Row 3: Action Buttons ===== */}
        {!isRecording ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="pixel-btn primary"
              style={{ flex: 2, fontSize: 13, padding: 14 }}
              onClick={handleStart}
              disabled={!sportType || (isCardio && !cardioSub)}
            >
              ▶ 开始运动
            </button>
            <button className="pixel-btn secondary" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowManual(true)}>
              ✏️ 手动录入
            </button>
          </div>
        ) : (
          <button className="pixel-btn primary" style={{ width: '100%', fontSize: 13, padding: 14, background: '#E0745C' }} onClick={handleStop}>
            ⏹ 结束运动
          </button>
        )}
      </div>

      {showManual && <ManualEntry onClose={() => setShowManual(false)} onSubmit={(r) => { addRecord(r); setShowManual(false); }} />}
    </div>
  );
}

function ManualEntry({ onClose, onSubmit }) {
  const [type, setType] = useState('户外步行');
  const [cardioSub, setCardioSub] = useState(null);
  const [value, setValue] = useState('');
  const [hours, setHours] = useState('0');
  const [mins, setMins] = useState('30');

  const isCardio = type === '混合有氧';
  const unit = isCardio ? '分钟' : (SPORT_TYPES.find(s => s.key === type)?.unit || 'km');
  const recordType = isCardio && cardioSub ? cardioSub : type;

  const handleSubmit = () => {
    if (isCardio && !cardioSub) return;
    const durationMin = parseInt(hours) * 60 + parseInt(mins);
    if (!value || durationMin <= 0) return;
    const endTime = new Date();
    const startTime = new Date(endTime - durationMin * 60000);
    onSubmit({ type: recordType, startTime: startTime.toISOString(), endTime: endTime.toISOString(), value: parseFloat(value), unit, durationMinutes: durationMin });
  };

  return (
    <div className="manual-entry-overlay">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, color: '#6B3A2E' }}>手动录入</span>
        <button onClick={onClose} style={{ fontFamily: 'var(--font-pixel)', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#8B7355' }}>✕</button>
      </div>

      {/* 4 main types */}
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#8B7355', marginBottom: 8 }}>运动类型</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 16 }}>
        {SPORT_TYPES.map(s => (
          <div key={s.key} onClick={() => { setType(s.key); if (s.key !== '混合有氧') setCardioSub(null); }} style={{
            padding: '10px 4px', border: type === s.key ? '3px solid #6B3A2E' : '3px solid #D0C0B0',
            borderRadius: 8, background: type === s.key ? '#FFE4B5' : '#FFFAF0',
            textAlign: 'center', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#3E2723' }}>{s.key}</div>
          </div>
        ))}
      </div>

      {/* 混合有氧 sub-types */}
      {isCardio && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355', marginBottom: 8 }}>选择具体运动</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {CARDIO_SUB.map(sub => (
              <div key={sub.key} onClick={() => setCardioSub(sub.key)} style={{
                flex: 1, padding: '10px 4px',
                border: cardioSub === sub.key ? '3px solid #6B3A2E' : '3px solid #D0C0B0',
                borderRadius: 8, background: cardioSub === sub.key ? '#FFE4B5' : '#FFFAF0',
                textAlign: 'center', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{sub.icon}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#3E2723' }}>{sub.key}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-section" style={{ marginBottom: 14 }}>
        <div className="step-label">达成数值 ({isCardio ? '分钟' : unit})</div>
        <input className="pixel-input" type="number" placeholder={isCardio ? '请输入分钟数' : `请输入${unit}数`} value={value} onChange={e => setValue(e.target.value)} min={0} />
      </div>

      <div className="step-section" style={{ marginBottom: 14 }}>
        <div className="step-label">运动时长</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="pixel-input" type="number" placeholder="时" value={hours} onChange={e => setHours(e.target.value)} min={0} style={{ width: 80 }} />
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11 }}>时</span>
          <input className="pixel-input" type="number" placeholder="分" value={mins} onChange={e => setMins(e.target.value)} min={0} max={59} style={{ width: 80 }} />
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11 }}>分</span>
        </div>
      </div>

      <button
        className="pixel-btn primary"
        style={{ width: '100%', fontSize: 13, padding: 14 }}
        onClick={handleSubmit}
        disabled={isCardio && !cardioSub}
      >
        提交
      </button>
    </div>
  );
}
