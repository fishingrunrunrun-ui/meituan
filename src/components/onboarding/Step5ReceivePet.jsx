import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../hooks/OnboardingContext';
import { useApp } from '../../context/AppContext';

const speciesList = ['炎龙', '蘑菇', '魔像'];
const speciesEmoji = { '炎龙': '🦎', '蘑菇': '🍄', '魔像': '🗿' };

export default function Step5ReceivePet() {
  const { data, updateData } = useOnboarding();
  const { initUser } = useApp();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('egg');
  const [petSpecies, setPetSpecies] = useState(null);
  const [particles, setParticles] = useState([]);
  const [petName, setPetName] = useState('');
  const [initialized, setInitialized] = useState(false);

  const spawnParticles = useCallback(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const dist = 60 + Math.random() * 80;
      newParticles.push({
        id: i,
        tx: Math.cos(angle) * dist + 'px',
        ty: Math.sin(angle) * dist + 'px',
        bg: ['#FFE4B5', '#F4BFBF', '#C1D5A4', '#FFD700', '#FFA07A'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.2 + 's',
        duration: 0.5 + Math.random() * 0.5 + 's',
      });
    }
    setParticles(newParticles);
  }, []);

  const handleEggClick = () => {
    if (phase !== 'egg') return;

    // Start hatching
    setPhase('hatching');

    setTimeout(() => {
      setPhase('cracked');
    }, 800);

    setTimeout(() => {
      // Pick random species
      const species = speciesList[Math.floor(Math.random() * speciesList.length)];
      setPetSpecies(species);
      updateData({ petSpecies: species });
      spawnParticles();
      setPhase('revealed');
    }, 1500);
  };

  const handleNameConfirm = () => {
    if (!petName.trim()) return;
    const name = petName.trim();
    updateData({ petName: name });
    setPhase('named');
  };

  const handleStartAdventure = () => {
    if (!initialized) {
      const fullData = { ...data, petName: petName.trim(), petSpecies };
      initUser(fullData);
      setInitialized(true);
    }
    navigate('/home');
  };

  return (
    <div className="page-enter">
      {phase === 'named' ? (
        <div className="pet-egg-scene">
          <div className="pet-reveal" style={{ textAlign: 'center' }}>
            <div className="pet-sprite-large">{speciesEmoji[petSpecies]}</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: 'var(--dark-brown)', marginTop: 12 }}>
              {petSpecies} · {petName}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--wood-brown)', marginTop: 6 }}>
              Lv.1
            </div>
            <div className="welcome-text" style={{ marginTop: 20 }}>
              「快带我去打倒怪物叭！」
            </div>
            <button
              className="pixel-btn primary"
              style={{ marginTop: 28 }}
              onClick={handleStartAdventure}
            >
              开始冒险！
            </button>
          </div>
        </div>
      ) : phase === 'revealed' ? (
        <div className="pet-egg-scene">
          <div className="pet-reveal">
            <div className="pet-sprite-large">{speciesEmoji[petSpecies]}</div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 15, color: 'var(--dark-brown)', marginTop: 10 }}>
              {petSpecies}
            </div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--wood-brown)', marginTop: 4 }}>
              物种已确定！给它取个名字吧~
            </div>
          </div>

          <div className="pet-name-input">
            <input
              className="pixel-input"
              type="text"
              placeholder="为宠物取名（限8字符）"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              maxLength={8}
              autoFocus
            />
            <div style={{ textAlign: 'right', fontSize: 10, color: '#A09080', marginTop: 4 }}>
              {petName.length}/8
            </div>
          </div>

          <button
            className="pixel-btn primary"
            style={{ marginTop: 20 }}
            disabled={!petName.trim()}
            onClick={handleNameConfirm}
          >
            确认名字 ✓
          </button>
        </div>
      ) : (
        <div className="pet-egg-scene">
          <div
            className={`egg-container ${phase === 'hatching' ? 'hatching' : ''} ${phase === 'cracked' ? 'cracked' : ''}`}
            onClick={handleEggClick}
          >
            <div className="egg-glow" />
            <div className="egg-sprite">
              <div className="egg-body">
                <div className="egg-shine" />
                <div className="egg-spots">
                  <div className="egg-spot" />
                  <div className="egg-spot" style={{ width: 8, height: 8 }} />
                  <div className="egg-spot" style={{ width: 10, height: 10 }} />
                </div>
                <div className="egg-crack" />
              </div>
            </div>

            {particles.length > 0 && (
              <div className="particles-container">
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="particle"
                    style={{
                      '--tx': p.tx,
                      '--ty': p.ty,
                      background: p.bg,
                      animationDelay: p.delay,
                      animationDuration: p.duration,
                      width: 6 + Math.random() * 8 + 'px',
                      height: 6 + Math.random() * 8 + 'px',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="egg-hint">
            {phase === 'egg' ? '✨ 点击领取免费宠物 ✨' :
             phase === 'hatching' ? '蛋壳在震动...' :
             '快要孵化了！'}
          </div>
        </div>
      )}
    </div>
  );
}
