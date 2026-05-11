import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const SPECIES_EMOJI = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };

export default function ExplorePage() {
  const navigate = useNavigate();
  const { user, updateUser, addPet, createPet, spendMaterials, allPets, todayStr } = useApp();
  const [phase, setPhase] = useState('idle'); // idle | exploring | found | caught | empty
  const [foundPet, setFoundPet] = useState(null);
  const [isRunaway, setIsRunaway] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  const used = user?.dailyExploreCount || 0;
  const remaining = 3 - used;

  const handleExplore = () => {
    if (remaining <= 0) return;
    if (!spendMaterials(5)) { alert('物资不足！需要5物资'); return; }
    updateUser({
      dailyExploreCount: (user?.dailyExploreCount || 0) + 1,
      totalExplores: (user?.totalExplores || 0) + 1,
    });
    setPhase('exploring');

    setTimeout(() => {
      const roll = Math.random();
      if (roll < 0.3) {
        // Empty
        setPhase('empty');
      } else if (roll < 0.7) {
        // New wild pet
        const species = ['炎龙', '蘑菇', '魔像'][Math.floor(Math.random() * 3)];
        setFoundPet({ species, isRunaway: false });
        setIsRunaway(false);
        setPhase('found');
      } else {
        // Runaway pet
        const runaways = allPets.filter(p => p.isRunaway && p.ownerId !== user?.id);
        if (runaways.length > 0) {
          const rp = runaways[Math.floor(Math.random() * runaways.length)];
          setFoundPet(rp);
          setIsRunaway(true);
          setPhase('found');
        } else {
          const species = ['炎龙', '蘑菇', '魔像'][Math.floor(Math.random() * 3)];
          setFoundPet({ species, isRunaway: false });
          setIsRunaway(false);
          setPhase('found');
        }
      }
    }, 1500);
  };

  const handleCapture = () => {
    const rate = isRunaway ? 0.5 : 0.7;
    const success = Math.random() < rate;
    setCaptureSuccess(success);
    setPhase('caught');

    if (success) {
      const name = isRunaway ? foundPet.name : foundPet.species;
      const species = foundPet.species;
      const pet = createPet(user.id, species, name);
      pet.isEquipped = false;
      if (isRunaway) pet.isRunaway = false;
      addPet(pet);
      if (isRunaway) {
        updateUser({ runawaysCaptured: (user?.runawaysCaptured || 0) + 1 });
      }
    }
  };

  return (
    <div className="explore-scene">
      {phase === 'idle' && (
        <div style={{ textAlign: 'center', color: '#FFF' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🌿</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, marginBottom: 8 }}>野外探索</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#DFF0D0', marginBottom: 20 }}>
            今日剩余 {remaining}/3 次<br />每次消耗 5 物资
          </div>
          <button className="pixel-btn primary" style={{ fontSize: 13 }} onClick={handleExplore} disabled={remaining <= 0}>
            🔍 探索
          </button>
          <button className="pixel-btn secondary" style={{ marginTop: 12 }} onClick={() => navigate('/pet')}>
            返回
          </button>
        </div>
      )}

      {phase === 'exploring' && (
        <div style={{ textAlign: 'center', color: '#FFF' }}>
          <div style={{ fontSize: 48, animation: 'float 0.5s ease infinite' }}>🔍</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, marginTop: 16 }}>探索中...</div>
        </div>
      )}

      {phase === 'empty' && (
        <div style={{ textAlign: 'center', color: '#FFF' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🍂</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, marginBottom: 16 }}>什么也没发现...</div>
          <button className="pixel-btn secondary" onClick={() => { setPhase('idle'); }}>继续探索</button>
          <button className="pixel-btn secondary" style={{ marginTop: 8 }} onClick={() => navigate('/pet')}>返回</button>
        </div>
      )}

      {phase === 'found' && foundPet && (
        <div style={{ textAlign: 'center', color: '#FFF' }}>
          <div style={{ fontSize: 72, animation: 'bounceIn 0.5s ease' }}>{SPECIES_EMOJI[foundPet.species]}</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 14, marginTop: 8 }}>{foundPet.species}</div>
          {isRunaway && (
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, marginTop: 4, color: '#F4BFBF' }}>
              ⚠️ 离家出走宠物！{foundPet.name}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, marginTop: 8, color: '#DFF0D0' }}>
            捕获成功率：{isRunaway ? '50%' : '70%'}
          </div>
          <button className="pixel-btn primary" style={{ marginTop: 16 }} onClick={handleCapture}>
            抓捕！（消耗5物资）
          </button>
          <button className="pixel-btn secondary" style={{ marginTop: 8 }} onClick={() => { setPhase('idle'); setFoundPet(null); }}>
            放弃
          </button>
        </div>
      )}

      {phase === 'caught' && (
        <div style={{ textAlign: 'center', color: '#FFF' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{captureSuccess ? '🎉' : '💨'}</div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, marginBottom: 8 }}>
            {captureSuccess ? '抓捕成功！' : '宠物逃跑了...'}
          </div>
          {captureSuccess && (
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#FFE4B5' }}>
              {foundPet?.species} 已加入背包！
            </div>
          )}
          <button className="pixel-btn secondary" style={{ marginTop: 16 }} onClick={() => { setPhase('idle'); setFoundPet(null); }}>
            继续探索
          </button>
          <button className="pixel-btn secondary" style={{ marginTop: 8 }} onClick={() => navigate('/pet')}>返回宠物页</button>
        </div>
      )}
    </div>
  );
}
