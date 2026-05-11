import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const SPECIES_EMOJI = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };
const MONSTERS = [
  { id: 'slime', name: '小绿泥', icon: '🟢', emoji: '🟢', hp: 40, atk: 6, def: 4, mag: 2, tier: '普通', exp: [30, 40], mats: [10, 15] },
  { id: 'golem', name: '石宝宝', icon: '🪨', emoji: '🪨', hp: 55, atk: 8, def: 8, mag: 0, tier: '普通', exp: [35, 45], mats: [12, 18] },
  { id: 'bat', name: '影蝙蝠', icon: '🦇', emoji: '🦇', hp: 35, atk: 10, def: 2, mag: 6, tier: '普通', exp: [40, 50], mats: [15, 20] },
  { id: 'firerat', name: '烈焰鼠', icon: '🐀', emoji: '🐀', hp: 80, atk: 14, def: 8, mag: 10, tier: '稀有', exp: [60, 80], mats: [20, 30] },
  { id: 'crysturtle', name: '水晶龟', icon: '🐢', emoji: '🐢', hp: 100, atk: 10, def: 18, mag: 4, tier: '稀有', exp: [70, 90], mats: [25, 35] },
  { id: 'boss', name: '巨石魔像王', icon: '🗿', emoji: '🗿', hp: 180, atk: 18, def: 16, mag: 6, tier: 'Boss', exp: [120, 160], mats: [40, 55], bonus: true },
];

export default function BattlePage() {
  const navigate = useNavigate();
  const { user, equippedPet, updateUser, addPetExp, updatePet, myPets, spendMaterials } = useApp();
  const [phase, setPhase] = useState('select'); // select | battle | result
  const [monster, setMonster] = useState(null);
  const [mHP, setMHP] = useState(0);
  const [mMaxHP, setMMaxHP] = useState(0);
  const [pHP, setPHP] = useState(0);
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  if (!equippedPet) {
    return (
      <div className="battle-scene" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#FFF', textAlign: 'center' }}>
          需要携带宠物才能战斗！
          <button className="pixel-btn secondary" style={{ marginTop: 16 }} onClick={() => navigate('/pet')}>去宠物页面</button>
        </div>
      </div>
    );
  }

  const startBattle = (m) => {
    const hp = m.hp;
    setMonster(m);
    setMHP(hp);
    setMMaxHP(hp);
    setPHP(equippedPet.hp);
    setLog([`⚔️ 遭遇了 ${m.name}！`]);
    setPhase('battle');
    setResult(null);
  };

  const handleAction = (action) => {
    if (phase !== 'battle' || result) return;

    let pDmg = 0;
    let mDmg = 0;
    let newPHP = pHP;
    let newMHP = mHP;
    const logs = [...log];

    // Player turn
    if (action === 'attack') {
      pDmg = Math.max(1, equippedPet.atk - monster.def);
      newMHP = mHP - pDmg;
      logs.push(`🗡️ 普通攻击！造成 ${pDmg} 伤害`);
    } else if (action === 'magic') {
      pDmg = Math.max(1, Math.floor(equippedPet.mag * 1.5) - monster.def);
      newMHP = mHP - pDmg;
      const hpCost = Math.floor(newPHP * 0.1);
      newPHP -= hpCost;
      logs.push(`✨ 魔法攻击！造成 ${pDmg} 伤害（消耗 ${hpCost} HP）`);
    } else if (action === 'defend') {
      logs.push('🛡️ 防御！本回合伤害减半');
    } else if (action === 'potion') {
      const potions = parseInt(localStorage.getItem('fb_potions') || '0');
      if (potions <= 0) {
        logs.push('🧪 没有回血药了！');
      } else {
        const heal = Math.floor(equippedPet.maxHp * 0.3);
        newPHP = Math.min(equippedPet.maxHp, pHP + heal);
        localStorage.setItem('fb_potions', String(potions - 1));
        logs.push(`🧪 使用回血药！恢复 ${heal} HP`);
      }
    }

    // Monster turn
    if (newMHP > 0) {
      const hpPct = newMHP / mMaxHP;
      let mAction = 'attack';
      const r = Math.random();
      if (hpPct > 0.5) mAction = r < 0.7 ? 'attack' : 'skill';
      else if (hpPct > 0.2) mAction = r < 0.5 ? 'attack' : r < 0.85 ? 'skill' : 'defend';
      else mAction = r < 0.4 ? 'attack' : r < 0.8 ? 'skill' : 'defend';

      if (mAction === 'attack') {
        mDmg = Math.max(1, monster.atk - equippedPet.def);
        if (action === 'defend') mDmg = Math.ceil(mDmg / 2);
        newPHP -= mDmg;
        logs.push(`👾 ${monster.name} 攻击！造成 ${mDmg} 伤害`);
      } else if (mAction === 'skill') {
        mDmg = Math.max(1, Math.floor(monster.mag * 1.5) - equippedPet.def);
        if (action === 'defend') mDmg = Math.ceil(mDmg / 2);
        newPHP -= mDmg;
        logs.push(`👾 ${monster.name} 技能攻击！造成 ${mDmg} 伤害`);
      } else {
        logs.push(`👾 ${monster.name} 进入防御姿态`);
      }
    }

    setMHP(Math.max(0, newMHP));
    setPHP(Math.max(0, newPHP));
    setLog(logs);

    // Check result
    if (newMHP <= 0) {
      const exp = monster.exp[0] + Math.floor(Math.random() * (monster.exp[1] - monster.exp[0]));
      const mats = monster.mats[0] + Math.floor(Math.random() * (monster.mats[1] - monster.mats[0]));
      const bonusMats = monster.bonus && Math.random() < 0.3 ? Math.floor(mats * 0.5) : 0;
      const totalMats = mats + bonusMats;
      const afterHP = Math.max(newPHP, Math.floor(equippedPet.maxHp * 0.5));
      updateUser({
        materials: (user?.materials || 0) + totalMats,
        dailyBattleCount: (user?.dailyBattleCount || 0) + 1,
        monstersDefeated: (user?.monstersDefeated || 0) + 1,
        bossesDefeated: (user?.bossesDefeated || 0) + (monster.tier === 'Boss' ? 1 : 0),
      });
      updatePet(equippedPet.id, { hp: Math.min(afterHP, equippedPet.maxHp) });
      addPetExp(equippedPet.id, exp);
      setResult({ win: true, exp, mats: totalMats, bonusMats });
      setPhase('result');
    } else if (newPHP <= 0) {
      const exp = Math.floor((monster.exp[0] + Math.floor(Math.random() * (monster.exp[1] - monster.exp[0]))) * 0.2);
      const afterHP = Math.floor(equippedPet.maxHp * 0.5);
      updateUser({ dailyBattleCount: (user?.dailyBattleCount || 0) + 1 });
      updatePet(equippedPet.id, { hp: afterHP });
      addPetExp(equippedPet.id, exp);
      setResult({ win: false, exp });
      setPhase('result');
    }
  };

  if (phase === 'select') {
    const used = user?.dailyBattleCount || 0;
    const remaining = 5 - used;
    return (
      <div className="battle-scene" style={{ justifyContent: 'flex-start', padding: 16, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#FFF' }}>⚔️ 怪物挑战</span>
          <button onClick={() => navigate('/pet')} className="pixel-btn secondary" style={{ fontSize: 9, padding: '6px 12px' }}>返回</button>
        </div>
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 9, color: '#FFE4B5', marginBottom: 12 }}>
          今日剩余 {remaining}/5 场
        </div>
        {remaining <= 0 ? (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#FFF', textAlign: 'center', padding: 40 }}>
            今日战斗次数已用完，明天再来吧！
          </div>
        ) : (
          MONSTERS.map(m => (
            <div key={m.id} className="section-card" style={{ background: 'rgba(0,0,0,0.4)', borderColor: '#8B7355', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => startBattle(m)}>
              <span style={{ fontSize: 36 }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#FFF' }}>{m.name}</div>
                <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 8, color: '#C0B0A0' }}>
                  HP:{m.hp} ATK:{m.atk} DEF:{m.def}
                </div>
                <div className="badge" style={{ marginTop: 4 }}>
                  {m.tier} | EXP {m.exp[0]}~{m.exp[1]} | 物资 {m.mats[0]}~{m.mats[1]}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // Battle phase
  if (phase === 'battle') {
    const pPct = Math.max(0, (pHP / equippedPet.maxHp) * 100);
    const mPct = Math.max(0, (mHP / mMaxHP) * 100);
    return (
      <div className="battle-scene">
        <div className="battle-field">
          <div className="battle-combatant">
            <div className="battle-sprite">{SPECIES_EMOJI[equippedPet.species]}</div>
            <div className="battle-name">{equippedPet.name} Lv.{equippedPet.level}</div>
            <div className="battle-hp-bar"><div className="battle-hp-fill" style={{ width: `${pPct}%`, background: '#C1D5A4' }} /></div>
            <div className="battle-hp-text">{pHP}/{equippedPet.maxHp}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: '#FFF' }}>VS</div>
          <div className="battle-combatant">
            <div className="battle-sprite">{monster.emoji}</div>
            <div className="battle-name">{monster.name}</div>
            <div className="battle-hp-bar"><div className="battle-hp-fill" style={{ width: `${mPct}%`, background: '#F4BFBF' }} /></div>
            <div className="battle-hp-text">{mHP}/{mMaxHP}</div>
          </div>
        </div>
        <div className="battle-log">{(log || []).slice(-3).map((l, i) => <div key={i}>{l}</div>)}</div>
        <div className="battle-actions">
          {['attack', 'magic', 'defend', 'potion'].map(a => (
            <button key={a} className="battle-action-btn" onClick={() => handleAction(a)}>
              {{ attack: '🗡️ 普通攻击', magic: '✨ 魔法攻击', defend: '🛡️ 防御', potion: '🧪 回血药' }[a]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Result
  return (
    <div className="battle-scene" style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 20, color: '#FFE4B5', marginBottom: 16 }}>
        {result.win ? '🎉 胜利！' : '💔 战败...'}
      </div>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: '#FFF', lineHeight: 2, textAlign: 'center' }}>
        {result.win ? `获得 ${result.exp} EXP + ${result.mats} 物资` : `获得 ${result.exp} EXP（安慰奖）`}
        {result.bonusMats > 0 && <div>🎁 额外掉落 {result.bonusMats} 物资！</div>}
      </div>
      <button className="pixel-btn primary" style={{ marginTop: 20 }} onClick={() => navigate('/pet')}>
        返回宠物页
      </button>
    </div>
  );
}
