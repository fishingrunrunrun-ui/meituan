import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const SPECIES_EMOJI = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };

export default function PetPage() {
  const navigate = useNavigate();
  const { equippedPet, myPets, pets, equipPet, updatePet, spendMaterials, materials, user, allUsers, allPets } = useApp();
  const [showBackpack, setShowBackpack] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showRank, setShowRank] = useState(false);

  if (!equippedPet && !showBackpack) {
    return (
      <div className="tab-page">
        <div className="tab-content">
          <div className="empty-state">
            <div className="empty-state-icon">🥚</div>
            <div className="empty-state-text">还没有宠物哦，<br />去野外探索抓一只吧！</div>
            <button className="pixel-btn primary" style={{ marginTop: 16, fontSize: 12 }} onClick={() => navigate('/explore')}>去探索</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-page" style={{ position: 'relative' }}>
      <div className="tab-content">

        {/* ===== Pet Detail ===== */}
        {equippedPet && !showBackpack && (
          <>
            {/* Pet image + name */}
            <div className="section-card highlight" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 80 }}>{SPECIES_EMOJI[equippedPet.species]}</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: '#3E2723', marginTop: 6 }}>
                {equippedPet.species} · {equippedPet.name}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 12, color: '#8B7355', marginTop: 4 }}>
                Lv.{equippedPet.level} &nbsp;|&nbsp; EXP {equippedPet.exp}/{equippedPet.level * 100}
              </div>
            </div>

            {/* Stats Panel */}
            <div className="section-card">
              <div className="section-title">属性面板</div>
              <StatRow label="生命 HP" val={equippedPet.hp} max={equippedPet.maxHp} color="#F4BFBF" />
              <StatRow label="战力 ATK" val={equippedPet.atk} max={50} color="#FFE4B5" />
              <StatRow label="防御 DEF" val={equippedPet.def} max={50} color="#C1D5A4" />
              <StatRow label="魔法 MAG" val={equippedPet.mag} max={50} color="#DDA0DD" />

              <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  ['HP +1', 5, 'hp'], ['ATK +1', 8, 'atk'], ['DEF +1', 6, 'def'], ['MAG +1', 8, 'mag'],
                ].map(([label, cost, stat]) => (
                  <button key={stat} className="stat-boost-btn" onClick={() => {
                    if (!spendMaterials(cost)) { alert('物资不足！'); return; }
                    const base = { '炎龙': { hp: 80, atk: 18, def: 6, mag: 14 }, '蘑菇': { hp: 120, atk: 8, def: 14, mag: 6 }, '魔像': { hp: 100, atk: 12, def: 12, mag: 10 } }[equippedPet.species];
                    const boost = Math.max(1, Math.floor(base[stat] * 0.05));
                    updatePet(equippedPet.id, {
                      [stat]: equippedPet[stat] + boost,
                      maxHp: stat === 'hp' ? equippedPet.maxHp + boost : equippedPet.maxHp,
                      hp: stat === 'hp' ? equippedPet.hp + boost : equippedPet.hp,
                    });
                  }}>
                    {label} ({cost}物资)
                  </button>
                ))}
              </div>
            </div>

            {/* Action Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
              <button className="pixel-btn primary" style={{ fontSize: 12, padding: 14 }} onClick={() => navigate('/battle/monster')}>
                ⚔️ 怪物挑战
              </button>
              <button className="pixel-btn primary" style={{ fontSize: 12, padding: 14 }} onClick={() => navigate('/battle/pk')}>
                🥊 宠物 PK
              </button>
              <button className="pixel-btn secondary" style={{ fontSize: 12, padding: 14 }} onClick={() => navigate('/explore')}>
                🔍 野外探索
              </button>
              <button className="pixel-btn secondary" style={{ fontSize: 12, padding: 14 }} onClick={() => setShowBackpack(true)}>
                🎒 宠物背包
              </button>
            </div>

            {/* Secondary actions */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <button className="pixel-btn secondary" style={{ flex: 1, fontSize: 11 }} onClick={() => setShowShop(true)}>
                🛒 物资商店
              </button>
              <button className="pixel-btn secondary" style={{ flex: 1, fontSize: 11 }} onClick={() => setShowRank(true)}>
                🏆 排行榜
              </button>
            </div>

            {/* Resources */}
            <div className="section-card" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#8B7355' }}>
                💰 物资：{materials} &nbsp;|&nbsp;
                ⚔️ 战斗：{user?.dailyBattleCount || 0}/5 &nbsp;|&nbsp;
                🔍 探索：{user?.dailyExploreCount || 0}/3
              </div>
            </div>
          </>
        )}

        {/* ===== Backpack ===== */}
        {showBackpack && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>🎒 宠物背包</div>
              <button onClick={() => setShowBackpack(false)} className="pixel-btn secondary" style={{ fontSize: 11, padding: '8px 16px' }}>返回</button>
            </div>
            <div className="pet-grid">
              {myPets.map(p => (
                <div key={p.id} className={`pet-grid-item ${p.isEquipped ? 'equipped' : ''}`} onClick={() => { equipPet(p.id); setShowBackpack(false); }}>
                  <div className="pet-grid-emoji">{SPECIES_EMOJI[p.species]}</div>
                  <div className="pet-grid-name">{p.species} · {p.name}</div>
                  <div className="pet-grid-level">Lv.{p.level}</div>
                  {p.isEquipped && <div className="badge" style={{ marginTop: 6 }}>携带中</div>}
                </div>
              ))}
              {pets.filter(p => p.isRunaway).map(p => (
                <div key={p.id} className="pet-grid-item" style={{ opacity: 0.4 }}>
                  <div className="pet-grid-emoji">❓</div>
                  <div className="pet-grid-name">{p.name}</div>
                  <div className="pet-grid-level" style={{ color: '#E0745C' }}>离家出走</div>
                </div>
              ))}
            </div>
            {myPets.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🎒</div>
                <div className="empty-state-text">背包空空，去野外探索抓宠物吧！</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Shop Modal ===== */}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}

      {/* ===== Ranking Modal ===== */}
      {showRank && (
        <div className="shop-overlay" onClick={() => setShowRank(false)}>
          <div className="shop-modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '70%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#6B3A2E' }}>🏆 排行榜</span>
              <button onClick={() => setShowRank(false)} style={{ fontFamily: 'var(--font-pixel)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            {allUsers.sort((a, b) => {
              const expA = allPets.filter(p => p.ownerId === a.id).reduce((s, p) => s + p.exp, 0);
              const expB = allPets.filter(p => p.ownerId === b.id).reduce((s, p) => s + p.exp, 0);
              return expB - expA;
            }).slice(0, 10).map((u, i) => {
              const totalExp = allPets.filter(p => p.ownerId === u.id).reduce((s, p) => s + p.exp, 0);
              return (
                <div key={u.id} className="rank-row" style={{ background: u.id === user?.id ? 'rgba(255,228,181,0.35)' : 'transparent', borderRadius: 4 }}>
                  <span className="rank-num">{i + 1}</span>
                  <span className="rank-avatar">👤</span>
                  <span className="rank-name">{u.nickname}{u.id === user?.id ? ' (你)' : ''}</span>
                  <span className="rank-exp">{totalExp} EXP</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, val, max, color }) {
  const pct = Math.min(100, (val / Math.max(max, 1)) * 100);
  return (
    <div className="pet-stat-row">
      <span className="pet-stat-label">{label}</span>
      <div className="pet-stat-bar-wrap">
        <div className="pet-stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="pet-stat-val">{val}/{max}</span>
    </div>
  );
}

function ShopModal({ onClose }) {
  const { spendMaterials, materials, addPet, user, createPet, updatePet, equippedPet } = useApp();
  const [msg, setMsg] = useState('');

  const buy = (item) => {
    if (item === 'potion') {
      if (!spendMaterials(10)) { setMsg('物资不足！'); return; }
      const count = parseInt(localStorage.getItem('fb_potions') || '0') + 1;
      localStorage.setItem('fb_potions', String(count));
      setMsg(`购买成功！回血药 ×${count}`);
    } else if (item === 'egg') {
      if (!spendMaterials(50)) { setMsg('物资不足！'); return; }
      const species = ['炎龙', '蘑菇', '魔像'][Math.floor(Math.random() * 3)];
      const pet = createPet(user.id, species, species);
      pet.isEquipped = false;
      addPet(pet);
      setMsg(`获得 ${species}！`);
    } else if (item === 'rename') {
      if (!spendMaterials(20)) { setMsg('物资不足！'); return; }
      const name = prompt('请输入新名字（限8字符）：');
      if (name?.trim()) {
        updatePet(equippedPet.id, { name: name.trim().slice(0, 8) });
        setMsg('改名成功！');
      }
    }
  };

  return (
    <div className="shop-overlay" onClick={onClose}>
      <div className="shop-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, color: '#6B3A2E' }}>🛒 物资商店</span>
          <button onClick={onClose} style={{ fontFamily: 'var(--font-pixel)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#8B7355', marginBottom: 14 }}>💰 持有物资：{materials}</div>
        {msg && <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#6B3A2E', marginBottom: 10, background: '#FFE4B5', padding: 10, borderRadius: 6 }}>{msg}</div>}
        {[
          { icon: '🧪', name: '回血药 ×1', cost: 10, key: 'potion' },
          { icon: '🎲', name: '随机宠物蛋', cost: 50, key: 'egg' },
          { icon: '📛', name: '改名卡', cost: 20, key: 'rename' },
        ].map(item => (
          <div key={item.key} className="shop-item" onClick={() => buy(item.key)}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#3E2723' }}>{item.name}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#8B7355' }}>{item.cost} 物资</span>
          </div>
        ))}
      </div>
    </div>
  );
}
