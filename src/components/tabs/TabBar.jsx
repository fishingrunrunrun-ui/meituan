import { useApp } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { label: '首页', icon: '🏠', route: '/home' },
  { label: '记录', icon: '📋', route: '/record' },
  { label: '宠物', icon: '🐾', route: '/pet' },
  { label: '社交', icon: '👥', route: '/social' },
  { label: '我的', icon: '👤', route: '/profile' },
];

export default function TabBar() {
  const { setActiveTab } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const current = tabs.findIndex(t => location.pathname.startsWith(t.route));

  const handleTab = (idx) => {
    setActiveTab(idx);
    navigate(tabs[idx].route);
  };

  return (
    <div style={{
      display: 'flex',
      height: 56,
      flexShrink: 0,
      background: '#FFFAF0',
      borderTop: '3px solid #6B3A2E',
      boxShadow: '0 -2px 8px rgba(107,58,46,0.1)',
    }}>
      {tabs.map((t, i) => {
        const active = i === current;
        return (
          <button
            key={t.route}
            onClick={() => handleTab(i)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              border: 'none',
              background: active ? 'rgba(255,228,181,0.6)' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontSize: 9,
              color: active ? '#6B3A2E' : '#A09080',
              transition: 'all 0.15s',
              borderTop: active ? '3px solid #6B3A2E' : '3px solid transparent',
              marginTop: -3,
              padding: '0 4px',
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
